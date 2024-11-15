const ConversationMember = require("../models/conversationMemberModel");
const Conversation = require("../models/conversationModel");
const Message = require("../models/messageModel");

const HttpResponse = require("../utils/httpResponse");

class MessageService {
    getMessageByConversation = async (conversationID, page, limit) => {
        try {
            const skip = (parseInt(page) - 1) * parseInt(limit);

            // Lấy tin nhắn với phân trang, populate 'sender_id' nhưng không include 'conversation_id' trong từng tin nhắn
            const messages = await Message.find({ conversation_id: conversationID })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('sender_id', 'full_name avatar') // Chỉ lấy thông tin của người gửi
                .select('-conversation_id'); // Loại bỏ 'conversation_id' khỏi từng tin nhắn

            // Tính tổng số tin nhắn và số trang
            const total = await Message.countDocuments({ conversation_id: conversationID });
            const totalPages = Math.ceil(total / parseInt(limit));

            // Tìm thông tin cuộc hội thoại để trả về ngoài cùng
            const conversation = await Conversation.findById(conversationID)
                .populate('members', 'full_name avatar')
                .select('_id members');

            // Định dạng dữ liệu trả về
            const data = {
                conversation_id: conversation,
                messages,
                totalPages
            };

            return HttpResponse.success(data, HttpResponse.getErrorMessages('getDataSucces'));

        } catch (error) {
            console.error('Error fetching messages by conversation:', error);
            return HttpResponse.error(error);
        }
    }
    addMessage = async (conversation_id, sender_id, content) => {
        try {
            // Tạo một đối tượng Message mới
            const message = new Message({
                conversation_id,
                sender_id,
                content,
            });

            // Lưu vào cơ sở dữ liệu
            const data = await message.save();
            global.io.emit('send_message', data);

            return HttpResponse.success(data, HttpResponse.getErrorMessages('getDataSucces'));
        } catch (error) {
            console.error('Error fetching messages by conversation:', error);
            return HttpResponse.error(error);
        }
    }
}

module.exports = MessageService;