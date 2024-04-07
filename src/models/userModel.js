import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    username: { type: String, required: true, lowercase: true, trim: true, index: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    password: { type: String, default: '' },
    bio: { type: String, default: '' },
    avatar: { type: String, default: '' },
  },
  { timestamps: true }
);

export default model('User', userSchema);
