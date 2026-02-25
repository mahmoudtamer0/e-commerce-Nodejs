require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");

const categoryRouter = require("./modules/category/category.router");
const usersRouter = require("./modules/user/users.router");
const productsRouter = require("./modules/product/products.router");
const orderRouter = require("./modules/order/order.router");
const reviewRouter = require("./modules/review/review.router");
const globalErrorHandler = require("./middlewares/error");

const app = express();

//Security Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// Static Files
app.use("/uploads", express.static("uploads"));

//Rate limit
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        status: "fail",
        message: "Too many requests, try again later."
    },
    standardHeaders: true,
    legacyHeaders: false,
});
const authLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 5,
    message: "Too many login attempts, try again later"
});
//Routes
app.use(cookieParser());
app.use("/api", apiLimiter);
app.use('/api/v1/category', categoryRouter)
app.use("/api/v1/users/login", authLimiter);
app.use('/api/v1/users', usersRouter)
app.use('/api/v1/products', productsRouter)
app.use('/api/v1/orders', orderRouter)
app.use('/api/v1/review', reviewRouter)

//Global Error Handler
app.use(globalErrorHandler);


module.exports = app