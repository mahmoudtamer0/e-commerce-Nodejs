const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    totalPrice: {
        type: Number,
        required: true
    },

    shippingAddress: {
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        }
    },

    paymentMethod: {
        type: String,
        enum: ["cash", "card"],
        default: "cash"
    },

    status: {
        type: String,
        enum: [
            "pending",
            "confirmed",
            "processing",
            "shipped",
            "delivered",
            "cancelled"
        ],
        default: "pending"
    }

}, { timestamps: true });



module.exports = mongoose.model("Order", orderSchema);