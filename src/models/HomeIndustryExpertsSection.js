import mongoose from "mongoose"

const ExpertSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    title: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    photo: {
      url: {
        type: String,
        required: true
      },
      alt: {
        type: String
      }
    }
  },
  { _id: true }
)

const HomeIndustryExpertsSectionSchema = new mongoose.Schema(
  {
    sectionTitle: {
      type: String,
      default: "Learn From Industry Experts"
    },
    experts: {
      type: [ExpertSchema],
      validate: {
        validator: function (val) {
          return val.length <= 8
        },
        message: "Maximum 8 experts allowed"
      }
    }
  },
  { timestamps: true }
)

export default mongoose.models.HomeIndustryExpertsSection ||
  mongoose.model(
    "HomeIndustryExpertsSection",
    HomeIndustryExpertsSectionSchema
  )