const { User } = require("../models/User");

async function getProfile(req, res, next) {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    res.json({ success: true, user });
  } catch (err) { 
    next(err); 
  }
}

async function updateProfile(req, res, next) {
  try {
    const updates = {};
    
    if (typeof req.body.name === "string") {
      updates.name = req.body.name.trim();
    }
    
    if (!updates.name) {
      return res.status(400).json({
        success: false,
        message: "A valid name is required"
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updates,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({ success: true, user });
  } catch (err) { 
    next(err); 
  }
}


module.exports = { getProfile,updateProfile };
