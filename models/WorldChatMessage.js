import mongoose from "mongoose";

const worldChatMessageSchema = new mongoose.Schema(
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
    message: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("WorldChatMessage", worldChatMessageSchema);
