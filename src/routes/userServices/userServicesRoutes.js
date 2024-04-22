import express from "express";
import { authentication } from "../../middlewares/authentication.js";
import {
  deleteUserProfileHandler,
  followUserHandler,
  getUserPointHandler,
  updateUserProfileHandler,
  viewConnectionHandler,
  viewProfileHandler,
} from "../../controller/userController/userControllers.js";
const userServiceRoutes = express.Router();

const userRoute = () => {
  userServiceRoutes.get("/view", authentication, viewProfileHandler);
  userServiceRoutes.get("/point", authentication, getUserPointHandler);
  userServiceRoutes.get("/connection", authentication, viewConnectionHandler);
  userServiceRoutes.post("/follow", authentication, followUserHandler);
  userServiceRoutes.patch("/update", authentication, updateUserProfileHandler);
  userServiceRoutes.delete("/delete", authentication, deleteUserProfileHandler);
  return userServiceRoutes;
};

export default userRoute;
