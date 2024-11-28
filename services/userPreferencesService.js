const userPreferencesModel = require("../models/userPreferencesModel");
const HttpResponse = require("../utils/httpResponse");

class UserPreferencesService {
    updateInteractionScore = async (user_id, hashtag_id, score) => {
        try {
            const existingUserPreferences = await userPreferencesModel.findOne({
                user_id,
                hashtag_id
            }); // Sử dụng findOne để chỉ lấy một bản ghi.

            let result;

            if (existingUserPreferences) {
                // Nếu tồn tại, cập nhật điểm tương tác.
                existingUserPreferences.interaction_score = Number(existingUserPreferences.interaction_score) + Number(score);
                await existingUserPreferences.save();
                result = existingUserPreferences;
            } else {
                // Nếu chưa tồn tại, tạo mới.
                const newUserPreferences = new userPreferencesModel({
                    user_id,
                    hashtag_id,
                    interaction_score: score
                });
                result = await newUserPreferences.save();
            }

            return HttpResponse.success(result, HttpResponse.getErrorMessages('Success'));
        } catch (error) {
            console.error(error); // Nên sử dụng console.error để hiển thị lỗi.
            return HttpResponse.error(error);
        }
    };

}

module.exports = UserPreferencesService;