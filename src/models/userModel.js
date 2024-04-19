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
    likes: [{ type: Schema.Types.ObjectId, ref: "Like" }],
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

// Post Schema
const postSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    content: { type: String, required: true },
    media: {
      key: { type: String },
    },
    likes: [{ type: Schema.Types.ObjectId, ref: "Like" }],
    repostedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    hashtags: [{ type: String }],
    mentions: [{ type: Schema.Types.ObjectId, ref: "User" }],
    originalPostId: { type: Schema.Types.ObjectId, ref: "Post" },
  },
  { timestamps: true }
);
// Define a virtual property to calculate points based on likes
userSchema.virtual("points").get(function () {
  return this.likes.length; // You can adjust the calculation method based on your requirements
});

// Define a method to update points
userSchema.methods.updatePoints = async function () {
  try {
    const user = this;
    user.points = user.likes.length;
    await user.save();
  } catch (error) {
    console.error(error);
    throw new Error("Failed to update points.");
  }
};

// Mongoose middleware to automatically update points when likes are updated
userSchema.pre("save", async function (next) {
  const user = this;
  // If likes have changed, update points
  if (user.isModified("likes")) {
    await user.updatePoints();
  }
  next();
});

const User = model("User", userSchema);

export default User;
