const express = require("express")
const verifyToken = require("../../middlewares/verifyToken")
const allowTo = require("../../middlewares/allowTo")
const { addProduct, getAllProducts, updateProducts, deleteProduct, addManyProducts, getProduct, calculateCart, addToCart } = require("./products.controler")
const upload = require("../../middlewares/productsUpload");
const { productsValidator, productsUpdateValidator } = require("../../middlewares/productsValidator");

const router = express.Router()

router.route("/")
    .post(verifyToken, allowTo("ADMIN"),
        upload.array("productImages", 5),
        productsValidator,
        addProduct)
    .get(getAllProducts)


router.route("/many")
    .post(addManyProducts)

router.route("/add-to-cart")
    .post(addToCart)

router.route("/calculate-cart")
    .post(calculateCart)

router.route("/:prodId")
    .patch(verifyToken, allowTo("ADMIN"),
        upload.array("productImages", 5),
        productsUpdateValidator,
        updateProducts)
    .delete(verifyToken, allowTo("ADMIN"), deleteProduct)


router.route("/:prodId")
    .get(getProduct)

module.exports = router