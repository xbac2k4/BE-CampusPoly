const Post = require("../../models/postModel");
const User = require("../../models/userModel");
const Group = require("../../models/groupModel");
const Hashtag = require("../../models/hashtagModel");
const PostService = require("../../services/postService");
const HashtagService = require("../../services/hashtagService");
const SearchplusService = require("../../services/searchplusServicer");
const HttpResponse = require("../../utils/httpResponse");

class SearchplusController {
    searchPlus = async (req, res) => {
        try {
            const searchTerm = req.query.searchTerm;  // Lấy searchTerm từ query params hoặc body
            if (!searchTerm) {
                return res.status(400).json({
                    success: false,
                    message: "Search term is required"
                });
            }
            // Gọi phương thức searchPlus của SearchplusService
            const result = await new SearchplusService().searchPlus(searchTerm);
            // Trả về kết quả tìm kiếm
            return res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error("Error in search controller:", error);
            return res.status(500).json({
                success: false,
                message: "Something went wrong while searching"
            });
        }
    }
    searchPostsByHashtag = async (req, res) => {
        try {
            const { searchTerm } = req.query;

            // Gọi service để thực hiện tìm kiếm
            const posts = await new SearchplusService().searchPostsByHashtag(searchTerm);
            if (posts) {
                return res.json(HttpResponse.result(posts));
            } else {
                return res.json(HttpResponse.fail(HttpResponse.getErrorMessages('dataNotFound')));
            }
        } catch (error) {
            console.error(error);
            return res.json(HttpResponse.error(error));
        }
    };
}

module.exports = SearchplusController;