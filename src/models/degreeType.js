import mongoose from "mongoose"

const degreeTypeSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
    trim: true
  },

  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  order: {
    type: Number,
    default: 0
  },

  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true })

degreeTypeSchema.index({ isActive: 1 })

export default mongoose.models.DegreeType ||
  mongoose.model("DegreeType", degreeTypeSchema)