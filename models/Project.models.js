import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    customId: { type: String, required: true, unique: true }, // e.g., "01", "02"
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    client: { type: String, required: true },
    challenge: { type: String, required: true },
    solution: { type: String, required: true },
    result: { type: String, required: true },
    tech: [{ type: String }],
    tag: { type: String, required: true },
  },
  { timestamps: true },
);

export default mongoose.model("Project", projectSchema);
