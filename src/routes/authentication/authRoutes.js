import express from "express";
import { LoginHandler, signUpHandler, verifyOtpHandler } from "../../controller/authentication/authControllers.js";
import Validate from "../../validators/index.js";
import { otpCodeSchema, signUpSchema, validateLoginUserSchema } from "../../validators/authValidators.js";

const userAuthRoutes = express.Router();

const authRoute = () => {
  userAuthRoutes.post("/signup", Validate(signUpSchema), signUpHandler);
  userAuthRoutes.post(
    "/otp-verification",
    Validate(otpCodeSchema),
    verifyOtpHandler
  );
  userAuthRoutes.post(
    "/login",
    Validate(validateLoginUserSchema),
    LoginHandler
  );

  return userAuthRoutes;
};

export default authRoute;
