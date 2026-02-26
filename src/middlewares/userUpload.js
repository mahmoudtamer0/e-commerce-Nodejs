const multer = require("multer");
const fs = require("fs");
const path = require("path");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {

        const uploadDir = path.join(process.cwd(), "uploads");

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        cb(null, uploadDir);
    },

    filename: function (req, file, cb) {
        const cleanName = file.originalname.replace(/\s+/g, "_");
        cb(null, Date.now() + "-" + cleanName);
    }
});

module.exports = multer({ storage });