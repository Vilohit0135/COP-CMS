import mongoose from "mongoose";

const fieldSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    label: {
      type: String,
    },
    type: {
      type: String,
      enum: ["text", "textarea", "richtext", "image", "number", "email", "date", "select", "checkbox"],
      required: true,
    },
    required: {
      type: Boolean,
      default: false,
    },
    placeholder: String,
    options: [String], // For select field
  },
  { _id: true }
);

const sectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    apiIdentifier: {
      type: String,
      required: true,
    },
    description: String,
    fields: [fieldSchema],
    dataInstances: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        instanceId: String,
        data: mongoose.Schema.Types.Mixed,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { _id: true }
);

const pageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: String,
    sections: [sectionSchema],
    isPublished: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Page || mongoose.model("Page", pageSchema);
