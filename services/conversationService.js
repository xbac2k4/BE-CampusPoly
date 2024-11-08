const ConversationMember = require("../models/conversationMemberModel");
const Conversation = require("../models/conversationModel");
const Message = require("../models/messageModel");

const HttpResponse = require("../utils/httpResponse");

class ConversationService {
    getUserConversations = async (userId) => {
        try {
            // Tìm tất cả các cuộc hội thoại mà người dùng là thành viên
            const conversations = await Conversation.find({ members: userId })
                .populate("members", "full_name avatar")
                .exec();

            // Tạo mảng để lưu đoạn hội thoại với tin nhắn mới nhất và thông tin thành viên
            const conversationsWithDetails = await Promise.all(
                conversations.map(async (conv) => {
                    // Lấy tin nhắn mới nhất trong mỗi cuộc hội thoại
                    const lastMessage = await Message.findOne({ conversation_id: conv._id })
                        .sort({ sent_at: -1 })
                        .populate("sender_id", "full_name avatar")
                        .exec();

                    // Lấy danh sách thành viên trong cuộc hội thoại từ Conversation_Members
                    const members = await ConversationMember.find({ conversation_id: conv._id })
                        .populate("user_id", "full_name avatar")
                        .exec();

                    return {
                        conversation_id: conv._id,
                        is_group: conv.is_group,
                        group_name: conv.group_name,
                        last_message: lastMessage ? lastMessage.content : "Chưa có tin nhắn",
                        last_message_time: lastMessage ? lastMessage.sent_at : null,
                        sender: lastMessage ? lastMessage.sender_id : null,
                        members: members.map((member) => ({
                            user_id: member.user_id._id,
                            full_name: member.user_id.full_name,
                            avatar: member.user_id.avatar,
                            role: member.role,
                            joined_at: member.joined_at,
                        })),
                    };
                })
            );

            return HttpResponse.success(conversationsWithDetails, HttpResponse.getErrorMessages('getDataSucces'));
        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    };
}

module.exports = ConversationService;