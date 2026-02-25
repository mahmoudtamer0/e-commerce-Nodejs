const express = require("express")
const verifyToken = require("../../middlewares/verifyToken")
const allowTo = require("../../middlewares/allowTo")
const { addProduct, getAllProducts, updateProducts, deleteProduct } = require("./products.controler")
const upload = require("../../middlewares/productsUpload");
const { productsValidator, productsUpdateValidator } = require("../../middlewares/productsValidator");

const router = express.Router()

router.route("/")
    .post(verifyToken, allowTo("ADMIN"),
        upload.array("productImages", 5),
        productsValidator,
        addProduct)
    .get(getAllProducts)


router.route("/:prodId")
    .patch(verifyToken, allowTo("ADMIN"),
        upload.array("productImages", 5),
        productsUpdateValidator,
        updateProducts)
    .patch(verifyToken, allowTo("ADMIN"), deleteProduct)

module.exports = router