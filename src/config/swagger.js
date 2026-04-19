const swaggerJSDoc = require("swagger-jsdoc");

const swaggerSpec = swaggerJSDoc({
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Shop-Co API",
            version: "1.0.0",
            description: "E-commerce backend API documentation",
        },
        servers: [
            {
                url: "http://localhost:5000/api/v1",
                description: "Local server",
            },
            {
                url: "https://e-commerce-nodejs-rust.vercel.app/api/v1",
                description: "Production server",
            },
        ],
    },
    apis: ["./src/modules/**/*.js", "./src/modules/**/*.router.js"],
});

exports = module.exports = swaggerSpec;