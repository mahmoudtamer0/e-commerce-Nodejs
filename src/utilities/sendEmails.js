const SibApiV3Sdk = require('sib-api-v3-sdk');

const client = SibApiV3Sdk.ApiClient.instance;
client.authentications['api-key'].apiKey = process.env.BREVO_API;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const sendEmail = async ({ email, message, subject }) => {
    try {
        await apiInstance.sendTransacEmail({
            sender: {
                email: "mamoidtamer300@gmail.com",
                name: "My App"
            },
            to: [{ email: email }],
            subject: subject,
            htmlContent: message
        });

        console.log("Email sent successfully");
    } catch (error) {
        console.log(error.response?.body || error.message);
    }
};

module.exports = sendEmail;