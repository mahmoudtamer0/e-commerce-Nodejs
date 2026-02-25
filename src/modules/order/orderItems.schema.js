const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({

    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true
    },

    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    title: {
        type: String,
        required: true
    },

    image: { type: String },
    price: {
        type: Number,
        required: true
    },

    quantity: {
        type: Number,
        required: true
    }

}, { timestamps: true });



module.exports = mongoose.model("OrderItem", orderItemSchema);