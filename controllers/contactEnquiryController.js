const Contact = require("../models/ContactEnquiry");

// Add new enquiry
exports.addEnquiry = async (req, res) => {
  try {
    const { name, mobile, email, subject, message } = req.body;

    const enquiry = new Contact({ name, mobile, email, subject, message });
    await enquiry.save();

    res.status(201).json({
      success: true,
      message: "Enquiry submitted successfully",
      data: enquiry,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all enquiries (for Admin Panel)
exports.getEnquiries = async (req, res) => {
  try {
    const enquiries = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: enquiries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add remarks to enquiry
exports.addRemarks = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const enquiry = await Contact.findByIdAndUpdate(
      id,
      { $set: { remarks } },
      { new: true }
    );

    if (!enquiry) {
      return res
        .status(404)
        .json({ success: false, message: "Enquiry not found" });
    }

    res.status(200).json({
      success: true,
      message: "Remarks added successfully",
      data: enquiry,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete enquiry
exports.deleteEnquiry = async (req, res) => {
  try {
    const { id } = req.params;

    const enquiry = await Contact.findByIdAndDelete(id);

    if (!enquiry) {
      return res
        .status(404)
        .json({ success: false, message: "Enquiry not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Enquiry deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
