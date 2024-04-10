import mongoose from "mongoose";

const { Schema, model } = mongoose;

const postSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: true },
    media: [{ type: String }],
    likes: [{ type: Schema.Types.ObjectId, ref: 'Like' }],
    repostedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }], // Track users who reposted the post
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    hashtags: [{ type: String }], // Array of hashtags
    mentions: [{ type: Schema.Types.ObjectId, ref: 'User' }], // Mentioned users
    originalPostId: { type: Schema.Types.ObjectId, ref: 'Post' },
  },
  { timestamps: true }
);

export default model("Post", postSchema);
