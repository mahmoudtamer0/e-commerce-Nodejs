const ApiError = require("./ApiError");
const checkBanStatus = async (user) => {

    if (user.status != "banned") return;

    if (user.banExpiresAt && new Date() > user.banExpiresAt) {
        user.status = "active";
        user.banExpiresAt = null;
        await user.save();
        return;
    }

    throw new ApiError(403, "Account is temporarily banned");
};

module.exports = { checkBanStatus }