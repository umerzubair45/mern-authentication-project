const Conversation = require("../models/Conversation");
const AppError = require("../utils/AppError");

const createConversation = async (req, res, next) => {
  try {
    const { receiverId } = req.body;

    const senderId = req.user.userId;

    if (!receiverId) {
      throw new AppError("Receiver is required.", 400);
    }

    let conversation = await Conversation.findOne({
      participants: {
        $all: [senderId, receiverId],
      },
    });

    if (conversation) {
      return res.status(200).json({
        conversation,
      });
    }

    conversation = await Conversation.create({
      participants: [senderId, receiverId],
    });

    res.status(201).json({
      message: "Conversation created successfully.",
      conversation,
    });
  } catch (error) {
    next(error);
  }
};

const getConversations = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const conversations = await Conversation.find({
      participants: {
        $elemMatch: {
          $eq: userId,
        },
      },
    })
      .populate("participants", "userName userEmail role isVerified lastSeen")
      .populate({
        path: "lastMessage",
        select: "message sender receiver createdAt status",
        populate: {
          path: "sender",
          select: "userName",
        },
      })
      .sort({
        updatedAt: -1,
      });

    res.status(200).json({
      conversations,
    });
  } catch (error) {
    next(error);
  }
};

const resetUnreadCount = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const userId = req.user.userId;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      throw new AppError("Conversation not found.", 404);
    }

    conversation.unreadCounts.set(userId, 0);

    await conversation.save();

    res.status(200).json({
      message: "Unread count cleared.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createConversation,
  getConversations,
  resetUnreadCount,
};
