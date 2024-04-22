import env from "../../config/env.js";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from "../../lib/appErrors.js";
import postModel from "../../models/postModel.js";
import userModel from "../../models/userModel.js";
import likeModel from "../../models/likeModel.js";
import commentModel from "../../models/commentModel.js";
import cloudinary from "../../utils/cloudinary.js";

export const viewProfile = async ({ user }) => {
  const userProfile = await userModel
    .findOne(user._id)
    .populate({ path: "posts" })
    .populate({ path: "likes" });
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

export const deleteUserProfile = async (user) => {
  try {
    // Delete all posts created by the user
    await postModel.deleteMany({ userId: user._id });

    // Delete all comments created by the user
    await commentModel.deleteMany({ userId: user._id });

    // Delete all likes by the user
    await likeModel.deleteMany({ userId: user._id });

    // Remove user ID from mentions in other posts
    await postModel.updateMany(
      { mentions: user._id },
      { $pull: { mentions: user._id } }
    );

    // Remove user ID from repostedBy in other posts
    await postModel.updateMany(
      { repostedBy: user._id },
      { $pull: { repostedBy: user._id } }
    );

    // Finally, delete the user profile
    await userModel.findByIdAndDelete(user._id);

    // Ensure that changes are saved
    return { message: "User profile and associated data deleted successfully" };
  } catch (error) {
    throw new Error(`Failed to delete user profile: ${error.message}`);
  }
};

export const getUserPoint = async ({ user }) => {
  const likes = await postModel.find({ userId: user._id }).populate("likes");
  if (!likes) {
    throw new NotFoundError("likez not found");
  }
  let allLikes = [];
  likes.forEach((post) => {
    allLikes = allLikes.concat(post.likes);
  });
  const likeCount = allLikes.length;
  const points = likeCount / 2;

  return { points, likeCount };
};