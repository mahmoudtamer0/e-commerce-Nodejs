const express = require("express")
const allowTo = require("../../middlewares/allowTo")
const verifyToken = require("../../middlewares/verifyToken")
const { addReview } = require("./review.controler")

const router = express.Router()

/**
 * @swagger
 * /api/v1/review/{prodId}:
 *   post:
 *     summary: Add a review for a product (only if purchased)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: prodId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rate
 *             properties:
 *               rate:
 *                 type: number
 *                 example: 5
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review added successfully
 *       400:
 *         description: Invalid request or already reviewed
 *       404:
 *         description: Product not found or not purchased
 */
router.route("/:prodId")
    .post(verifyToken, addReview)



module.exports = router