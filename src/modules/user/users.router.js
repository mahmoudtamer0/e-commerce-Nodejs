const express = require("express")
const { register, login, userProfile, updateProfile, googleCallback, refreshTokenController, logout, changePassword, logoutAllDevices, banUser, verifyEmail, resendOtp } = require("./users.controler")
const { userValidator, loginValidator } = require("../../middlewares/userValidator")
const verifyToken = require("../../middlewares/verifyToken")
const upload = require("../../middlewares/userUpload");
const allowTo = require("../../middlewares/allowTo")
const passport = require("passport");


const router = express.Router()


/**
 * @swagger
 * /api/v1/users/register:
 *   post:
 *     summary: Register a new user and send OTP email
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: OTP sent to email
 */
router.route("/register")
    .post(upload.fields([
        { name: "image", maxCount: 1 },
        { name: "posts", maxCount: 5 }
    ]), userValidator, register)

/**
* @swagger
* /api/v1/users/verify-email:
*   post:
*     summary: Verify user email using OTP
*     tags: [Users]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             required:
*               - email
*               - otp
*             properties:
*               email:
*                 type: string
*               otp:
*                 type: string
*     responses:
*       200:
*         description: Email verified successfully
*/
router.route("/verify-email")
    .post(verifyEmail)

/**
* @swagger
* /api/v1/users/resend-otp:
*   post:
*     summary: Resend email verification OTP
*     tags: [Users]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             required:
*               - email
*             properties:
*               email:
*                 type: string
*     responses:
*       200:
*         description: OTP resent successfully
*/
router.route("/resend-otp")
    .post(resendOtp)

/**
* @swagger
* /api/v1/users/login:
*   post:
*     summary: Login user
*     tags: [Users]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             required:
*               - email
*               - password
*             properties:
*               email:
*                 type: string
*               password:
*                 type: string
*     responses:
*       200:
*         description: Login successful
*/
router.route("/login")
    .post(loginValidator, login)

router.get("/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/google/callback",
    passport.authenticate("google", { session: false }),
    googleCallback
);

/**
 * @swagger
 * /api/v1/users/me/update:
 *   patch:
 *     summary: Update user profile
 *     tags: [Users]
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.route("/me/update")
    .patch(verifyToken,
        upload.fields([
            { name: "image", maxCount: 1 },
            { name: "posts", maxCount: 5 }
        ]),
        updateProfile)

/**
* @swagger
* /api/v1/users/refresh:
*   post:
*     summary: Refresh access token
*     tags: [Users]
*     responses:
*       200:
*         description: New access token generated
*/
router.post("/refresh", refreshTokenController);

/**
 * @swagger
 * /api/v1/users/logout:
 *   post:
 *     summary: Logout user from current session
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post("/logout", logout);

/**
 * @swagger
 * /api/v1/users/changepassword:
 *   patch:
 *     summary: Change user password
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 */
router.patch("/changepassword", verifyToken, changePassword, logoutAllDevices);

/**
 * @swagger
 * /api/v1/users/ban/{userId}:
 *   patch:
 *     summary: Ban or unban user (Admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isBanned:
 *                 type: boolean
 *               banDays:
 *                 type: number
 *     responses:
 *       200:
 *         description: User status updated
 */
router.patch("/ban/:userId", verifyToken, allowTo("ADMIN"), banUser)

/**
 * @swagger
 * /api/v1/users/{userId}:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User profile fetched successfully
 */
router.route("/:userId")
    .get(userProfile)


module.exports = router