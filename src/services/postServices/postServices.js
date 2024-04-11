import env from "../../config/env.js";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from "../../lib/appErrors.js";
import postModel from "../../models/postModel.js";
import likeModel from "../../models/likeModel.js";
import commentModel from "../../models/commentModel.js";
import userModel from "../../models/userModel.js";

export const makePost = async ({ user, body }) => {
  const hashtagRegex = /#[\w-]+/g;

  const mentionRegex = /@(\w+)/g;

  const hashtags = body.content.match(hashtagRegex) || [];

  const mentionMatches = body.content.match(mentionRegex) || [];
  const mentions = [];

  for (const match of mentionMatches) {
    const username = match.slice(1);

    const mentionedUser = await userModel.findOne({ username });

    if (mentionedUser) {
      mentions.push(mentionedUser._id);
    }
  }

  // Prepare post data
  const postData = {
    userId: user._id,
    content: body.content,
    media: body.media,
    hashtags,
    mentions,
  };

  // Create the new post
  const newPost = await postModel.create(postData);

  if (!newPost) {
    throw new InternalServerError(
      "Failed to create post. Please try again later."
    );
  }

  return newPost;
};

export const viewAllPosts = async ({ page, limit }) => {
  try {
    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 10;

    // Calculate the skip value based on the page and limit
    const skip = (pageNumber - 1) * pageSize;

    // Fetch posts from the database, sorted by createdAt field in descending order (newest first)
    const [posts, totalPosts] = await Promise.all([
      postModel
        .find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .populate({
          path: "originalPostId",
          populate: {
            path: "userId",
            select: "username",
          },
        })
        .populate({
          path: "comments",
          populate: {
            path: "userId",
            select: "username",
          },
        })
        .populate("userId", "username"),
      postModel.countDocuments(),
    ]);

    // Calculate total number of pages
    const totalPages = Math.ceil(totalPosts / pageSize);

    // Return posts along with total posts count, current page number, and total pages
    return {
      totalPosts,
      currentPage: pageNumber,
      totalPages,
      posts,
    };
  } catch (error) {
    throw new Error(`Failed to fetch posts: ${error.message}`);
  }
};

export const viewSinglePost = async ({ post_id }) => {
  const post = await postModel
    .findById(post_id)
    .populate({
      path: "originalPostId",
      populate: {
        path: "userId",
        select: "username",
      },
    })
    .populate({
      path: "comments",
      populate: {
        path: "userId",
        select: "username",
      },
    })
    .populate("userId", "username");
  if (!post) throw new NotFoundError("Post not found");

  return post;
};

// export const viewPostLikes = async ({ user, post_id }) => {
//   const likes = await likeModel.findOne({ post_id });
//   return likes;
// };

export const likePost = async ({ user, post_id }) => {
  try {
    // Find the post
    const post = await postModel.findById(post_id);
    if (!post) {
      throw new NotFoundError("Post not found");
    }

    // Find the like document in the likes model
    const like = await likeModel.findOne({
      postId: post_id,
      userId: user._id,
    });

    // Check if the like already exists
    if (like) {
      // If like exists, remove it from the likes model
      await likeModel.findByIdAndDelete(like._id);

      // Remove the like ID from the post.likes array
      const indexToRemove = post.likes.indexOf(like._id);
      if (indexToRemove !== -1) {
        post.likes.splice(indexToRemove, 1);
      }
    } else {
      // Create a new like document
      const newLike = await likeModel.create({
        postId: post_id,
        userId: user._id,
        type: "comment",
      });

      // Add the like ID to the post.likes array
      post.likes.push(newLike._id);
    }

    // Save the updated post
    await post.save();

    // Return the updated post
    return post;
  } catch (error) {
    throw new Error(`Failed to like/unlike post: ${error.message}`);
  }
};

export const repostPost = async ({ user, post_id, body }) => {
  try {
    // Find the original post
    const originalPost = await postModel.findById(post_id);
    if (!originalPost) {
      throw new NotFoundError("Original post not found");
    }
    const hashtagRegex = /#[\w-]+/g;

    const mentionRegex = /@(\w+)/g;

    const hashtags = body.content.match(hashtagRegex) || [];

    const mentionMatches = body.content.match(mentionRegex) || [];
    const mentions = [];

    for (const match of mentionMatches) {
      const username = match.slice(1);

      const mentionedUser = await userModel.findOne({ username });

      if (mentionedUser) {
        mentions.push(mentionedUser._id);
      }
    }

    // Create the repost post object
    const repostPost = new postModel({
      userId: user._id,
      content: body.content || originalPost.content,
      media: body.media || originalPost.media,
      originalPostId: post_id,
      hashtags,
      mentions,
    });

    // Save the repost post
    const savedRepostPost = await repostPost.save();
    if (!savedRepostPost) {
      throw new InternalServerError("Failed to save repost post");
    }

    // Update the original post to track the users who reposted it
    originalPost.repostedBy.push(user._id);
    await originalPost.save();

    return savedRepostPost;
  } catch (error) {
    throw new Error(`Failed to repost post: ${error.message}`);
  }
};

export const createComment = async ({ post_id, user, body }) => {
  try {
    // Step 1: Find the Post using Post ID
    const post = await postModel.findById(post_id);
    if (!post) {
      throw new NotFoundError("Post not found");
    }
    // Step 2: Create a New Comment
    const hashtagRegex = /#[\w-]+/g;

    const mentionRegex = /@(\w+)/g;

    const hashtags = body.content.match(hashtagRegex) || [];

    const mentionMatches = body.content.match(mentionRegex) || [];
    const mentions = [];

    for (const match of mentionMatches) {
      const username = match.slice(1);

      const mentionedUser = await userModel.findOne({ username });

      if (mentionedUser) {
        mentions.push(mentionedUser._id);
      }
    }
    const commentData = {
      postId: post_id,
      userId: user._id,
      content: body.content,
      hashtags,
      mentions,
      media: {
        key: body.media.key,
      },
    };

    const newComment = await commentModel.create(commentData);

    // Step 3: Save the Comment to the Comment Model
    if (!newComment) {
      throw new BadRequestError("Failed to create comment");
    }

    // Step 4: Update the Post Model with the Comment ID
    post.comments.push(newComment._id);

    // Step 5: Save the Updated Post
    await post.save();

    return newComment;
  } catch (error) {
    throw new Error(`Failed to create comment: ${error.message}`);
  }
};

export const likeComment = async ({ user, comment_id }) => {
  try {
    // Find the comment
    const comment = await commentModel.findById(comment_id);
    if (!comment) {
      throw new NotFoundError("comment not found");
    }

    // Find the like document in the likes model
    const like = await likeModel.findOne({
      postId: comment_id,
      userId: user._id,
    });

    // Check if the like already exists
    if (like) {
      // If like exists, remove it from the likes model
      await likeModel.findByIdAndDelete(like._id);

      // Remove the like ID from the comment.likes array
      const indexToRemove = comment.likes.indexOf(like._id);
      if (indexToRemove !== -1) {
        comment.likes.splice(indexToRemove, 1);
      }
    } else {
      // Create a new like document
      const newLike = await likeModel.create({
        postId: comment_id,
        userId: user._id,
        type: "comment",
      });

      // Add the like ID to the comment.likes array
      comment.likes.push(newLike._id);
    }

    // Save the updated post
    await comment.save();

    // Return the updated post
    return comment;
  } catch (error) {
    throw new Error(`Failed to like/unlike a comment: ${error.message}`);
  }
};

export const viewPostComment = async ({ post_id, comment_id }) => {
  try {
    // Find the post
    const post = await postModel.findById(post_id);
    if (!post) {
      throw new NotFoundError("Post not found");
    }

    // Find the specific comment within the post's comments array
    const comment = post.comments.find((comment) => comment.equals(comment_id));
    if (!comment) {
      throw new NotFoundError("Comment not found");
    }

    const postComment = await commentModel.findById(comment);

    // Return the comment
    return { post: post, comment: postComment };
  } catch (error) {
    throw new Error(`Failed to fetch comment: ${error.message}`);
  }
};

export const viewAllPostComment = async ({ post_id, page, limit }) => {
  try {
    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 10;

    // Find the post
    const post = await postModel.findById(post_id);
    if (!post) {
      throw new NotFoundError("Post not found");
    }

    // Calculate skip value based on page and limit
    const skip = (pageNumber - 1) * pageSize;

    // Find all comments associated with the post, paginated
    const [comments, totalComments] = await Promise.all([
      commentModel
        .find({ postId: post_id })
        .sort({ createdAt: -1 }) // Sort by createdAt in descending order
        .skip(skip)
        .limit(pageSize),
      commentModel.countDocuments({ postId: post_id }),
    ]);

    // Calculate the total number of pages
    const totalPages = Math.ceil(totalComments / pageSize);

    // Return the post along with the paginated comments and pagination metadata
    return {
      currentPage: pageNumber,
      totalPages: totalPages,
      totalComments: totalComments,
      post: post,
      comments: comments,
    };
  } catch (error) {
    throw new Error(`Failed to fetch comment: ${error.message}`);
  }
};

export const deletePost = async (post_id) => {
  const deletedPost = await postModel.findOneAndDelete({
    _id: post_id,
    userId: user_id,
  });
  if (!deletedPost) throw new NotFoundError("post not found");

  return { message: "Post deleted successfully" };
};
