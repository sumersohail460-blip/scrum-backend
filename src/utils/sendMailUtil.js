const nodemailer = require("nodemailer");

/**
 * Send an email using Mailtrap, Gmail, or AWS SES
 */
const sendEmail = async (to, subject, htmlContent, type = process.env.EMAIL_PROVIDER || "smtp") => {
  try {
    let transporter;

    switch (type) {
      case "smtp":
        transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASS,
          },
        });
        break;

      case "gmail":
        transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });
        break;

      case "mailtrap":
        transporter = nodemailer.createTransport({
          host: "sandbox.smtp.mailtrap.io",
          port: 2525,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });
        break;

      case "ses":
        transporter = nodemailer.createTransport({
          host: `email-smtp.${process.env.AWS_REGION}.amazonaws.com`,
          port: 587,
          secure: false,
          auth: {
            user: process.env.AWS_SES_SMTP_USER,
            pass: process.env.AWS_SES_SMTP_PASS,
          },
        });
        break;

      default:
        throw new Error("Unsupported email provider");
    }

    const mailOptions = {
      from: process.env.SENDER_EMAIL || process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject: subject || "No Subject",
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.success(`Email sent to ${to}: ${info.messageId}`);

    return info;
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error.message);
    throw new Error(error.message || "Email sending failed");
  }
};

module.exports = sendEmail;