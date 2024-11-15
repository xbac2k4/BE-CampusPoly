const MessageService = require("../../services/messageService");
const HttpResponse = require("../../utils/httpResponse");

class MessageController {
    getMessageByConversation = async (req, res) => {
        try {
            const conversationID = req.params.conversationID;
            const { page, limit } = req.query;
            const data = await new MessageService().getMessageByConversation(conversationID, page, limit);
            if (data) {
                return res.json(HttpResponse.result(data));
            } else {
                return res.json(HttpResponse.fail(HttpResponse.getErrorMessages('dataNotFound')));
            }
        } catch (error) {
            console.log(error);
            return res.json(HttpResponse.error(error));
        }
    }
    addMessage = async (req, res) => {
        try {
            const { conversation_id, sender_id, content } = req.body;
            // console.log(conversation_id, sender_id, content);

            const data = await new MessageService().addMessage(conversation_id, sender_id, content);
            if (data) {
                return res.json(HttpResponse.result(data));
            } else {
                return res.json(HttpResponse.fail(HttpResponse.getErrorMessages('dataNotFound')));
            }
        } catch (error) {
            console.log(error);
            return res.json(HttpResponse.error(error));
        }
    }
}

module.exports = MessageController;
