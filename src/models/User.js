import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    role: {
      type: String,
      enum: ["admin", "editor", "viewer"],
      default: "viewer",
    },

    access: {
      type: [String],
      default: [],
      // Example: ["pages", "blogs", "providers", "users"]
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
      // Store Clerk user metadata or custom app data
    },
  },
  { timestamps: true }
)

export default mongoose.models.User || mongoose.model("User", userSchema)