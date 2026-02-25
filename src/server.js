const mongoose = require("mongoose");
const app = require("./app");

mongoose.connect(process.env.DB_URL)
    .then(() => {
        console.log("DB Connected");
        app.listen(5000, () => {
            console.log("Server running");
        });
    })
    .catch(err => console.log(err));