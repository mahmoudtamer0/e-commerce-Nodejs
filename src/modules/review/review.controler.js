const Product = require("../product/products.schema")
const Order = require("../order/order.schema")
const OrderItem = require("../order/orderItems.schema")
const Review = require("./review.schema")

const catchAsync = require("../../utilities/catchAsync");
const ApiError = require("../../utilities/ApiError");




const addReview = catchAsync(async (req, res, next) => {
    const { prodId } = req.params
    const user = req.user
    const { comment, rate } = req.body

    const orders = await Order.find({ user: user.id })
    const product = await Product.findById(prodId)

    if (!product) {
        return next(new ApiError(404, "product not found"));
    }

    if (orders.length == 0) {
        return next(new ApiError(404, "the user didn't purchase any product"));
    }


    const purchasedProduct = await OrderItem.findOne({
        order: { $in: orders.map(order => order._id) },
        product: product._id
    })

    if (!purchasedProduct) {
        return next(new ApiError(400, "the user didn't purchase this product"));
    }

    if (!rate || Number(rate) > 5 || Number(rate) < 1) {
        return next(new ApiError(400, "rate must be between 1 - 5"));
    }

    const userAdded = await Review.findOne({
        user: user.id,
        product: product._id
    })

    if (userAdded) {
        return next(new ApiError(400, "you already have a review on this product"));
    }

    await Review.create({
        product: purchasedProduct.product,
        user: user.id,
        rate: Number(rate),
        comment
    })



    const productReviews = await Review.aggregate([
        {
            $match: { product: product._id }
        },
        {
            $group: {
                _id: "$product",
                avgRate: { $avg: "$rate" },
                count: { $sum: 1 }
            }
        }
    ]);

    if (productReviews.length > 0) {
        product.averageRate = productReviews[0].avgRate;
        product.ratingsQuantity = productReviews[0].count;
    } else {
        product.averageRate = 5;
        product.ratingsQuantity = 0;
    }

    await product.save()

    res.status(200).json({
        status: "success",
        data: null
    })
})


module.exports = {
    addReview
}