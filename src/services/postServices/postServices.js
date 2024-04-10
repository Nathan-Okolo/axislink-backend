import env from "../../config/env.js";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from "../../lib/appErrors.js";
import postModel from "../../models/postModel.js";
import likeModel from "../../models/likeModel.js";

export const makePost = async ({ user, body }) => {
  // Create the new post
  const postData = {
    userId: user._id,
    content: body.content,
    media: body.media,
    hashtags: body.hashtags,
    mentions: body.mentions,
  };
  const newPost = await postModel.create(postData);

  if (!newPost)
    throw new InternalServerError("server slip. Please try again in bit");

  return newPost;
};

export const viewAllPosts = async ({ page = 1, limit = 10 }) => {
  // Calculate the skip value based on the page and limit
  const skip = (page - 1) * limit;

  // Fetch posts from the database, sorted by createdAt field in descending order (newest first)
  const posts = await postModel
    .find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("userId", "username");

  if (!posts.length) {
    throw new NotFoundError("No posts found");
  }

  return posts;
};

export const viewSinglePost = async ({ post_id }) => {
  const post = await postModel.findById(post_id).populate("userId", "username");
  if (!post) throw new NotFoundError("Post not found");

  return post;
};

// export const likePost = async ({ user, post_id }) => {
//   const likes = await likeModel.find({})
//   return likes
// };


export const likePost = async ({ user, post_id }) => {
  try {
    // Check if the post exists
    const post = await postModel.findById(post_id);
    if (!post) {
      throw new NotFoundError("Post not found");
    }

    // Check if the user already liked the post
    const alreadyLikedIndex = post.likes.indexOf(user._id);
    if (alreadyLikedIndex !== -1) {
      // If user already liked the post, remove the user ID from the likes array
      post.likes.splice(alreadyLikedIndex, 1);
      // Find the like document in the likes model
      const like = await likeModel.findOneAndDelete({
        postId: post_id,
        userId: user._id,
      });
      if (!like) {
        throw new NotFoundError("Like document not found");
      }
    } else {
      // Create a like document
      const newLike = await likeModel.create({
        postId: post_id,
        userId: user._id,
      });
      // Add the like ID to the post.likes array
      post.likes.push(newLike._id);
    }

    // Save the updated post
    await post.save();

    return post;
  } catch (error) {
    throw new Error(`Failed to like/unlike post: ${error.message}`);
  }
};

export const repostPost = async (userId, post_id, content = "") => {
  // Find the original post
  const originalPost = await postModel.findById(post_id);
  if (!originalPost) {
    throw new NotFoundError("Original post not found");
  }

  // Create the repost
  const repost = new postModel({
    userId,
    content,
    media: originalPost.media,
    originalPostId: post_id,
    hashtags: originalPost.hashtags,
    mentions: originalPost.mentions,
  });

  // Save the repost
  const savedRepost = await repost.save();
  if (!savedRepost) {
    throw new InternalServerError("Failed to save repost");
  }

  // Update the original post to track the users who reposted it
  originalPost.repostedBy.push(userId);
  await originalPost.save();

  return savedRepost;
};

export const deletePost = async (post_id) => {
  const deletedPost = await postModel.findOneAndDelete({
    _id: post_id,
    userId: user_id,
  });
  if (!deletedPost) throw new NotFoundError("post not found");

  return { message: "Post deleted successfully" };
};
