const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    message: {
      type: String,
      trim: true,
    },
    edited: {
      type: Boolean,
      default: false,
    },

    deleted: {
      type: Boolean,
      default: false,
    },

    messageType: {
      type: String,
      enum: ["text", "image", "file"],
      default: "text",
    },

    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Message", messageSchema);
