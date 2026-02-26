// const SibApiV3Sdk = require("@sendinblue/client");

// const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// apiInstance.setApiKey(
//     SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
//     process.env.BREVO_API
// );

// const sendEmail = async ({ email, subject, message }) => {
//     await apiInstance.sendTransacEmail({
//         sender: { email: process.env.BREVO_USER },
//         to: [{ email }],
//         subject,
//         htmlContent: message,
//     });
// };

// module.exports = sendEmail;

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