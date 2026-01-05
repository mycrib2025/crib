import mongoose from "mongoose";

const worldSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true // one world per user
    },

    name: {
      type: String,
      required: true
    },

    mood: {
      type: String,
      default: "default"
    },

    stars: {
      type: Boolean,
      default: true
    },

    clouds: {
      type: Boolean,
      default: true
    },

    aurora: {
      type: Boolean,
      default: false
    },

    fantasyLevel: {
      type: Number,
      default: 50
    },

    dreamIntensity: {
      type: Number,
      default: 50
    },

    // 🔐 WORLD PRIVACY
    isPrivate: {
      type: Boolean,
      default: false
    },

    // 👀 USERS ALLOWED TO VIEW PRIVATE WORLD
    allowedViewers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    // ✋ USERS REQUESTING ACCESS
    accessRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    // 🖼 SNAPSHOT PREVIEW (followers see this)
    snapshot: {
      type: String
    }
  },
  { timestamps: true }
);

export default mongoose.model("World", worldSchema);
