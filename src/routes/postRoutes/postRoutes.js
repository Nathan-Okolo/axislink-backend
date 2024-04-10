import express from "express";
import Validate from "../../validators/index.js";
import { authentication } from "../../middlewares/authentication.js";
import {
  deletePostsHandler,
  likePostHandler,
  makePostHandler,
  repostPostHandler,
  viewAllPostsHandler,
  viewSinglePostHandler,
} from "../../controller/postContoller/postController.js";
import { postSchema, viewPost } from "../../validators/postValidators.js";

const postServiceRoutes = express.Router();

const postRoute = () => {
  postServiceRoutes.post(
    "/make-post",
    Validate(postSchema),
    authentication,
    makePostHandler
  );
  postServiceRoutes.get("/view-all-posts", viewAllPostsHandler);
  postServiceRoutes.get(
    "/view-single-posts/:post_id",
    Validate(viewPost, "params"),
    viewSinglePostHandler
  );
  postServiceRoutes.post(
    "/like-post/:post_id",
    Validate(viewPost, "params"),
    authentication,
    likePostHandler
  );
  postServiceRoutes.post("/repost", authentication, repostPostHandler);
  postServiceRoutes.delete(
    "/delete-post/:post_id",
    Validate(viewPost, "params"),
    authentication,
    deletePostsHandler
  );

  return postServiceRoutes;
};

export default postRoute;
