import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    otpCode: { type: String, default: "" },
    password: { type: String, default: "" },
    bio: { type: String, default: "" },
    avatar: {
      key: { type: String },
    },
    acctstatus: {
      type: String,
      enum: ["pending", "active", "declined", "suspended"],
      default: "pending",
      index: true,
    },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default model("User", userSchema);
