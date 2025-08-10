import mongoose from 'mongoose'
const SiteSchema = new mongoose.Schema({
  name: String,
  description: String,
  heroImage: String,
  gallery: [String],
  rooms: [{ title: String, description: String, image: String, price: Number }]
},{ timestamps: true })
export default mongoose.models.Site || mongoose.model('Site', SiteSchema)
