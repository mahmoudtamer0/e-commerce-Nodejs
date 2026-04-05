const mongoose = require("mongoose");
const app = require("./app");


const PORT = process.env.PORT || 5000
const env = process.env.NODE_ENV;

if (env == "development") {
    mongoose.connect(process.env.DB_URL)
        .then(() => {
            console.log("DB Connected");
            app.listen(PORT, "0.0.0.0", () => {
                console.log("Server running");
            });
        })
        .catch(err => console.log(err));
}