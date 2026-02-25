const express = require("express")
const { getAllCategories, addCategory, updateCategory, deleteCategory } = require("./category.controler")
const allowTo = require("../../middlewares/allowTo")
const verifyToken = require("../../middlewares/verifyToken")

const router = express.Router()


router.route("/")
    .get(getAllCategories)
    .post(verifyToken, allowTo("ADMIN"), addCategory)

router.route("/:catId")
    .patch(verifyToken, allowTo("ADMIN"), updateCategory)
    .delete(verifyToken, allowTo("ADMIN"), deleteCategory)
module.exports = router