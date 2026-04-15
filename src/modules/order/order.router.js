const express = require("express")
const allowTo = require("../../middlewares/allowTo")
const verifyToken = require("../../middlewares/verifyToken")
const { addOrder, editOrder, editOrderStatuse, getallOrders, getOrderDetails } = require("./order.controler")
const { orderValidator } = require("../../middlewares/orderValidator")

const router = express.Router()


router.route("/")
    .post(verifyToken, orderValidator, addOrder)
    .get(verifyToken, allowTo("ADMIN"), getallOrders)
router.route("/:orderId")
    .patch(verifyToken, editOrder)
    .get(verifyToken, getOrderDetails)

router.route("/:orderId/status")
    .patch(verifyToken, allowTo("ADMIN"), editOrderStatuse)
module.exports = router