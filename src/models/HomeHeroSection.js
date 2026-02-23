import mongoose from "mongoose"

const SlideSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    subtitle: {
      type: String,
      trim: true
    },
    banner: {
      url: {
        type: String,
        required: true
      },
      alt: {
        type: String
      }
    }
  },
  { _id: true } // each slide gets its own id
)

const HomeHeroSectionSchema = new mongoose.Schema(
  {
    slides: {
      type: [SlideSchema],
      validate: {
        validator: function (val) {
          return val.length <= 5
        },
        message: "Hero section can have maximum 5 slides"
      }
    }
  },
  { timestamps: true }
)

export default mongoose.models.HomeHeroSection ||
  mongoose.model("HomeHeroSection", HomeHeroSectionSchema)