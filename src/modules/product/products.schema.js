const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },

    description: {
        type: String,
        required: true,
    },

    originalPrice: {
        type: Number,
        required: true,
    },

    finalPrice: {
        type: Number,
        required: true,
    },

    discount: {
        type: Number,
        default: 0,
    },

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },

    stock: {
        type: Number,
        default: 0,
    },

    buys: {
        type: Number,
        default: 0,
    },

    productImages: {
        type: [String],
        default: [],
    },
    averageRate: {
        type: Number,
        default: 5,
    },
    ratingsQuantity: {
        type: Number,
        default: 0,
    },

}, { timestamps: true });

productSchema.index({
    title: "text",
    category: 1,
    finalPrice: 1,
    updatedAt: -1
});

module.exports = mongoose.model("Product", productSchema);
