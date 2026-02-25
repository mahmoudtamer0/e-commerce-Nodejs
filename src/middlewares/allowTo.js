const ApiError = require("../utilities/ApiError");

module.exports = (...roles) => {

    return (req, res, next) => {
        const userRole = req.user.role
        if (!roles.includes(userRole)) {
            return next(new ApiError(401, "you are not eligible to do this"));
        }

        next()
    }

}