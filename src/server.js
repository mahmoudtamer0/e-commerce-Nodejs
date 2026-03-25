const mongoose = require("mongoose");
const app = require("./app");


const port = process.env.PORT || 5000
mongoose.connect(process.env.DB_URL)
    .then(() => {
        console.log("DB Connected");
        app.listen(port, "0.0.0.0", () => {
            console.log("Server running");
        });
    })
    .catch(err => console.log(err));