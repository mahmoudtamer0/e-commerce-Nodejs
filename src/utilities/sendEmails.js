const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendEmail = async ({ email, subject, message }) => {
    try {
        await transporter.sendMail({
            from: "mamoidtamer300@gmail.com",
            to: email,
            subject: subject,
            html: message,
        });

        console.log("Email sent successfully");

    } catch (error) {
        console.error("Email sending error:", error);
        throw error;
    }
};

module.exports = sendEmail;