import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from "../../lib/appErrors.js";
import userModel from "../../models/userModel.js";
import {
  codeGenerator,
  buildOtpHash,
  verifyOTP,
} from "../../utils/codeGenerator.js";
import { formattMailInfo } from "../../utils/mailFormatter.js";
import { messageBird } from "../../utils/msgBird.js";
import env from "../../config/env.js";

export const signUpUser = async ({ body }) => {
  try {
    // Check if the email and username already exist
    const existingEmailUser = await userModel.findOne({ email: body.email });
    const existingUsernameUser = await userModel.findOne({
      username: body.username,
    });

    if (existingEmailUser) {
      throw new BadRequestError("Email already exists");
    }

    if (existingUsernameUser) {
      throw new BadRequestError("Username already exists");
    }

    // Hash the password
    const password = await bcrypt.hash(body.password, 12);

    // Generate OTP
    const otp = await codeGenerator(6, "1234567890");
    const hash = buildOtpHash(body.email, otp, env.otpKey, 10);
    const isVerified = false;

    // Save the user to the database
    const data = {
      username: body.username,
      email: body.email,
      password,
      otpCode: hash,
      isVerified,
    };
    const createUser = await userModel.create(data);
    if (!createUser) {
      throw new InternalServerError("Failed to create user");
    }

    // Send OTP email
    const mailData = {
      email: body.email,
      subject: "OTP for Account Verification",
      type: "html",
      html: `<p>Your OTP for account verification is: ${otp}</p>`,
      text: `Your OTP for account verification is: ${otp}`,
    };

    const formattedMailInfo = await formattMailInfo(mailData, env);
    const msgDelivered = await messageBird(formattedMailInfo);

    if (!msgDelivered) {
      throw new InternalServerError("Failed to send OTP email");
    }

    return { hash, email: body.email };
  } catch (error) {
    console.log(error);
    throw new BadRequestError(
      error.message || "Invalid request. Please check your inputs"
    );
  }
};

export const userOtpVerifcation = async ({ body, email }) => {
  const { otpCode, hash } = body;

  // Find the user by email
  const user = await userModel.findOne({
    email: email,
    isVerified: false,
  });

  // Handle if user is not found
  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Check if the user's OTP is already verified
  if (user.isVerified === true) {
    throw new DuplicateError(
      "OTP Code has already been verified. You can log in."
    );
  }

  // Verify the OTP
  const verifyOtp = verifyOTP(email, otpCode, hash, env.otpKey);

  // Handle if OTP verification fails
  if (!verifyOtp) {
    throw new InvalidError("Incorrect OTP code");
  }

  // Check if the provided OTP hash matches the stored hash
  if (user.otpCode !== hash) {
    throw new InvalidError("OTP mismatch");
  }

  // Clear OTP code and mark user as verified
  user.otpCode = "";
  user.isVerified = true;

  // Generate JWT token
  const token = jwt.sign({ ...user.toJSON() }, env.jwt_key);

  // Save the updated user data
  await user.save();

  // Return the generated token
  return { token };
};

export const loginUser = async ({ body }) => {
  const { email, password } = body;

  // Find the user by email
  const checkUser = await userModel.findOne({ email });

  // If user not found, throw error
  if (!checkUser) {
    throw new InvalidError("Invalid email or password");
  }

  // Compare passwords
  const isMatch = await bcrypt.compare(password, checkUser.password);
  
  // If passwords do not match, throw error
  if (!isMatch) {
    throw new InvalidError("Invalid email or password");
  }

  // Check if OTP is verified
  if (!checkUser.isVerified) {
    throw new BadRequestError(
      "Please verify your account using the OTP sent to your email"
    );
  }

  // Convert user to JSON
  const user = checkUser.toJSON();

  // Sign JWT token
  const token = jwt.sign({ ...user }, env.jwt_key);

  // Return token
  return { token };
};