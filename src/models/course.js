import mongoose from "mongoose"

const courseSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
    trim: true
  },

  slug: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },

  degreeTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DegreeType",
    required: true
  },

  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true })

// Prevent duplicate course under same degree type
courseSchema.index(
  { slug: 1, degreeTypeId: 1 },
  { unique: true }
)

courseSchema.index({ degreeTypeId: 1 })
courseSchema.index({ isActive: 1 })

export default mongoose.models.Course ||
  mongoose.model("Course", courseSchema)