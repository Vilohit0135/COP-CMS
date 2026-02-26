import mongoose from "mongoose";

const pageContentSchema = new mongoose.Schema(
  {
    pageSlug: {
      type: String,
      required: true,
      index: true,
    },
    sectionIndex: {
      type: Number,
      required: true,
    },
    itemIndex: {
      type: Number,
      default: 0,
    },
    values: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Compound index for unique content per page/section/item
pageContentSchema.index({
  pageSlug: 1,
  sectionIndex: 1,
  itemIndex: 1,
});

export default mongoose.models.PageContent ||
  mongoose.model("PageContent", pageContentSchema);
