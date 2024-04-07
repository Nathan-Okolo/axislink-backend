import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const repostSchema = new Schema(
  {
    originalPostId: { type: Schema.Types.ObjectId, ref: 'Post' },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default model('Repost', repostSchema);
