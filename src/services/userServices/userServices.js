import env from "../../config/env.js";
import userModel from "../../models/userModel.js";

export const showUserProfile = async (req, res) => {
  try {
    // Fetch user profile details from the database
    const userProfile = await userModel.findOne({ _id: req.userId });

    // Return the user profile data
    res.json(userProfile);
  } catch (error) {
    // Handle errors
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// UserController.js

export const updateUserProfile = async (req, res) => {
  try {
    const { username, bio, avatar } = req.body;

    // Find the user by ID
    const user = await userModel.findById(req.userId);

    // Check if user exists
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update user's profile fields
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.avatar = avatar || user.avatar;

    // Save the updated user profile
    await user.save();

    // Return the updated user profile
    res.json(user);
  } catch (error) {
    // Handle errors
    res.status(500).json({ error: "Internal Server Error" });
  }
};
