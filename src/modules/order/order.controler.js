const Order = require("./order.schema")
const Product = require("../product/products.schema")
const OrderItem = require("./orderItems.schema")

const catchAsync = require("../../utilities/catchAsync");
const ApiError = require("../../utilities/ApiError");
const sendEmail = require("../../utilities/sendEmails");


const addOrder = catchAsync(async (req, res, next) => {


    const { shippingAddress, paymentMethod, items } = req.body

    const user = req.user

    let totalPrice = 0

    const products = await Promise.all(items.map(item => Product.findById(item.productId)));

    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        if (!product) {
            return next(new ApiError(404, "not found this product"));
        }
        if (product.stock < items[i].quantity) {
            return next(new ApiError(404, "no available stock for"));
        }
        totalPrice += product.finalPrice * items[i].quantity;
    }

    const order = new Order({
        user: user.id,
        totalPrice,
        shippingAddress,
        paymentMethod
    })


    await order.save()

    for (const item of items) {
        const product = products.find(prod => prod._id.toString() == item.productId)
        const orderItem = new OrderItem({
            order: order._id,
            product: product._id,
            title: product.title,
            image: product.productImages.length > 0 ? product.productImages[0] : "",
            price: product.finalPrice,
            quantity: item.quantity
        })

        await orderItem.save()

        product.stock -= item.quantity;
        product.buys += 1;
        await product.save();
    }

    await sendEmail({
        email: user.email,
        subject: "Order Confirmation",
        message: `
    <div style="font-family: Arial; padding:20px;">
    <h2 style="color:#333;">Order Confirmation</h2>
    <p>Hello ${user.name},</p>
    <p>Your order has been received successfully.</p>

    <div style="background:#f5f5f5; padding:10px; margin:10px 0;">
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Total:</strong> $${order.totalPrice}</p>
    </div>

    <p>We will notify you when it ships 🚚</p>
    </div>
`,
    })

    return res.status(200).json({
        status: "success",
        data: order
    })




})

const editOrder = catchAsync(async (req, res, next) => {


    const { shippingAddress, items, deleteItems } = req.body
    const { orderId } = req.params
    const order = await Order.findById(orderId)
    const user = req.user
    if (user.id != order.user) {
        if (user.role != "ADMIN") {
            return next(new ApiError(401, "this is not your order, you have no permission to edit on it"));
        }
    }


    if (items && items.length > 0) {
        let totalPrice = 0;

        const itemsInOrderBeforeEdit = await OrderItem.find({ order: orderId });

        for (const item of items) {

            const product = await Product.findById(item.productId);

            if (!product) {
                return next(new ApiError(404, "Product not found"));
            }

            const existingOrderItem = itemsInOrderBeforeEdit.find(
                i => i.product.toString() === product._id.toString()
            );

            if (!item.quantity || item.quantity < 1) {
                return next(new ApiError(400, "quantity must be more than 1"));
            }
            if (existingOrderItem) {

                const oldQuantity = existingOrderItem.quantity;
                const difference = item.quantity - oldQuantity;

                if (difference > 0) {
                    if (product.stock < difference) {
                        return next(new ApiError(400, "Not enough stock available"));
                    }
                    product.stock -= difference;
                }

                if (difference < 0) {
                    product.stock += Math.abs(difference);
                }

                existingOrderItem.quantity = item.quantity;

                await product.save();
                await existingOrderItem.save();

            } else {

                if (product.stock < item.quantity) {
                    return next(new ApiError(400, "Not enough stock available"));
                }

                const orderItem = new OrderItem({
                    order: orderId,
                    product: product._id,
                    title: product.title,
                    image: product.productImages?.[0] || "",
                    price: product.finalPrice,
                    quantity: item.quantity
                });

                product.stock -= item.quantity;
                product.buys += 1;

                await product.save();
                await orderItem.save();
            }
        }

        const itemsInOrder = await OrderItem.find({ order: orderId });

        for (const item of itemsInOrder) {
            totalPrice += item.price * item.quantity;
        }

        await Order.findByIdAndUpdate(orderId, { totalPrice });

    }

    if (deleteItems && deleteItems.length > 0) {
        const items = await OrderItem.find({ order: orderId })
        const itemsTodelete = await OrderItem.find({ order: orderId, product: deleteItems.map(item => item.productId) })

        if (itemsTodelete.length == 0) {
            return next(new ApiError(404, "no valid items to delete"));
        }

        if (itemsTodelete.length >= items.length) {
            return next(new ApiError(400, "order must include at least one item"));
        }


        for (const deleteItem of itemsTodelete) {

            const item = await OrderItem.findOne({ product: deleteItem.product, order: orderId })

            if (!item) {
                return next(new ApiError(404, "this item is not in this order"));
            }

            await OrderItem.findByIdAndDelete(item.id)
            await Product.findByIdAndUpdate({ _id: item.product }, { $inc: { stock: item.quantity, buys: -1 } })

        }
        const itemsAfterDelete = await OrderItem.find({ order: orderId })

        let totalPrice = 0
        itemsAfterDelete.forEach(item => {
            totalPrice += item.price * item.quantity
        })

        await Order.findByIdAndUpdate(orderId, { totalPrice: totalPrice })

    }

    if (shippingAddress) {
        const order = await Order.findById(orderId)

        if (shippingAddress.address) {
            order.shippingAddress.address = shippingAddress.address
        }
        if (shippingAddress.city) {
            order.shippingAddress.city = shippingAddress.city
        }

        if (shippingAddress.phone) {
            order.shippingAddress.phone = shippingAddress.phone
        }

        await order.save()
    }




    return res.status(200).json({
        status: "success",
        data: null
    })




})

const editOrderStatuse = catchAsync(async (req, res, next) => {
    const { status } = req.body
    const { orderId } = req.params

    await Order.findByIdAndUpdate(orderId, { status: status }, { runValidators: true })

    return res.status(200).json({
        status: "success",
        data: null
    })

})

const getallOrders = catchAsync(async (req, res, next) => {

    const {
        search,
        minTotalPrice,
        maxTotalPrice,
        status,
        userId,
        startDate,
        endDate,
    } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;
    let filter = {}

    if (status) {
        filter.status = status
    }

    if (userId) {
        filter.userId = userId
    }
    if (minTotalPrice || maxTotalPrice) {
        filter.totalPrice = {}
        if (minTotalPrice) filter.totalPrice.$gte = Number(minTotalPrice);
        if (maxTotalPrice) filter.totalPrice.$lte = Number(maxTotalPrice);
    }
    if (search) {
        filter.$or = [
            { "shippingAddress.phone": { $regex: search, $options: "i" } },
            { "shippingAddress.city": { $regex: search, $options: "i" } },
        ];
    }

    if (startDate || endDate) {
        filter.createdAt = {};

        if (startDate) {
            filter.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
            filter.createdAt.$lte = new Date(endDate);
        }
    }

    const sort = req.query.sort
        ? req.query.sort.split(",").join(" ")
        : "-createdAt";


    const orders = await Order.find(filter).skip(skip).limit(limit).sort(sort)

    return res.status(200).json({
        status: "success",
        data: orders
    })

})

const getOrderDetails = catchAsync(async (req, res, next) => {
    const { orderId } = req.params
    const user = req.user

    const [order, items] = await Promise.all([
        Order.findById(orderId)
            .populate("user", "name")
            .select("-__v"),
        OrderItem.find({ order: orderId })
            .select("-__v -createdAt -updatedAt -order")
    ]);
    const orderDetails = {
        orderId: order._id,
        total: order.totalPrice,
        status: order.status,
        createdAt: order.createdAt,
        shippingAddress: {
            address: order.shippingAddress.address,
            city: order.shippingAddress.city,
            phone: order.shippingAddress.phone
        },
        customer: {
            id: order.user._id,
            name: order.user.name,
        },
        items

    }

    if (user.id != order.user) {
        if (user.role !== "ADMIN") {
            return next(new ApiError(401, "this is not your order, you have no permission to edit on it"));
        }
    }

    return res.status(200).json({
        status: "success",
        data: orderDetails
    })
})

module.exports = {
    addOrder,
    editOrder,
    editOrderStatuse,
    getallOrders,
    getOrderDetails
}
