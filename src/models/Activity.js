import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    // User who made the action
    userId: {
      type: String,
      required: true, // Clerk user ID
    },

    userName: {
      type: String,
      required: true,
    },

    userEmail: {
      type: String,
    },

    // What action was performed
    action: {
      type: String,
      enum: ["create", "update", "delete", "view"],
      required: true,
    },

    // Which section this activity belongs to
    section: {
      type: String,
      enum: [
        "leads",
        "courses",
        "blogs",
        "providers",
        "specializations",
        "degree-types",
        "provider-courses",
        "reviews",
      ],
      required: true,
    },

    // The ID of the item that was modified
    itemId: {
      type: String,
    },

    // Name/title of the item
    itemName: {
      type: String,
    },

    // Details of what changed
    details: {
      type: String, // JSON string or plain text description
    },

    // IP address (optional)
    ipAddress: {
      type: String,
    },

    // Status of the activity
    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
    },
  },
  { timestamps: true }
);

// Index for quick queries
activitySchema.index({ userId: 1, createdAt: -1 });
activitySchema.index({ section: 1, createdAt: -1 });
activitySchema.index({ createdAt: -1 });

export default mongoose.models.Activity ||
  mongoose.model("Activity", activitySchema);
