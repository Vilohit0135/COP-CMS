import mongoose from "mongoose"

const ContentBlockSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["text", "image"],
      required: true
    },
    value: {
      type: String,
      required: true
    },
    align: {
      type: String,
      enum: ["left", "center", "right"],
      default: "left"
    }
  },
  { _id: true }
)

const BlogSchema = new mongoose.Schema(
  {
    title: {
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

    summary: {
      type: String,
      trim: true
    },

    author: {
      name: {
        type: String,
        required: true,
        trim: true
      },
      photo: {
        type: String
      }
    },

    thumbnail: {
      type: String
    },

    readingTime: {
      type: Number,
      default: 0
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft"
    },

    tags: {
      type: [String],
      default: []
    },

    content: {
      type: [ContentBlockSchema],
      default: []
    },

    seo: {
      metaTitle: String,
      metaDescription: String,
      canonicalUrl: String
    }
  },
  { timestamps: true }
)

export default mongoose.models.Blog ||
  mongoose.model("Blog", BlogSchema)