const Offer = require("../models/Offer");

// Create Offer
exports.createOffer = async (req, res) => {
  try {
    const { 
      title, 
      offerCode, 
      discount, 
      fromDate, 
      toDate, 
      packageType, 
      usageLimit, 
      applicableOn, 
      description,
      minAmount = 0  
    } = req.body;

    let image = "";
    if (req.file) {
      image = req.file.filename;
    }
    let parsedPackageType = [];
    try {
      parsedPackageType = JSON.parse(packageType); 
      if (!Array.isArray(parsedPackageType)) {
        parsedPackageType = [parsedPackageType];
      }
    } catch (e) {
      parsedPackageType = packageType ? [packageType] : [];
    }

    const newOffer = new Offer({
      title,
      offerCode,
      discount,
      fromDate,
      toDate,
      packageType: parsedPackageType,
      usageLimit,
      applicableOn,
      description,
      minAmount: Number(minAmount), 
      image,
    });

    await newOffer.save();
    res.status(201).json({ message: "Offer created successfully", offer: newOffer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Offers
exports.getOffers = async (req, res) => {
  try {
    const offers = await Offer.find();
    const now = new Date();
    
    // Batch update expired offers
    const expiredOfferIds = offers
      .filter(offer => 
        offer.toDate < now || 
        offer.usedCount >= offer.usageLimit
      )
      .map(offer => offer._id);
    
    if (expiredOfferIds.length > 0) {
      await Offer.updateMany(
        { _id: { $in: expiredOfferIds }, status: { $ne: "Expired" } },
        { status: "Expired" }
      );
      
      // Update local objects for response
      offers.forEach(offer => {
        if (expiredOfferIds.includes(offer._id)) {
          offer.status = "Expired";
        }
      });
    }
    
    res.status(200).json(offers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOfferById = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: "Offer not found" });
    
    // Auto-update status before sending response
    const now = new Date();
    let newStatus = offer.status;
    
    if (offer.toDate < now || offer.usedCount >= offer.usageLimit) {
      newStatus = "Expired";
    } else if (offer.fromDate <= now && offer.toDate >= now) {
      newStatus = "Active";
    } else if (offer.fromDate > now) {
      newStatus = "Inactive";
    }
    
    if (newStatus !== offer.status) {
      await Offer.findByIdAndUpdate(offer._id, { status: newStatus });
      offer.status = newStatus;
    }
    
    res.status(200).json(offer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Update Offer - REMOVE MANUAL STATUS
exports.updateOffer = async (req, res) => {
  try {
    let {
      title,
      offerCode,
      discount,
      fromDate,
      toDate,
      packageType,
      usageLimit,
      applicableOn,
      description,
      // status, // REMOVE THIS - let model handle status automatically
      minAmount = 0  
    } = req.body;

    // Parse packageType
    let parsedPackageType = [];
    try {
      parsedPackageType = JSON.parse(packageType);
      if (!Array.isArray(parsedPackageType)) {
        parsedPackageType = [parsedPackageType];
      }
    } catch (e) {
      parsedPackageType = packageType ? [packageType] : [];
    }

    let updateData = {
      title,
      offerCode,
      discount,
      fromDate,
      toDate,
      packageType: parsedPackageType,
      usageLimit,
      applicableOn,
      description,
      minAmount: Number(minAmount) 
      // status REMOVED - will be auto-calculated
    };

    if (req.file) {
      updateData.image = req.file.filename;
    }

    const updatedOffer = await Offer.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedOffer) return res.status(404).json({ message: "Offer not found" });
    
    // Force status recalculation by saving again
    await updatedOffer.save();
    
    res.status(200).json({ message: "Offer updated successfully", offer: updatedOffer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Offer (No changes needed)
exports.deleteOffer = async (req, res) => {
  try {
    const deletedOffer = await Offer.findByIdAndDelete(req.params.id);
    if (!deletedOffer) return res.status(404).json({ message: "Offer not found" });
    res.status(200).json({ message: "Offer deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Apply Offer (Legacy - when user tries to use it)
exports.applyOffer = async (req, res) => {
  try {
    const { offerCode, userId } = req.body;

    const offer = await Offer.findOne({ offerCode });
    if (!offer) return res.status(404).json({ message: "Invalid coupon code" });

    // Force status check by saving
    await offer.save();

    // Check status (after auto-update)
    if (offer.status !== "Active") {
      return res.status(400).json({ message: "Coupon is no longer active" });
    }

    // Check if usage limit reached
    if (offer.usedCount >= offer.usageLimit) {
      return res.status(400).json({ message: "Coupon usage limit reached" });
    }

    // Check if user already used (old structure compatibility)
    if (offer.usedBy.some(usage => usage.userId && usage.userId.toString() === userId)) {
      return res.status(400).json({ message: "You have already used this coupon" });
    }

    // Apply coupon
    offer.usedBy.push({
      userId: userId,
      email: "", // Old structure compatibility
      usedAt: new Date()
    });
    offer.usedCount += 1;

    await offer.save(); // This will auto-update status if needed

    res.status(200).json({ message: "Coupon applied successfully", discount: offer.discount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Validate and Apply Offer (Frontend ke liye) - UPDATED
exports.validateOffer = async (req, res) => {
  try {
    const { offerCode, packageType, totalAmount, userEmail } = req.body;

    // Find offer by code
    const offer = await Offer.findOne({ offerCode: offerCode.toUpperCase() });
    if (!offer) {
      return res.status(404).json({ 
        isValid: false, 
        message: "Invalid coupon code" 
      });
    }

    // Force status auto-update by saving
    await offer.save();

    // Now check the updated status
    if (offer.status !== "Active") {
      let message = "This coupon is no longer active";
      if (offer.status === "Expired") {
        message = "This coupon has expired";
      } else if (offer.status === "Inactive") {
        message = `This coupon is valid from ${offer.fromDate.toLocaleDateString('en-IN')}`;
      }
      
      return res.status(400).json({ 
        isValid: false, 
        message 
      });
    }

    // Check package type compatibility
    if (packageType && !offer.packageType.includes(packageType)) {
      return res.status(400).json({ 
        isValid: false, 
        message: "This coupon is not valid for the selected package type" 
      });
    }

    // Check minimum amount
    if (totalAmount && totalAmount < offer.minAmount) {
      return res.status(400).json({ 
        isValid: false, 
        message: `Minimum amount ₹${offer.minAmount} required for this coupon` 
      });
    }

    // Check if user has already used this coupon
    if (userEmail && offer.usedBy.some(usage => usage.email === userEmail)) {
      return res.status(400).json({ 
        isValid: false, 
        message: "You have already used this coupon" 
      });
    }

    // All validations passed
    res.status(200).json({
      isValid: true,
      coupon: offer,
      discount: offer.discount,
      message: `Coupon applied! ₹${offer.discount} discount`
    });

  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({ 
      isValid: false, 
      message: "Error validating coupon. Please try again." 
    });
  }
};

// Mark Offer as Used (After successful payment)
exports.markOfferAsUsed = async (req, res) => {
  try {
    const { offerId, userEmail, userId } = req.body;

    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    // Double check if user already used this coupon
    if (userEmail && offer.usedBy.some(usage => usage.email === userEmail)) {
      return res.status(400).json({ message: "User has already used this coupon" });
    }

    // Update coupon usage
    offer.usedBy.push({
      userId: userId || null,
      email: userEmail,
      usedAt: new Date()
    });
    
    offer.usedCount += 1;

    await offer.save(); // This will auto-update status if usage limit reached

    res.status(200).json({ 
      message: "Coupon marked as used successfully",
      offer 
    });

  } catch (error) {
    console.error('Error marking coupon as used:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Apply Offer Updated - UPDATED
exports.applyOfferUpdated = async (req, res) => {
  try {
    const { offerCode, userEmail, userId, packageType, totalAmount } = req.body;

    const offer = await Offer.findOne({ offerCode: offerCode.toUpperCase() });
    if (!offer) {
      return res.status(404).json({ message: "Invalid coupon code" });
    }

    // Force status auto-update
    await offer.save();

    // Check status after auto-update
    if (offer.status !== "Active") {
      return res.status(400).json({ message: "This coupon is no longer active" });
    }

    if (packageType && !offer.packageType.includes(packageType)) {
      return res.status(400).json({ message: "Not valid for this package type" });
    }

    if (totalAmount && totalAmount < offer.minAmount) {
      return res.status(400).json({ message: `Minimum amount ₹${offer.minAmount} required` });
    }

    if (userEmail && offer.usedBy.some(usage => usage.email === userEmail)) {
      return res.status(400).json({ message: "You have already used this coupon" });
    }

    // Mark as used
    offer.usedBy.push({
      userId: userId || null,
      email: userEmail,
      usedAt: new Date()
    });
    offer.usedCount += 1;

    await offer.save(); // This will auto-update status if needed

    res.status(200).json({ 
      message: "Coupon applied successfully", 
      discount: offer.discount,
      coupon: offer
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// NEW: Reset All Offers Status (Manual fix ke liye)
exports.resetAllOffersStatus = async (req, res) => {
  try {
    const offers = await Offer.find();
    const now = new Date();
    
    let updatedCount = 0;
    
    for (let offer of offers) {
      let newStatus = "Active";
      
      if (offer.toDate < now || offer.usedCount >= offer.usageLimit) {
        newStatus = "Expired";
      } else if (offer.fromDate > now) {
        newStatus = "Inactive";
      }
      
      if (newStatus !== offer.status) {
        await Offer.findByIdAndUpdate(offer._id, { status: newStatus });
        updatedCount++;
      }
    }
    
    res.status(200).json({ 
      message: `Successfully updated ${updatedCount} offers status` 
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};