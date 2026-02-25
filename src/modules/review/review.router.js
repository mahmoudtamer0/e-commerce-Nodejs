const express = require("express")
const allowTo = require("../../middlewares/allowTo")
const verifyToken = require("../../middlewares/verifyToken")
const { addReview } = require("./review.controler")

const router = express.Router()

router.route("/:prodId")
    .post(verifyToken, addReview)



module.exports = router