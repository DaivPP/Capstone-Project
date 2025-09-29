const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const sendEmail = async (to, subject, body) => {
  try {
    const params = {
      Source: process.env.SES_SENDER_EMAIL, // must be verified in SES
      Destination: {
        ToAddresses: Array.isArray(to) ? to : [to], // ✅ handles multiple recipients
      },
      Message: {
        Subject: { Data: subject, Charset: "UTF-8" },
        Body: {
          Text: { Data: body, Charset: "UTF-8" },
        },
      },
    };

    const command = new SendEmailCommand(params);
    const result = await sesClient.send(command);
    console.log("✅ Email sent successfully:", result.MessageId);
    return result;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
};

module.exports = sendEmail;
