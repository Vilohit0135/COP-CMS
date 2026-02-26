import mongoose from "mongoose"

const inviteSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    access: {
      type: [String],
      default: [],
      // Example: ["pages", "blogs", "providers"]
    },

    // User role: "admin" for full access, "viewer" for section-based access
    role: {
      type: String,
      enum: ["admin", "viewer"],
      default: "viewer",
    },

    // Password setup token (raw token sent in email, hashed for storage)
    passwordSetupTokenHash: {
      type: String,
      required: true,
    },

    // When the token expires (typically 72 hours)
    passwordSetupExpiresAt: {
      type: Date,
      required: true,
    },

    // Status of the invite
    status: {
      type: String,
      enum: ["pending", "accepted", "expired"],
      default: "pending",
    },

    // When the invite was accepted (if ever)
    acceptedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
)

// Index to clean up expired invites
inviteSchema.index({ passwordSetupExpiresAt: 1 })
inviteSchema.index({ email: 1 })

export default mongoose.models.Invite || mongoose.model("Invite", inviteSchema)
