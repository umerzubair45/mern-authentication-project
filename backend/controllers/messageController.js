const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

/*
==========================================================
Create Message
==========================================================
*/
const createMessage = async ({
  senderId,
  receiverId,
  message,
  replyTo = null,
}) => {
  /*
  ==========================================
  FIND CONVERSATION
  ==========================================
  */

  let conversation = await Conversation.findOne({
    participants: {
      $all: [senderId, receiverId],
    },
  });

  /*
  ==========================================
  CREATE CONVERSATION IF NOT EXISTS
  ==========================================
  */

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, receiverId],
    });
  }

  /*
  ==========================================
  CREATE MESSAGE
  ==========================================
  */

  const newMessage = await Message.create({
    conversation: conversation._id,
    sender: senderId,
    receiver: receiverId,
    message,
    replyTo: replyTo || null,
  });

  conversation.unreadCounts.set(
    receiverId.toString(),
    (conversation.unreadCounts.get(receiverId.toString()) || 0) + 1,
  );

  conversation.unreadCounts.set(
    senderId.toString(),
    conversation.unreadCounts.get(senderId.toString()) || 0,
  );
  conversation.lastMessage = newMessage._id;

  await conversation.save();

  /*
  ==========================================
  RETURN POPULATED MESSAGE
  ==========================================
  */

  const populatedConversation = await Conversation.findById(conversation._id)
    .populate("participants", "userName userEmail role isVerified")
    .populate({
      path: "lastMessage",
      select: "message sender receiver createdAt status",
      populate: {
        path: "sender",
        select: "userName",
      },
    });

  const populatedMessage = await Message.findById(newMessage._id)
    .populate("sender", "userName userEmail role")
    .populate("receiver", "userName userEmail role")
    .populate({
      path: "replyTo",
      select: "message sender receiver createdAt",
      populate: {
        path: "sender",
        select: "userName userEmail",
      },
    })
    .populate({
      path: "conversation",
      populate: {
        path: "participants",
        select: "userName userEmail role isVerified",
      },
    });

  populatedMessage._doc.conversation = populatedConversation;

  return populatedMessage;
};

/*
==========================================================
Get Messages of a Conversation
GET /api/messages/:conversationId
==========================================================
*/
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({
      conversation: conversationId,
    })
      .populate("sender", "userName userEmail role")
      .populate("receiver", "userName userEmail role")

      .populate({
        path: "replyTo",
        select: "message sender",
        populate: {
          path: "sender",
          select: "userName",
        },
      })
      .sort({
        createdAt: 1,
      });

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Get Messages Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch messages.",
    });
  }
};

const markDelivered = async (messageId) => {
  return await Message.findByIdAndUpdate(
    messageId,
    { status: "delivered" },
    { returnDocument: "after" },
  )
    .populate("sender", "userName userEmail role")
    .populate("receiver", "userName userEmail role")
    .populate({
      path: "replyTo",
      select: "message sender receiver createdAt",
      populate: {
        path: "sender",
        select: "userName userEmail",
      },
    })
    .populate({
      path: "conversation",
      populate: {
        path: "participants",
        select: "userName userEmail role isVerified",
      },
    });
};
const markRead = async (messageId) => {
  return await Message.findByIdAndUpdate(
    messageId,
    { status: "read" },
    { returnDocument: "after" },
  )
    .populate("sender", "userName userEmail role")
    .populate("receiver", "userName userEmail role")
    .populate({
      path: "replyTo",
      select: "message sender receiver createdAt",
      populate: {
        path: "sender",
        select: "userName userEmail",
      },
    })
    .populate({
      path: "conversation",
      populate: {
        path: "participants",
        select: "userName userEmail role isVerified",
      },
    });
};
const editMessage = async (messageId, userId, newMessage) => {
  const message = await Message.findById(messageId);

  if (!message) {
    throw new Error("Message not found.");
  }

  // Only sender can edit
  if (message.sender.toString() !== userId.toString()) {
    throw new Error("You can only edit your own messages.");
  }

  if (!newMessage?.trim()) {
    throw new Error("Message cannot be empty.");
  }

  message.message = newMessage.trim();
  message.edited = true;

  await message.save();

  return await Message.findById(message._id)
    .populate("sender", "userName userEmail role")
    .populate("receiver", "userName userEmail role")
    .populate({
      path: "replyTo",
      select: "message sender receiver createdAt",
      populate: {
        path: "sender",
        select: "userName userEmail",
      },
    })
    .populate({
      path: "conversation",
      populate: {
        path: "participants",
        select: "userName userEmail role isVerified",
      },
    });
};

/*
==========================================
DELETE MESSAGE
==========================================
*/

const deleteMessage = async (messageId, userId) => {
  const message = await Message.findById(messageId);

  if (!message) {
    throw new Error("Message not found.");
  }

  // Only sender can delete
  if (message.sender.toString() !== userId.toString()) {
    throw new Error("You can only delete your own messages.");
  }

  message.message = "This message was deleted";
  message.deleted = true;

  await message.save();

  return await Message.findById(message._id)
    .populate("sender", "userName userEmail role")
    .populate("receiver", "userName userEmail role")
    .populate({
      path: "replyTo",
      select: "message sender receiver createdAt",
      populate: {
        path: "sender",
        select: "userName",
      },
    })
    .populate({
      path: "conversation",
      populate: {
        path: "participants",
        select: "userName userEmail role isVerified",
      },
    });
};
module.exports = {
  createMessage,
  getMessages,
  markRead,
  markDelivered,
  editMessage,
  deleteMessage,
};
