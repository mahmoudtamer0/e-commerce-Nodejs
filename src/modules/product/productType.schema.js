const mongoose = require("mongoose");

const productTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    }
}, { collection: "productTypes" });

module.exports = mongoose.model("ProductType", productTypeSchema);
