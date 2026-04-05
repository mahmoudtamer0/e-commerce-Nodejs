const app = require("../app")
const { connectDB } = require("../utilities/db")

export default async function handler(req, res) {
    await connectDB();
    return app(req, res);
}