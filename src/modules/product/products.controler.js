const Product = require("./products.schema")
const { generateFinalPrice } = require("../../utilities/generatFinalPrice")

const catchAsync = require("../../utilities/catchAsync");
const ApiError = require("../../utilities/ApiError");


const getAllProducts = catchAsync(async (req, res, next) => {


    const {
        category,
        minPrice,
        maxPrice,
        search,
        page,
        limit,
    } = req.query;
    let filter = {}


    if (category) {
        filter.category = category;
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


    const skip = (page - 1) * limit



    const products = await Product.find(filter)
        .skip(skip)
        .limit(Number(limit))
        .populate("category", "name")
        .sort({ updatedAt: -1 })
        .select("-createdAt -updatedAt -__v")
        .lean()
    return res.status(200).json({
        status: "success",
        data: products
    })

})


const addProduct = catchAsync(async (req, res, next) => {


    const { title, description, originalPrice, discount, category, stock, buys } = req.body

    let productImages = []

    if (req.files && req.files.length > 0) {
        productImages = req.files.map(img => img.filename)
    }
    const finalPrice = await generateFinalPrice(Number(originalPrice), Number(discount))
    const prod = new Product({
        title,
        description,
        originalPrice: Number(originalPrice),
        finalPrice: Number(finalPrice),
        discount: Number(discount),
        category,
        stock,
        buys,
        productImages
    })
    await prod.save()

    return res.status(200).json({
        status: "success",
        data: prod
    })


})

const updateProducts = catchAsync(async (req, res, next) => {

    const fs = require("fs");
    const path = require("path");
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

    const originalPrice = req.body.originalPrice != undefined ? Number(req.body.originalPrice) : existingProduct.originalPrice
    const discount = req.body.discount != undefined ? Number(req.body.discount) : existingProduct.discount

    const finalPrice = await generateFinalPrice(originalPrice, discount);


    const updatedProduct = await Product.findByIdAndUpdate(prodId, {
        ...req.body,
        originalPrice: originalPrice,
        discount: discount,
        finalPrice: finalPrice,
        productImages: updatedImages
    }, { new: true })


    return res.status(200).json({
        status: "success",
        data: updatedProduct
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



module.exports = {
    getAllProducts,
    addProduct,
    updateProducts,
    deleteProduct
}