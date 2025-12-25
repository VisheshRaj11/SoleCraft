
import mongoose from 'mongoose';

const designSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  templateId: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  customization: {
    color: String,
    material: String,
    size: String,
    customName: String
  },
  price: {
    type: Number,
    required: true
  },
  imageUrl: {
    type: String // In case we want to store a generated image URL later
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Design', designSchema);

