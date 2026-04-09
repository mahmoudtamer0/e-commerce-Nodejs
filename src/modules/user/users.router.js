const express = require("express")
const { register, login, userProfile, updateProfile, googleCallback, refreshTokenController, logout, changePassword, logoutAllDevices, banUser, verifyEmail, resendOtp } = require("./users.controler")
const { userValidator, loginValidator } = require("../../middlewares/userValidator")
const verifyToken = require("../../middlewares/verifyToken")
const upload = require("../../middlewares/userUpload");
const allowTo = require("../../middlewares/allowTo")
const passport = require("passport");


const router = express.Router()


router.route("/register")
    .post(upload.fields([
        { name: "image", maxCount: 1 },
        { name: "posts", maxCount: 5 }
    ]), userValidator, register)

router.route("/verify-email")
    .post(verifyEmail)

router.route("/resend-otp")
    .post(resendOtp)

router.route("/login")
    .post(loginValidator, login)

router.get("/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/google/callback",
    passport.authenticate("google", { session: false }),
    googleCallback
);

router.route("/me/update")
    .patch(verifyToken,
        upload.fields([
            { name: "image", maxCount: 1 },
            { name: "posts", maxCount: 5 }
        ]),
        updateProfile)
router.post("/refresh", refreshTokenController);
router.post("/logout", logout);
router.patch("/changepassword", verifyToken, changePassword, logoutAllDevices);
router.patch("/ban/:userId", verifyToken, allowTo("ADMIN"), banUser)
router.route("/:userId")
    .get(userProfile)


module.exports = router