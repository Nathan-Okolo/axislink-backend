import appResponse from "../../lib/appResponse.js";
import {
  deletePost,
  likePost,
  makePost,
  repostPost,
  viewAllPosts,
  viewSinglePost,
} from "../../services/postServices/postServices.js";

export const makePostHandler = async (req, res) => {
  const { body, user } = req;

  const newPost = await makePost({ body, user });

  res.send(appResponse("Succefully made a new post", newPost));
};

export const viewAllPostsHandler = async (req, res) => {
  const posts = await viewAllPosts({});

  res.send(appResponse("Fatched all post succefully", posts));
};

export const viewSinglePostHandler = async (req, res) => {
  const { post_id } = req.params;

  const post = await viewSinglePost({ post_id });

  res.send(appResponse("viewing single post successfully", post));
};

export const likePostHandler = async (req, res) => {
  const { user } = req;
  const { post_id } = req.params;

  const post = await likePost({ user, post_id });

  res.send(appResponse("succefully liked or unliked a post", post));
};

export const repostPostHandler = async (req, res) => {
  const { user, body } = req;
  const { post_id } = req.params;
  const { content } = body;

  const repost = await repostPost({ user, post_id, content });

  res.send(appResponse("succefully reposted a post", repost));
};

export const deletePostsHandler = async (req, res) => {
  const { user } = req;
  const { post_id } = req.params;

  const post = await deletePost({ user, post_id });

  res.send(appResponse("deleted post successfully", post));
};
