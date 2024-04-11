import mongoose from "mongoose";

const { Schema, model } = mongoose;

const likeSchema = new Schema(
  {
    postId: { type: Schema.Types.ObjectId, ref: "Post" },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    type: { type: String, enum: ["post", "comment"], required: true },
  },
  { timestamps: true }
);

export default model("Like", likeSchema);
