const UserPreferencesService = require("../../services/userPreferencesService");
const HttpResponse = require("../../utils/httpResponse");

class UserPreferencesController {
    updateInteractionScore = async (req, res) => {
        try {
            const { user_id, hashtag_id, score } = req.body;
            const data = await new UserPreferencesService().updateInteractionScore(user_id, hashtag_id, score);
            // console.log('data: ', data);
            return res.json(HttpResponse.result(data));
        } catch (error) {
            console.log(error);
            return res.json(HttpResponse.error(error));
        }
    }
}

module.exports = UserPreferencesController;
