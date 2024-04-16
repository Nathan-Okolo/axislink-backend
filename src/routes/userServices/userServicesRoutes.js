import express from "express";
import { authentication } from "../../middlewares/authentication.js";
import {
  deleteUserProfileHandler,
  viewProfileHandler,
} from "../../controller/userController/userControllers.js";
const userServiceRoutes = express.Router();

const userRoute = () => {
  userServiceRoutes.get("/view", authentication, viewProfileHandler);
  userServiceRoutes.delete("/delete", authentication, deleteUserProfileHandler);
  return userServiceRoutes;
};

export default userRoute;
