import express from "express";
import { authentication } from "../../middlewares/authentication.js";
import {
  deleteUserProfileHandler,
  getUserPointHandler,
  viewProfileHandler,
} from "../../controller/userController/userControllers.js";
const userServiceRoutes = express.Router();

const userRoute = () => {
  userServiceRoutes.get("/view", authentication, viewProfileHandler);
  userServiceRoutes.get("/point", authentication, getUserPointHandler);
  userServiceRoutes.delete("/delete", authentication, deleteUserProfileHandler);
  return userServiceRoutes;
};


export default userRoute;
