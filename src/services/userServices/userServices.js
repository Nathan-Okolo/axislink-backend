import env from "../../config/env.js";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from "../../lib/appErrors.js";
import postModel from "../../models/postModel.js";
import userModel from "../../models/userModel.js";

export const viewProfile = async ({ user }) => {
  const userProfile = await userModel.findOne(user._id);
  if (!userProfile) {
    throw new NotFoundError("User is not found");
  }
  return userProfile;
};

export const updateUserProfile = async ({ user }) => {
  try {
    const { username, bio, avatar } = req.body;

    // Find the user by ID
    const userDetials = await userModel.findById(user._id);

    // Check if user exists
    if (!user) {
      throw new NotFoundError("user not found");
    }

    // Update user's profile fields
    userDetials.username = username || userDetials.username;
    userDetials.bio = bio || userDetials.bio;
    userDetials.avatar = avatar || userDetials.avatar;

    // Save the updated user profile
    await userDetials.save();

    // Return the updated user profile
    res.json(userDetials);
  } catch (e) {
    throw new BadRequestError(e.response.data.message);
  }
};

