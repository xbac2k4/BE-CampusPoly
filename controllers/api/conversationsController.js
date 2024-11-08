const ConversationService = require("../../services/conversationService");
const HttpResponse = require("../../utils/httpResponse");

class ConversationsController {
    getUserConversations = async (req, res) => {
        try {
            const userId = req.params.userId;
            const data = await new ConversationService().getUserConversations(userId);
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

module.exports = ConversationsController;
