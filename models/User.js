import mongoose from 'mongoose'
const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  phone: String,
  passwordHash: String,
  role: { type: String, default: 'editor' },
  refreshTokens: [{ token: String, createdAt: Date }],
  otp: { code: String, expiresAt: Date }
},{ timestamps: true })
export default mongoose.models.User || mongoose.model('User', UserSchema)
