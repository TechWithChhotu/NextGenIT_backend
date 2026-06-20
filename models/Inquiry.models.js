import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true, default: "" },
    serviceInterest: {
      type: String,
      required: true,
      enum: [
        "web-development",
        "app-development",
        "digital-marketing",
        "logo-design",
        "graphic-design",
        "video-editing",
        "Other",
      ],
    },
    estimatedBudget: { type: String, required: true },
    description: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["New", "In-Discussion", "Converted", "Closed"],
      default: "New",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Inquiry", inquirySchema);
