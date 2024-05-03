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
import notificationModel from "../../models/notificationModel.js";

export const viewProfile = async ({ user }) => {
  const userProfile = await userModel
    .findOne(user._id)
    .populate({ path: "posts" });
  if (!userProfile) {
    throw new NotFoundError("User is not found");
  }
  return userProfile;
};

export const viewUser = async ({ user_id }) => {
  const userProfile = await userModel
    .findById(user_id)
    .select('-password') 
    .populate({ path: "posts" });
  if (!userProfile) {
    throw new NotFoundError("User is not found");
  }
  return userProfile;
};

export const followUser = async ({ user, userIdToFollow }) => {
  try {
    // Find the user to be followed/unfollowed from the database
    const userToFollow = await userModel.findById(userIdToFollow);

    // Check if the user to be followed/unfollowed exists
    if (!userToFollow) {
      throw new Error("User not found");
    }

    // Check if the current user is already following the user to be followed/unfollowed
    const isFollowing = user.following.includes(userIdToFollow);

    // Toggle follow/unfollow action based on current following status
    if (isFollowing) {
      // If the current user is already following the user to be followed, unfollow them
      // Remove the user to be unfollowed from the current user's following array
      const followingIndex = user.following.indexOf(userIdToFollow);
      if (followingIndex !== -1) {
        user.following.splice(followingIndex, 1);
      }

      // Remove the current user from the user to be unfollowed's followers array
      const followerIndex = userToFollow.followers.indexOf(user._id);
      if (followerIndex !== -1) {
        userToFollow.followers.splice(followerIndex, 1);
      }
    } else {
      // If the current user is not following the user to be followed, follow them
      // Add the user to be followed to the current user's following array
      user.following.push(userIdToFollow);

      // Add the current user to the user to be followed's followers array
      userToFollow.followers.push(user._id);

      // create notification for member
      await notificationModel.create({
        note: `${user.username} followed you`,
        user_id: userToFollow._id,
      });
    }

    // Save the changes to both user documents
    await user.save();
    await userToFollow.save();

    // Return success message
    return {
      message: "Operation successful",
      user: user,
      userToFollow: userToFollow,
    };
  } catch (error) {
    // Handle errors
    console.error(error);
    throw new Error("Failed to follow/unfollow user");
  }
};

export const viewConnection = async ({ user }) => {
  const userProfile = await userModel
    .findOne(user._id)
    .populate({ path: "followers" })
    .populate({ path: "following" });
  if (!userProfile) {
    throw new NotFoundError("User is not found");
  }
  const followers = userProfile.followers;
  const following = userProfile.following;
  return { followers: followers, following: following };
};

export const updateUserProfile = async ({ user, body }) => {
  try {
    const { username, bio, avatar } = body;

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

    // create notification for member
    await notificationModel.create({
      note: `you have updated your profile detials succefully`,
      user_id: user._id,
    });

    // Return the updated user profile
    return user;
  } catch (e) {
    console.log("error", e);
    throw new BadRequestError("and error occoure");
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
  const userPosts = await postModel
    .find({ userId: user._id })
    .populate("likes");
  if (!userPosts) {
    throw new NotFoundError("likes not found");
  }
  const userComments = await commentModel
    .find({ userId: user._id })
    .populate("likes");
  if (!userComments) {
    throw new NotFoundError("likes not found");
  }
  // Combine likes from both posts and comments into one array
  let allLikes = [];
  userPosts.forEach((post) => {
    allLikes = allLikes.concat(post.likes);
  });
  userComments.forEach((comment) => {
    allLikes = allLikes.concat(comment.likes);
  });
  const likeCount = allLikes.length;
  const points = likeCount / 2;
  user.likes = likeCount;
  user.points = points;
  await user.save();

  return { points, likeCount, user };
};

export const getLeaderBoard = async () => {
  const leaderboard = await userModel
    .find({}, "username points")
    .sort({ points: -1 });
  if (!leaderboard) {
    throw new BadRequestError("no leaderboard found");
  }
  return leaderboard;
};
