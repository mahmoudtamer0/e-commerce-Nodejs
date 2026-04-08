const Product = require("./products.schema")
const ProductType = require("./productType.schema")
const Category = require("../category/category.schema")
const { generateFinalPrice } = require("../../utilities/generatFinalPrice")

const catchAsync = require("../../utilities/catchAsync");
const ApiError = require("../../utilities/ApiError");


const getAllProducts = catchAsync(async (req, res, next) => {


    const {
        category,
        minPrice,
        maxPrice,
        search,
        sort,
        type
    } = req.query;
    let filter = {}
    let toSort = {}

    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const skip = (page - 1) * limit


    if (category && category != "") {
        const findCat = await Category.findOne({ name: category })
        if (findCat) {
            filter.category = findCat._id
        } else {
            filter.category = ""
        }
    }

    if (minPrice || maxPrice) {
        filter.finalPrice = {};
        if (minPrice) filter.finalPrice.$gte = Number(minPrice);
        if (maxPrice) filter.finalPrice.$lte = Number(maxPrice);
    }

    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } }
        ];
    }

    if (type) {
        const findType = await ProductType.findOne({ name: type })

        if (findType) {
            filter.type = findType._id
        } else {
            filter.type = ""
        }
    }

    if (sort) {
        if (sort == "best-selling" || sort == "Most Popular") {
            toSort = { buys: -1 }
        } else if (sort == "on-sale") {
            toSort = { discount: -1 }
        } else if (sort == "Newest") {
            toSort = { updatedAt: -1 }
        } else if (sort == "Low to High") {
            toSort = { finalPrice: +1 }
        } else if (sort == "High to Low") {
            toSort = { finalPrice: -1 }
        } else {
            toSort = { updatedAt: -1 }
        }
    } else {
        toSort = { updatedAt: -1 }
    }

    const products = await Product.find(filter)
        .skip(skip)
        .limit(Number(limit))
        .populate("category", "name")
        .sort(toSort)
        .select("-createdAt -updatedAt -__v")
        .lean()
    const total = await Product.countDocuments(filter)

    return res.status(200).json({
        status: "success",
        results: products.length,
        data: products,
        totalProducts: total,
        totalPages: Math.ceil(total / limit),
        page
    })

})

const getProduct = catchAsync(async (req, res, next) => {


    const { prodId } = req.params;

    const product = await Product.findById(prodId)

    if (!product) {
        return next(new ApiError(404, "not found"));
    }

    return res.status(200).json({
        status: "success",
        data: product
    })

})


const addManyProducts = catchAsync(async (req, res, next) => {
    const products = req.body

    await Product.insertMany(products)


    return res.status(200).json({
        status: "success",
        data: "done"
    })
})


const addProduct = catchAsync(async (req, res, next) => {


    const { title, description, originalPrice, discount, category, stock, buys } = req.body

    let productImages = []

    const finalPrice = await generateFinalPrice(Number(originalPrice), Number(discount))
    const prod = await Product.create({
        title,
        description,
        originalPrice: Number(originalPrice),
        finalPrice: Number(finalPrice),
        discount: Number(discount),
        category,
        stock,
        buys,

    })

    if (req.files && req.files.length > 0) {
        prod.productImages = req.files.map(img => {
            return {
                url: img.path,
                cloudinary_id: img.filename
            }
        })

        await prod.save()
    }


    return res.status(200).json({
        status: "success",
        data: prod
    })


})

const updateProducts = catchAsync(async (req, res, next) => {

    const fs = require("fs");
    const path = require("path");
    const { variants, title, description, originalPrice, discount } = req.body
    const prodId = req.params.prodId
    const existingProduct = await Product.findById(prodId)
    let updatedImages = existingProduct.productImages
    if (!existingProduct) return next(new ApiError(404, "not found this product"));


    if (req.body.deleteImages) {
        const imagesToDelete = Array(req.body.deleteImages)
        imagesToDelete.forEach(deleteImage => {
            if (existingProduct.productImages.includes(deleteImage)) {
                const imagePath = path.join(__dirname, "..", "uploads/products", deleteImage);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
                updatedImages = updatedImages.filter(img => img != deleteImage)
            }
        });
    }

    if (req.files && req.files.length > 0) {
        let newImages = req.files.map(img => img.filename)

        updatedImages = [...updatedImages, ...newImages]
    }

    if (title) {
        existingProduct.title = title;
        await existingProduct.save()
    }

    if (description) {
        existingProduct.description = description;
        await existingProduct.save()
    }

    if (originalPrice || discount) {

        const newOriginalPrice = originalPrice != undefined ? Number(originalPrice) : existingProduct.originalPrice
        const newDiscount = discount != undefined ? Number(discount) : existingProduct.discount

        existingProduct.finalPrice = await generateFinalPrice(Number(newOriginalPrice), Number(newDiscount));
        existingProduct.discount = newDiscount
        existingProduct.originalPrice = newOriginalPrice

        await existingProduct.save()
    }

    if (variants) {

        for (let newVar of variants) {
            const existing = existingProduct.variants.find(
                v => v.size === newVar.size
            );

            if (existing) {
                existing.stock = newVar.stock;
            } else {
                existingProduct.variants.push(newVar);
            }
        }

        await existingProduct.save()
    }


    // const updatedProduct = await Product.findByIdAndUpdate(prodId, {
    //     ...req.body,
    //     originalPrice: originalPrice,
    //     discount: discount,
    //     finalPrice: finalPrice,
    //     productImages: updatedImages
    // }, { new: true })


    return res.status(200).json({
        status: "success",
        data: existingProduct
    })


})

const deleteProduct = catchAsync(async (req, res, next) => {

    const prodId = req.params.prodId
    const fs = require("fs");
    const path = require("path");
    const product = await Product.findById(prodId)

    if (!product) {
        return res.status(404).json({
            status: "failed",
            message: "Product not found"
        });
    }

    product.productImages.forEach(img => {
        const imagePath = path.join(__dirname, "..", "uploads/products", img)

        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(img)
        }
    })

    await Product.findByIdAndDelete(prodId);

    return res.status(200).json({
        status: "success",
        data: null
    })


})

const calculateCart = catchAsync(async (req, res, next) => {

    const { cart } = req.body;

    if (!cart) {
        return next(new ApiError(400, "cart required"));
    }

    let subTotal = 0;
    let delivery = 20;
    let tax = 0.14;

    const products = await Product.find({
        _id: { $in: cart.map(item => item.id) }
    });

    let newItems = [];

    for (let i = 0; i < cart.length; i++) {
        const item = cart[i]
        const product = products[i];
        console.log("product:", product)
        if (!product) {
            return next(new ApiError(404, "not found this product"));
        }
        if (!item.quantity || item.quantity < 1) {
            return next(new ApiError(400, "quantity required"));
        }
        subTotal = item.quantity * product.finalPrice;

        newItems.push({
            id: product.id,
            title: product.title,
            productImage: product.productImages[0].url,
            quantity: item.quantity,
            size: item.size,
            discount: product.discount,
            originalPrice: product.originalPrice * item.quantity,
            totalPrice: item.quantity * product.finalPrice
        })

    }

    const total = subTotal + delivery;

    const totalCart = total + (total * tax);

    return res.status(200).json({
        status: "success",
        newItems,
        subTotal,
        delivery,
        tax,
        totalCart
    })

})



module.exports = {
    getAllProducts,
    addProduct,
    updateProducts,
    deleteProduct,
    addManyProducts,
    getProduct,
    calculateCart
}