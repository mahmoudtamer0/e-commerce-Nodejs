const express = require("express")
const allowTo = require("../../middlewares/allowTo")
const verifyToken = require("../../middlewares/verifyToken")
const { addOrder, editOrder, editOrderStatuse, getallOrders, getOrderDetails, getUserOrders } = require("./order.controler")
const { orderValidator } = require("../../middlewares/orderValidator")

const router = express.Router()


/**
 * @swagger
 * /api/v1/orders:
 *   post:
 *     summary: Create a new order from cart
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cart
 *               - shippingAddress
 *             properties:
 *               cart:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     size:
 *                       type: string
 *               shippingAddress:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: string
 *                   city:
 *                     type: string
 *                   phone:
 *                     type: string
 *               paymentMethod:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 */
/**
 * @swagger
 * /api/v1/orders:
 *   get:
 *     summary: Get all orders (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: minTotalPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxTotalPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Orders fetched successfully
 */
router.route("/")
    .post(verifyToken, orderValidator, addOrder)
    .get(verifyToken, allowTo("ADMIN"), getallOrders)

/**
* @swagger
* /api/v1/orders/my-orders:
*   get:
*     summary: Get logged-in user orders
*     tags: [Orders]
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: query
*         name: status
*         schema:
*           type: string
*     responses:
*       200:
*         description: User orders fetched successfully
*/
router.route("/my-orders")
    .get(verifyToken, getUserOrders)

/**
* @swagger
* /api/v1/orders/{orderId}:
*   patch:
*     summary: Edit order items or shipping address
*     tags: [Orders]
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: path
*         name: orderId
*         required: true
*         schema:
*           type: string
*     requestBody:
*       required: false
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               shippingAddress:
*                 type: object
*               items:
*                 type: array
*               deleteItems:
*                 type: array
*     responses:
*       200:
*         description: Order updated successfully
*/
router.route("/:orderId")
    .patch(verifyToken, editOrder)
    .get(verifyToken, getOrderDetails)

/**
* @swagger
* /api/v1/orders/{orderId}/status:
*   patch:
*     summary: Update order status (Admin only)
*     tags: [Orders]
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: path
*         name: orderId
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
*               - status
*             properties:
*               status:
*                 type: string
*                 example: "shipped"
*     responses:
*       200:
*         description: Order status updated
*/
router.route("/:orderId/status")
    .patch(verifyToken, allowTo("ADMIN"), editOrderStatuse)
module.exports = router