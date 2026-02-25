const jwt = require("jsonwebtoken")
const User = require("../modules/user/user.schema")
const { checkBanStatus } = require("../utilities/checkBanned")
const catchAsync = require("../utilities/catchAsync");
const ApiError = require("../utilities/ApiError");

const verifyToken = catchAsync(async (req, res, next) => {

    const headers = req.headers["authorization"]

    if (!headers || !headers.startsWith("Bearer ")) {
        return next(new ApiError(401, "No token provided"));
    }

    const token = headers.split(" ")[1]



    let decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return next(new ApiError(401, "Session expired. Please login again."));
        }
        return next(new ApiError(403, "Invalid token"));
    }

    const user = await User.findById(decoded.id);

    await checkBanStatus(user);

    req.user = decoded;
    next();
})

module.exports = verifyToken