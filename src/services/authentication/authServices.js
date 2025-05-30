import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  BadRequestError,
  InternalServerError,
  InvalidError,
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
import notificationModel from "../../models/notificationModel.js";
import patientModel from "../../models/patientModel.js";

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
      displayName: body.displayName,
      username: body.username,
      email: body.email,
      password,
      otpCode: hash,
      isVerified,
      avatar: body.avatar,
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
    // create notification for member
    await notificationModel.create({
      note: `You have successfully  created a new account`,
      user_id: createUser._id,
    });
    return { hash, email: body.email };
  } catch (error) {
    console.log(error);
    throw new BadRequestError(
      error.message || "Invalid request. Please check your inputs"
    );
  }
};

export const signUpPatient = async ({ body }) => {
  try {
    // Check if the email already exists
    const existingEmailUser = await patientModel.findOne({
      "contactInformation.email": body.email,
    });

    if (existingEmailUser) {
      throw new BadRequestError("Email already exists");
    }
    if (!body.profileImage) {
      body.profileImage = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7vB-49_BT-dirwttYZaeE_VByjlQ3raVJZg&s'
    }

    // Generate OTP
    const otp = await codeGenerator(4, "1234ABCD");

    // Prepare patient data
    const patientData = {
      contactInformation: body.contactInformation,
      medicalInfo: body.medicalInfo,
      emergencyContacts: body.emergencyContacts,
      vitals: body.vitals,
      otp,
      gender: body.gender,
      password: body.password,
      username: body.username,
      dob: body.dob,
      profileImage: body.profileImage,
    };

    // Save the patient to the database
    const createUser = await patientModel.create(patientData);
    if (!createUser) {
      throw new InternalServerError("Failed to create patient");
    }

    // Send Welcome email
    const mailData = {
      email: body.contactInformation.email,
      subject: "Welcome to Our Platform!",
      type: "html",
      html: `<p>Dear ${body.username},</p>
             <p>Welcome to our platform! We are excited to have you on board.</p>
             <p>If you have any questions, feel free to reach out to our support team.</p>
             <p>Best regards,</p>
             <p>The Team</p>`,
      text: `Dear ${body.username},\n\nWelcome to our platform! We are excited to have you on board.\n\nIf you have any questions, feel free to reach out to our support team.\n\nBest regards,\nThe Team`,
    };

    const formattedMailInfo = await formattMailInfo(mailData, env);
    const msgDelivered = await messageBird(formattedMailInfo);

    if (!msgDelivered) {
      console.warn("Failed to send Welcome email");
    }

    return { otp, createUser };
  } catch (error) {
    console.error(error);
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
  const randToken = await codeGenerator(4, "1234ABCD");

  user.token = randToken;
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
    throw new InvalidError("Invalid Email or password");
  }
  // Compare passwords
  const isMatch = await bcrypt.compare(password, checkUser.password);

  // If passwords do not match, throw error
  if (!isMatch) {
    throw new InvalidError("Invalid email or Password");
  }

  // Check if OTP is verified
  if (!checkUser.isVerified) {
    return {
      message: "account not verified",
      isVerified: false
    };
  }
  const randToken = await codeGenerator(4, "1234ABCD");

  //save token inside user
  checkUser.token = randToken;
  await checkUser.save();

  // Convert user to JSON
  const user = checkUser.toJSON();

  // Sign JWT token
  const token = jwt.sign({ ...user }, env.jwt_key);

  // Return token
  return { token };
};

export const loginPatient = async ({ body }) => {
  // Find the patient by email
  const checkPatient = await patientModel.findOne({
    "contactInformation.email": body.email,
  });

  // If patient not found, throw error
  if (!checkPatient) {
    throw new InvalidError("Invalid Email or Password");
  }

  // Compare passwords directly
  if (body.password !== checkPatient.password) {
    throw new InvalidError("Invalid Email or Password");
  }

  // Convert user to JSON
  const user = checkPatient.toJSON();

  // Return token
  return { user };
};

export const getCode = async ({ body }) => {
  // Find the patient by email
  const checkPatient = await patientModel.findOne({
    "contactInformation.email": body.email,
  });

  if (!checkPatient) {
    throw new InvalidError("Patient not found");
  }
  const otp = await codeGenerator(4, "1234ABCD");
  checkPatient.otp = otp;
  checkPatient.save();
  // If patient not found, throw error
  if (!checkPatient) {
    throw new InvalidError("Invalid Email or Password");
  }

  // Send OTP email
  const mailData = {
    email: checkPatient.contactInformation.email,
    subject: "Your OTP Code for Account Access",
    type: "html",
    html: `<p>Dear ${checkPatient.username},</p>
         <p>Your OTP code to share with your healthcare provider for account access is: <strong>${otp}</strong>.</p>
         <p>Please provide this code to your healthcare provider to enable them view your account.</p>
         <p>If you have any questions, feel free to reach out to our support team.</p>
         <p>Best regards,</p>
         <p>The Team</p>`
  };

  const formattedMailInfo = await formattMailInfo(mailData, env);
  const msgDelivered = await messageBird(formattedMailInfo);

  if (!msgDelivered) {
    console.warn("Failed to send Welcome email");
  }

  return true
};

export const loginPatientOrg = async ({ body }) => {
  // Find the patient by email
  const checkPatient = await patientModel.findOne({
    "contactInformation.email": body.email,
  });

  // If patient not found, throw error
  if (!checkPatient) {
    throw new InvalidError("Invalid Authorization");
  }

  // Compare passwords directly
  if (body.otp !== checkPatient.otp) {
    throw new InvalidError("Invalid Authorization");
  }

  // Convert user to JSON
  const user = checkPatient.toJSON();

  // Return token
  return { user };
};

export const forgotPassword = async ({ body }) => {
  const { email } = body;
  const checkUser = await userModel.findOne({ email });
  if (!checkUser) throw new NotFoundError("account does not exist");

  const otpCode = await codeGenerator(6, "1234567890");

  // const hashNewPassword = await bcrypt.hash(newPassword, 10);

  const hash = buildOtpHash(email, otpCode, env.otpKey, 15);

  // checkMember.password = hashNewPassword
  checkUser.password = hash;

  checkUser.save();

  // Send OTP email
  const mailData = {
    email: body.email,
    subject: "Password Reset",
    type: "html",
    html: `<p>Your OTP for account Password Reset is: ${otpCode}</p>`,
    text: `Your OTP for account Password Reset is: ${otpCode}`,
  };

  const formattedMailInfo = await formattMailInfo(mailData, env);
  const msgDelivered = await messageBird(formattedMailInfo);

  if (!msgDelivered) {
    throw new InternalServerError("Failed to send Password Reset email");
  }

  // return { email: checkMember.contact.email };
  return { hash: hash, email: body.email };
};

export const resetPassword = async ({ body, email }) => {
  const { code, hash } = body;

  const checkUser = await userModel.findOne({ email });
  if (!checkUser) throw new NotFoundError("account does not exist");

  const verifyOtp = verifyOTP(email, code, hash, env.otpKey);
  if (!verifyOtp) throw new InvalidError("Wrong otp code");
  const password = await bcrypt.hash(body.password, 12);

  checkUser.password = password;
  const randToken = await codeGenerator(4, "1234ABCD");

  //save token inside user
  checkUser.token = randToken;

  await checkUser.save();

  // create notification for member
  await notificationModel.create({
    note: `You have successfully  changed your password`,
    user_id: checkUser._id,
  });

  return true;
};

export const resendOtp = async ({ body }) => {
  const checkUser = await userModel.findOne({ email: body.email });

  if (!checkUser) throw new NotFoundError("User does not exists");
  // Check if OTP is verified
  if (checkUser.isVerified) {
    throw new BadRequestError("Acount already verified");
  }

  const rawOtpCode = await codeGenerator(6, "1234567890");

  const hash = buildOtpHash(body.email, rawOtpCode, env.otpKey, 10);

  checkUser.otpCode = hash;

  checkUser.save();

  // Send OTP email
  const mailData = {
    email: body.email,
    subject: "OTP for Account Verification",
    type: "html",
    html: `<p>Your OTP for account verification is: ${rawOtpCode}</p>`,
    text: `Your OTP for account verification is: ${rawOtpCode}`,
  };

  const formattedMailInfo = await formattMailInfo(mailData, env);
  const msgDelivered = await messageBird(formattedMailInfo);

  if (!msgDelivered) {
    throw new InternalServerError("Failed to send OTP email");
  }

  return { hash, email: body.email };
};
