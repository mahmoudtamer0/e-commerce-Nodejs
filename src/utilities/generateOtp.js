const crypto = require("crypto");

const generateOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedOtp = crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");

    const expires = Date.now() + 1 * 60 * 1000;

    return { otp, hashedOtp, expires };
};

module.exports = generateOTP;