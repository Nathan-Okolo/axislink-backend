import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const postSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: true },
    likesCount: { type: Number, default: 0 },
    repostsCount: { type: Number, default: 0 },
    originalPostId: { type: Schema.Types.ObjectId, ref: 'Post' }, // For reposts
  },
  { timestamps: true }
);

export default model('Post', postSchema);
