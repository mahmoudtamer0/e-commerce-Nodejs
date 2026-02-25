const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    refreshToken: {
        type: String,
        required: true,
        unique: true
    },

    device: {
        type: String,
        default: "unknown"
    },

    createdAt: {
        type: Date,
        default: Date.now,
        expires: 7 * 24 * 60 * 60
    }
});
// sessionSchema.index({ userId: 1 })
// sessionSchema.index({ refreshToken: 1 })
module.exports = mongoose.model("Session", sessionSchema);