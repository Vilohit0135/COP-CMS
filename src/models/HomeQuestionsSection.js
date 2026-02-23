import mongoose from "mongoose"

const QuestionCardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    subtitle: {
      type: String,
      required: true,
      trim: true
    }
  },
  { _id: true }
)

const HomeQuestionsSectionSchema = new mongoose.Schema(
  {
    sectionTitle: {
      type: String,
      default: "Qestions & Answers",
      trim: true
    },

    cards: {
      type: [QuestionCardSchema],
      validate: {
        validator: function (val) {
          return val.length <= 8
        },
        message: "Maximum 8 question cards allowed"
      }
    }
  },
  { timestamps: true }
)

export default mongoose.models.HomeQuestionsSection ||
  mongoose.model("HomeQuestionsSection", HomeQuestionsSectionSchema)