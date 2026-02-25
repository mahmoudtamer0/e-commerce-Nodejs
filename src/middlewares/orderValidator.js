const mongoose = require("mongoose");
const catchAsync = require("../utilities/catchAsync");
const ApiError = require("../utilities/ApiError");

const orderValidator = catchAsync(async (req, res, next) => {


    const { shippingAddress, paymentMethod, items } = req.body;

    // items لازم تكون array ومش فاضية
    if (!Array.isArray(items) || items.length === 0) {
        return next(new ApiError(400, "Order must contain at least one item"));
    }

    // التحقق من كل item
    for (const item of items) {
        if (!item.productId || !mongoose.Types.ObjectId.isValid(item.productId)) {
            return next(new ApiError(400, "Invalid productId"));
        }

        if (
            !item.quantity ||
            typeof item.quantity !== "number" ||
            item.quantity <= 0
        ) {
            return next(new ApiError(400, "Quantity must be greater than 0"));
        }
    }

    // shippingAddress
    if (!shippingAddress || typeof shippingAddress !== "object") {
        return next(new ApiError(400, "Shipping address is required"));
    }

    // paymentMethod
    const allowedMethods = ["cash", "card"];
    if (!paymentMethod || !allowedMethods.includes(paymentMethod)) {
        return next(new ApiError(400, "Invalid payment method"));
    }

    next();



})


module.exports = {
    orderValidator
}