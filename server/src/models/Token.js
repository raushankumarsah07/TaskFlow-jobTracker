import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true },
  type: { type: String, enum: ['refresh', 'reset'], default: 'refresh' },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now, expires: 0 },
});

tokenSchema.index({ userId: 1, type: 1 });
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Token = mongoose.model('Token', tokenSchema);
