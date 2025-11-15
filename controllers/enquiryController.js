const Enquiry = require("../models/Enquiry");
const { sendMail } = require('../services/emailService');
const config = require('../config/config');

// Add new enquiry
exports.addEnquiry = async (req, res) => {
  try {
    const { name, mobile, email, message, packageType } = req.body;

    const enquiry = new Enquiry({ name, mobile, email, message, packageType });
    await enquiry.save();

    // Send email to admin
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
          .header { background: #fa7c47; color: white; padding: 15px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { padding: 20px; }
          .field { margin-bottom: 10px; }
          .field-label { font-weight: bold; color: #555; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>New Enquiry Received</h2>
          </div>
          <div class="content">
            <div class="field">
              <span class="field-label">Name:</span> ${name}
            </div>
            <div class="field">
              <span class="field-label">Mobile:</span> ${mobile}
            </div>
            <div class="field">
              <span class="field-label">Email:</span> ${email}
            </div>
            <div class="field">
              <span class="field-label">Package Type:</span> ${packageType}
            </div>
            <div class="field">
              <span class="field-label">Message:</span> ${message}
            </div>
            <div class="field">
              <span class="field-label">Date:</span> ${new Date().toLocaleString()}
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email to client
    const clientEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
          .header { background: #fa7c47; color: white; padding: 15px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { padding: 20px; }
          .thank-you { font-size: 18px; color: #fa7c47; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Thank You for Your Enquiry</h2>
          </div>
          <div class="content">
            <div class="thank-you">Dear ${name},</div>
            <p>Thank you for contacting us! We have received your enquiry and our team will get back to you within 24 hours.</p>
            <p><strong>Your Enquiry Details:</strong></p>
            <ul>
              <li><strong>Package Type:</strong> ${packageType}</li>
              <li><strong>Message:</strong> ${message}</li>
            </ul>
            <p>If you have any urgent queries, please feel free to contact us at ${config.ADMIN_EMAIL} or call us at +917860292769 .</p>
            <p>Best regards,<br>Team Mryatra.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send emails
    try {
      // Send to admin
      await sendMail(config.ADMIN_EMAIL, 'New Website Enquiry', adminEmailHtml);
      
      // Send to client
      await sendMail(email, 'Thank You for Your Enquiry - mryatra.com', clientEmailHtml);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't throw error, just log it
    }

    res.status(201).json({ success: true, message: "Enquiry submitted successfully", data: enquiry });
  } catch (error) {
    console.error('Error saving enquiry:', error);
    res.status(500).json({ success: false, message: "Error saving enquiry", error: error.message });
  }
};

// Get all enquiries (for Admin Panel)
exports.getEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: enquiries });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching enquiries", error });
  }
};

// Add remarks to enquiry
exports.addRemarks = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const enquiry = await Enquiry.findByIdAndUpdate(
      id,
      { $set: { remarks } },
      { new: true }
    );

    if (!enquiry) {
      return res.status(404).json({ success: false, message: "Enquiry not found" });
    }

    res.status(200).json({ success: true, message: "Remarks added successfully", data: enquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error adding remarks", error });
  }
};

// Delete enquiry
exports.deleteEnquiry = async (req, res) => {
  try {
    const { id } = req.params;

    const enquiry = await Enquiry.findByIdAndDelete(id);

    if (!enquiry) {
      return res.status(404).json({ success: false, message: "Enquiry not found" });
    }

    res.status(200).json({ success: true, message: "Enquiry deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting enquiry", error });
  }
};