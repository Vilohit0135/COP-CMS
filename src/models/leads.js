import mongoose from "mongoose";

const leadsSchema = new mongoose.Schema(
  {
    // ============================================================
    // BASIC INFORMATION
    // ============================================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    // Optional: which course/provider they're interested in
    courseOfInterest: {
      type: String,
    },

    // Message or inquiry from the lead
    message: {
      type: String,
    },

    // ============================================================
    // STATUS & COMMUNICATION TRACKING
    // ============================================================

    // Call status: pending, called, did_not_answer, called_and_helped, need_follow_up, schedule_call
    callStatus: {
      type: String,
      enum: ["pending", "called", "did_not_answer", "called_and_helped", "need_follow_up", "schedule_call"],
      default: "pending",
    },

    // Counselor notes/updates
    notes: {
      type: String,
    },

    // Assigned counselor (optional reference to user/admin)
    assignedTo: {
      type: String, // Can store username or staff name
    },

    // Date when last update was made
    lastUpdated: {
      type: Date,
      default: null,
    },

    // Scheduled call date/time (if needed)
    scheduledCallDate: {
      type: Date,
    },

    // ============================================================
    // META
    // ============================================================

    isActive: {
      type: Boolean,
      default: true,
    },

    source: {
      type: String, // e.g., "website_form", "phone_inquiry", "social_media"
      default: "website_form",
    },
  },
  { timestamps: true }
);

// ============================================================
// INDEXES
// ============================================================

leadsSchema.index({ email: 1 });
leadsSchema.index({ phone: 1 });
leadsSchema.index({ callStatus: 1 });
leadsSchema.index({ createdAt: -1 });
leadsSchema.index({ assignedTo: 1 });

export default mongoose.models.Leads ||
  mongoose.model("Leads", leadsSchema);
