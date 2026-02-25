const validator = require("validator")
const catchAsync = require("../utilities/catchAsync");
const ApiError = require("../utilities/ApiError");
const productsValidator = catchAsync(async (req, res, next) => {


    const { title, description, originalPrice, discount, category } = req.body

    if (
        !title || title.length < 2 ||
        !description || description.length < 10 ||
        !originalPrice || isNaN(originalPrice) || Number(originalPrice) <= 0 ||
        discount === undefined || isNaN(discount) || Number(discount) < 0 || Number(discount) > 100 ||
        !category
    ) {


        return next(new ApiError(400, "invalid product data"));
    }

    next();



})

const productsUpdateValidator = catchAsync(async (req, res, next) => {


    const {
        title,
        description,
        originalPrice,
        discount,
        stock,
        category
    } = req.body;

    if (title && title.trim().length < 3) {

        return next(new ApiError(400, "Title must be at least 3 characters"));
    }


    if (description && description.trim().length < 10) {
        return next(new ApiError(400, "Description must be at least 10 characters"));
    }


    if (originalPrice !== undefined) {
        if (!validator.isNumeric(originalPrice.toString()) || Number(originalPrice) < 0) {
            return next(new ApiError(400, "Invalid original price"));
        }
    }


    if (discount !== undefined) {
        if (!validator.isNumeric(discount.toString()) ||
            Number(discount) < 0 ||
            Number(discount) > 100) {
            return next(new ApiError(400, "Discount must be between 0 and 100"));
        }
    }


    if (stock !== undefined) {
        if (!Number.isInteger(Number(stock)) || Number(stock) < 0) {
            return next(new ApiError(400, "Stock must be a positive number"));
        }
    }


    if (category && !validator.isMongoId(category)) {
        return next(new ApiError(400, "Invalid category id"));

    }

    next();
})

module.exports = {
    productsValidator,
    productsUpdateValidator
}