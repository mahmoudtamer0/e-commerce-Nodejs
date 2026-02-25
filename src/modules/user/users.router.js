const express = require("express")
const { register, login, userProfile, updateProfile, refreshTokenController, logout, changePassword, logoutAllDevices, banUser, verifyEmail } = require("./users.controler")
const { userValidator, loginValidator, updateValidator } = require("../../middlewares/userValidator")
const verifyToken = require("../../middlewares/verifyToken")
const upload = require("../../middlewares/userUpload");
const allowTo = require("../../middlewares/allowTo")


const router = express.Router()


router.route("/register")
    .post(upload.fields([
        { name: "image", maxCount: 1 },
        { name: "posts", maxCount: 5 }
    ]), userValidator, register)

router.route("/verify-email")
    .post(verifyEmail)
router.route("/login")
    .post(loginValidator, login)
router.route("/me")
    .get(verifyToken, userProfile)
router.route("/me/update")
    .patch(verifyToken,
        upload.fields([
            { name: "image", maxCount: 1 },
            { name: "posts", maxCount: 5 }
        ]),
        updateValidator, updateProfile)
router.get("/refresh", refreshTokenController);
router.post("/logout", logout);
router.post("/refresh", refreshTokenController);
router.patch("/changepassword", verifyToken, changePassword, logoutAllDevices);
router.patch("/ban/:userId", verifyToken, allowTo("ADMIN"), banUser)


module.exports = router