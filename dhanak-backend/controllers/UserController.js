import User from "../models/User.js";
import mongoose from "mongoose";

// GET user by ID
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "Invalid user ID" });

    const user = await User.findById(id).lean(); // use .lean() to get plain JS object
    if (!user) return res.status(404).json({ error: "User not found" });

    // Ensure profileImage is included and set default if missing
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      address: user.address || "",
      specialization: user.specialization || "",
      profileImage: user.profileImage || "", // important for frontend
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// UPDATE user by ID
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "Invalid user ID" });

    const allowedFields = ["name", "email", "phone", "address", "specialization", "profileImage"];
    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    });

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).lean();
    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone || "",
      address: updatedUser.address || "",
      specialization: updatedUser.specialization || "",
      profileImage: updatedUser.profileImage || "",
    });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
};
