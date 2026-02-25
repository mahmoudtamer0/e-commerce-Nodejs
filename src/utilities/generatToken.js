const jwt = require("jsonwebtoken")

const generateAccessToken = (email, id, role) => {
    const token = jwt.sign({ email, id, role }, process.env.JWT_SECRET, { expiresIn: "15m" })

    return token
}

const generateRefreshToken = (id) => {
    return jwt.sign(
        { id: id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

module.exports = { generateAccessToken, generateRefreshToken }