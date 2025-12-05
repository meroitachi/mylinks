import mongoose from "mongoose";

const LinkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true }
});

export default mongoose.models.Link || mongoose.model("Link", LinkSchema);
