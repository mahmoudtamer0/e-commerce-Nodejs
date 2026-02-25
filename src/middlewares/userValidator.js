const validator = require("validator")
const catchAsync = require("../utilities/catchAsync");
const ApiError = require("../utilities/ApiError");
const userValidator = catchAsync(async (req, res, next) => {


    const { name, email, password } = req.body

    if (!validator.isEmail(email)) {
        return next(new ApiError(400, "Invalid email"));
    }

    if (!validator.isStrongPassword(password, {
        minLength: 5,
        minNumbers: 1,
        minSymbols: 0,
    })) {
        return next(new ApiError(400, "weak password"));
    }

    if (validator.isEmpty(name.trim()) || name.trim().length < 2) {
        return next(new ApiError(400, "Name required"));
    }



    next();

})

const loginValidator = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !validator.isEmail(email)) {
        return next(new ApiError(400, "Invalid email"));
    }

    if (!password) {
        return next(new ApiError(400, "Password required"));
    }

    next();
};

const updateValidator = (req, res, next) => {
    const { name, email, password } = req.body;

    if (email && !validator.isEmail(email)) {
        return next(new ApiError(400, "Invalid email"));
    }

    if (password && !validator.isStrongPassword(password, {
        minLength: 5,
        minNumbers: 1,
        minSymbols: 0,
    })) {
        return next(new ApiError(400, "Weak password"));
    }

    if (name && name.trim().length < 2) {
        return next(new ApiError(400, "Invalid name"));

    }

    next();
};


module.exports = {
    userValidator,
    loginValidator,
    updateValidator
}