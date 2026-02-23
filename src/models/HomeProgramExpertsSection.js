import mongoose from "mongoose"

const ProgramExpertSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    designation: {
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

const HomeProgramExpertsSectionSchema = new mongoose.Schema(
  {
    sectionTitle: {
      type: String,
      default: "Meet Our Program Experts"
    },
    experts: {
      type: [ProgramExpertSchema],
      validate: {
        validator: function (val) {
          return val.length <= 8
        },
        message: "Maximum 8 program experts allowed"
      }
    }
  },
  { timestamps: true }
)

export default mongoose.models.HomeProgramExpertsSection ||
  mongoose.model(
    "HomeProgramExpertsSection",
    HomeProgramExpertsSectionSchema
  )