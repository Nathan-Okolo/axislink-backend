import express from "express";
import {
  LoginHandler,
  forgotPasswordHandler,
  getCodeHandler,
  loginPatientHandler,
  loginPatientOrgHandler,
  resendOtpHandler,
  resetPasswordHandler,
  signUpHandler,
  signUpPatientHandler,
  verifyOtpHandler,
} from "../../controller/authentication/authControllers.js";
import Validate from "../../validators/index.js";
import {
  otpCodeSchema,
  signUpSchema,
  validateForgotPassword,
  validateLoginUserSchema,
  validateResetForgotPassword,
} from "../../validators/authValidators.js";

const userAuthRoutes = express.Router();

const authRoute = () => {
  userAuthRoutes.post("/signup-patient", signUpPatientHandler);
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

  userAuthRoutes.post(
    "/patient-login",
    Validate(validateLoginUserSchema),
    loginPatientHandler
  );

  userAuthRoutes.post(
    "/patient-code",
    getCodeHandler
  );

  userAuthRoutes.post(
    "/patient-org-login",
    loginPatientOrgHandler
  );

  userAuthRoutes.post(
    "/forgot_password",
    Validate(validateForgotPassword),
    forgotPasswordHandler
  );
  userAuthRoutes.patch(
    "/reset_password",
    Validate(validateResetForgotPassword),
    resetPasswordHandler
  );
  userAuthRoutes.post(
    "/resend-otp",
    Validate(validateForgotPassword),
    resendOtpHandler
  );

  return userAuthRoutes;
};

export default authRoute;
