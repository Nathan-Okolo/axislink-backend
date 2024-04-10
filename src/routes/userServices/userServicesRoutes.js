import express from "express";
import { authentication } from "../../middlewares/authentication.js";
import { viewProfileHandler } from "../../controller/userController/userControllers.js";

const userServiceRoutes = express.Router();

const userRoute = () => {
  userServiceRoutes.get("/view", authentication, viewProfileHandler);

  return userServiceRoutes;
};

export default userRoute;
