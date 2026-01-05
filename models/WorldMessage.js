import mongoose from "mongoose";

const worldMessageSchema = new mongoose.Schema(
  {
    world: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "World",
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    text: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("WorldMessage", worldMessageSchema);
