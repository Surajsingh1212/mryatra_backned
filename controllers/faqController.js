const Faq = require("../models/Faq");

// Add new FAQ
exports.addFaq = async (req, res) => {
  try {
    const { question, answer, status } = req.body;

    const faq = new Faq({ question, answer, status });
    await faq.save();

    res.status(201).json({ success: true, message: "FAQ added successfully", data: faq });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error adding FAQ", error });
  }
};

// Get all FAQs
exports.getFaqs = async (req, res) => {
  try {
    const faqs = await Faq.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching FAQs", error });
  }
};

// Get single FAQ by ID
exports.getFaqById = async (req, res) => {
  try {
    const { id } = req.params;
    const faq = await Faq.findById(id);

    if (!faq) {
      return res.status(404).json({ success: false, message: "FAQ not found" });
    }

    res.status(200).json({ success: true, data: faq });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching FAQ", error });
  }
};

// Update FAQ
exports.updateFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, status } = req.body;

    const faq = await Faq.findByIdAndUpdate(
      id,
      { $set: { question, answer, status } },
      { new: true }
    );

    if (!faq) {
      return res.status(404).json({ success: false, message: "FAQ not found" });
    }

    res.status(200).json({ success: true, message: "FAQ updated successfully", data: faq });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating FAQ", error });
  }
};

// Delete FAQ
exports.deleteFaq = async (req, res) => {
  try {
    const { id } = req.params;

    const faq = await Faq.findByIdAndDelete(id);

    if (!faq) {
      return res.status(404).json({ success: false, message: "FAQ not found" });
    }

    res.status(200).json({ success: true, message: "FAQ deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting FAQ", error });
  }
};
