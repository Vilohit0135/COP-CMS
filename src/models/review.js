import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    // Reference to the provider being reviewed
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
      required: true,
    },

    // Reviewer name
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Reviewer email
    email: {
      type: String,
      required: true,
      trim: true,
    },

    // Review rating (1-5 stars)
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    // Review title
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // Full review text
    comment: {
      type: String,
      required: true,
    },

    // Is this review visible on the frontend?
    isActive: {
      type: Boolean,
      default: false,
    },

    // Source of review submission
    source: {
      type: String,
      default: "website_form",
      enum: ["website_form", "manual", "import"],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Review || mongoose.model("Review", reviewSchema);
