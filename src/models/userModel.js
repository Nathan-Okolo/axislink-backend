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
    posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    points: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
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
    token: { type: String },
  },
  { timestamps: true }
);

const User = model("User", userSchema);

export default User;
