const express = require("express")
const verifyToken = require("../../middlewares/verifyToken")
const allowTo = require("../../middlewares/allowTo")
const { addProduct, getAllProducts, updateProducts, deleteProduct, addManyProducts, getProduct, calculateCart, addToCart } = require("./products.controler")
const upload = require("../../middlewares/productsUpload");
const { productsValidator, productsUpdateValidator } = require("../../middlewares/productsValidator");

const router = express.Router()

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Get all products with filters, search, sort, and pagination
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Products fetched successfully
 */
/**
 * @swagger
 * /api/v1/products:
 *   post:
 *     summary: Add a new product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - originalPrice
 *               - discount
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               originalPrice:
 *                 type: number
 *               discount:
 *                 type: number
 *               category:
 *                 type: string
 *               stock:
 *                 type: number
 *               buys:
 *                 type: number
 *               productImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Product created successfully
 */
router.route("/")
    .post(verifyToken, allowTo("ADMIN"),
        upload.array("productImages", 5),
        productsValidator,
        addProduct)
    .get(getAllProducts)

/**
 * @swagger
 * /api/v1/products/many:
 *   post:
 *     summary: Add multiple products at once
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *     responses:
 *       200:
 *         description: Products added successfully
 */
router.route("/many")
    .post(addManyProducts)

/**
* @swagger
* /api/v1/products/add-to-cart:
*   post:
*     summary: Add product to cart (check stock & size)
*     tags: [Cart]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             required:
*               - productId
*               - quantity
*               - size
*             properties:
*               productId:
*                 type: string
*               quantity:
*                 type: number
*               size:
*                 type: string
*     responses:
*       200:
*         description: Added to cart successfully
*/
router.route("/add-to-cart")
    .post(addToCart)

/**
* @swagger
* /api/v1/products/calculate-cart:
*   post:
*     summary: Calculate cart total (subtotal, tax, delivery)
*     tags: [Cart]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             required:
*               - cart
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
*     responses:
*       200:
*         description: Cart calculated successfully
*/
router.route("/calculate-cart")
    .post(calculateCart)

/**
 * @swagger
 * /api/v1/products/{prodId}:
 *   patch:
 *     summary: Update product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: prodId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Product updated successfully
 */
/**
 * @swagger
 * /api/v1/products/{prodId}:
 *   delete:
 *     summary: Delete product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: prodId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully
 */
router.route("/:prodId")
    .patch(verifyToken, allowTo("ADMIN"),
        upload.array("productImages", 5),
        productsUpdateValidator,
        updateProducts)
    .delete(verifyToken, allowTo("ADMIN"), deleteProduct)


/**
* @swagger
* /api/v1/products/{prodId}:
*   get:
*     summary: Get single product by ID
*     tags: [Products]
*     parameters:
*       - in: path
*         name: prodId
*         required: true
*         schema:
*           type: string
*     responses:
*       200:
*         description: Product fetched successfully
*       404:
*         description: Product not found
*/
router.route("/:prodId")
    .get(getProduct)

module.exports = router