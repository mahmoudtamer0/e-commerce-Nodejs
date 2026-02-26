const User = require("./user.schema")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { generateAccessToken, generateRefreshToken } = require("../../utilities/generatToken")
const Session = require("./Session.schema");
const catchAsync = require("../../utilities/catchAsync");
const ApiError = require("../../utilities/ApiError");
const { checkBanStatus } = require("../../utilities/checkBanned");
const generateOTP = require("../../utilities/generateOtp");
const sendEmail = require("../../utilities/sendEmails");


const register = catchAsync(async (req, res, next) => {


    const { name, email, password } = req.body
    const { otp, hashedOtp, expires } = generateOTP()
    let imageName = "../uploads/image.png";
    let posts = []

    const findUser = await User.findOne({ email: email })
    if (findUser && findUser.isEmailVerified == true) {
        return next(new ApiError(400, "this email already is use"));
    }
    const hash = await bcrypt.hash(password, 10)
    if (findUser && findUser.isEmailVerified == false) {
        findUser.name = name
        findUser.password = hash
        findUser.emailVerificationCode = hashedOtp;
        findUser.emailVerificationExpires = expires;
        await findUser.save()
    } else {
        const user = new User({
            name: name,
            email: email,
            password: hash,
            image: imageName,
            posts: posts,
            emailVerificationCode: hashedOtp,
            emailVerificationExpires: expires,
        })
        await user.save()
    }
    console.log(process.env.EMAIL_USER)
    console.log(process.env.EMAIL_PASS ? "PASS EXISTS" : "NO PASS")
    try {
        await sendEmail({
            email: email,
            subject: "Verify your email",
            message: `
                    <h2>Email Verification</h2>
                    <p>Your verification code is:</p>
                    <h1>${otp}</h1>
                    <p>This code expires in 10 minutes.</p>
                    `,
        });
        return res.status(201).json({
            status: "success",
            msg: "OTP sent to your email"
        })

    } catch (err) {
        console.error(err);
        return next(new ApiError(500, "Email failed to send"));
    }

    return res.status(201).json({
        status: "success",
        msg: "OTP sent to your email"
    })
    // await sendEmail({
    //     email: email,
    //     subject: "Verify your email",
    //     message: `
    //             <h2>Email Verification</h2>
    //             <p>Your verification code is:</p>
    //             <h1>${otp}</h1>
    //             <p>This code expires in 10 minutes.</p>
    //             `,
    // });

    // if (req.files && req.files.image) {
    //     imageName = req.files.image[0].filename;
    // }


    // if (req.files && req.files.posts) {
    //     posts = req.files.posts.map(post => post.filename);
    // }



    // const accesstoken = generateAccessToken(user.email, user._id, user.role)
    // const refreshToken = generateRefreshToken(user._id)

    // res.cookie("refreshToken", refreshToken, {
    //     httpOnly: true,
    //     secure: false,
    //     sameSite: "lax",
    //     maxAge: 7 * 24 * 60 * 60 * 1000
    // });
    // await Session.create({
    //     userId: user._id,
    //     refreshToken: refreshToken,
    //     device: req.headers["user-agent"]
    // });
})

const verifyEmail = catchAsync(async (req, res, next) => {
    const crypto = require("crypto");
    const { otp, email } = req.body
    const hashedOtp = crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");


    if (!otp || !email) {
        return res.status(400).json({ message: "email and otp required" });
    }

    const user = await User.findOne({
        email,
        emailVerificationCode: hashedOtp,
        emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
        return res.status(400).json({ message: "Invalid or expired code" });
    }

    user.isEmailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();


    const accesstoken = generateAccessToken(user.email, user._id, user.role)
    const refreshToken = generateRefreshToken(user._id)

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
    await Session.create({
        userId: user._id,
        refreshToken: refreshToken,
        device: req.headers["user-agent"]
    });

    res.json({ message: "Email verified successfully", accesstoken });

})


const login = catchAsync(async (req, res, next) => {


    const { email, password } = req.body
    const findUser = await User.findOne({ email: email })

    if (!findUser) {
        return next(new ApiError(404, "user not found"));
    }

    if (findUser.isEmailVerified != true) {
        return next(new ApiError(401, "email not veryfied"));
    }
    const checkPass = await bcrypt.compare(password, findUser.password)

    if (!checkPass) {
        return next(new ApiError(401, "email or password not correct"));
    }
    await checkBanStatus(findUser)
    const accesstoken = generateAccessToken(findUser.email, findUser._id, findUser.role)
    const refreshToken = generateRefreshToken(findUser._id)
    await Session.create({
        userId: findUser._id,
        refreshToken: refreshToken,
        device: req.headers["user-agent"]
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
        status: "success",
        accesstoken
    })

})

const refreshTokenController = catchAsync(async (req, res, next) => {

    const token = req.cookies.refreshToken;

    if (!token) {
        return next(new ApiError(401, "No refresh token"));
    }

    const session = await Session.findOne({
        refreshToken: req.cookies.refreshToken
    });

    if (!session) {
        return next(new ApiError(401, "Session expired. Please login again."));
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {

        if (err) {
            if (err.name == "TokenExpiredError") {
                return next(new ApiError(401, "Session expired. Please login again."));
            }

            return next(new ApiError(403, "Invalid refresh token"));
        }

        const user = await User.findById(decoded.id);

        if (!user) {
            return next(new ApiError(404, "User not found" + decoded.id));
        }
        if (user.status == "banned") {
            return next(new ApiError(403, "Account is temporarily banned"));
        }

        const newAccessToken = generateAccessToken(user.email, user.id, user.role);

        return res.status(200).json({
            accessToken: newAccessToken
        });

    });

});

const logout = catchAsync(async (req, res) => {

    const token = req.cookies.refreshToken;

    if (token) {
        await Session.deleteOne({ refreshToken: token });
    }

    res.clearCookie("refreshToken");

    res.status(200).json({
        message: "Logged out successfully"
    });

});

const logoutAllDevices = catchAsync(async (req, res) => {

    await Session.deleteMany({
        userId: req.user.id
    });

    res.clearCookie("refreshToken");

    res.status(200).json({
        message: "Logged out from all devices"
    });

});

const changePassword = catchAsync(async (req, res, next) => {

    const { oldPassword, newPassword } = req.body
    const userId = req.user.id


    const user = await User.findById(userId)


    const checkOldPassword = await bcrypt.compare(oldPassword, user.password)

    if (!checkOldPassword) {
        return next(new ApiError(401, "old password not correct"));
    }

    user.password = await bcrypt.hash(newPassword, 10)

    await user.save()

    next()

})


const userProfile = catchAsync(async (req, res, next) => {

    const baseUrl = `${req.protocol}://${req.get("host")}`
    const userId = req.user.id

    const user = await User.findById(userId).select("-password -__v -createdAt -updatedAt -role")

    const userRes = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: `${baseUrl}/uploads/${user.image}`,
        posts: user.posts?.map(post => `${baseUrl}/uploads/${encodeURIComponent(post)}`) || []
    }

    return res.status(200).json(userRes)
})

const updateProfile = catchAsync(async (req, res, next) => {

    const fs = require("fs");
    const path = require("path");
    const { name, deleteImage, replaceImage, deletePosts, addPosts } = req.body
    const userId = req.user.id
    const user = await User.findById(userId)
    if (name) {
        user.name = name
    }

    if (deleteImage == true || deleteImage == "true" && user.image) {
        const imagePath = path.join(__dirname, "..", "uploads", user.image);

        fs.unlink(imagePath, () => { });
        user.image = "default.png";
    }

    if (replaceImage && req.files?.image) {
        if (user.image && user.image !== "default.png") {
            const imagePath = path.join(__dirname, "..", "uploads", user.image);
            fs.unlink(imagePath, () => { });
        }
        user.image = req.files.image[0].filename;
    }

    if (deletePosts) {
        const postsToDelete = Array.isArray(deletePosts) ? deletePosts : [deletePosts];

        postsToDelete.forEach(deletepost => {
            if (user.posts.includes(deletepost)) {

                const imagePath = path.join(__dirname, "..", "uploads", deletepost);
                if (fs.existsSync(imagePath)) {
                    fs.unlink(imagePath, err => {
                        if (err) console.log("Failed to delete post image:", err);
                    });
                }

                user.posts = user.posts.filter(p => p !== deletepost);
            }
        });
    }

    if (addPosts && req.files.posts) {
        let posts = req.files.posts.map(post => post.filename)

        user.posts = [...user.posts, ...posts]
    }

    await user.save()

    return res.status(200).json("updated")

})

const banUser = catchAsync(async (req, res, next) => {
    const { userId } = req.params
    const { isBanned, banDays } = req.body


    if (isBanned == true || isBanned == "true") {
        const banDate = new Date(Date.now() + Number(banDays) * 24 * 60 * 60 * 1000);
        await User.findByIdAndUpdate(userId, {
            status: "banned",
            banExpiresAt: banDate
        });
        await Session.deleteMany({ userId: userId })
        res.clearCookie("refreshToken");
        res.status(200).json({
            status: "success",
            message: "User banned successfully"
        });
    } else {

        await User.findByIdAndUpdate(userId, {
            status: "active",
            banExpiresAt: null
        });
        res.status(200).json({
            status: "success",
            message: "User activated successfully"
        });
    }

})

module.exports = {
    register,
    login,
    userProfile,
    updateProfile,
    refreshTokenController,
    logout,
    logoutAllDevices,
    changePassword,
    banUser,
    verifyEmail
}