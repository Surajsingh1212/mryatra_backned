const nodemailer = require('nodemailer');
const config = require('../config/config');

module.exports = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: config.EMAIL_HOST,
      port: config.EMAIL_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: config.EMAIL_USERNAME,
        pass: config.EMAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: false // for local testing
      }
    });

    // Verify connection first
    await transporter.verify(function(error, success) {
      if (error) {
        console.log('Server verification error:', error);
      } else {
        console.log('Server is ready to take our messages');
      }
    });

    const mailOptions = {
      from: `"Website Enquiry" <${config.EMAIL_USERNAME}>`,
      to: options.email,
      subject: options.subject,
      text: options.text
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};