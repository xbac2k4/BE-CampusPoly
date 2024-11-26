const Post = require("../../models/postModel");
const User = require("../../models/userModel");
const Group = require("../../models/groupModel");
const Hashtag = require("../../models/hashtagModel");
const HashtagService = require("../../services/hashtagService");
const PostService = require("../../services/postService");
const HttpResponse = require("../../utils/httpResponse");

class HashtagController {
    getAllHashtag = async (req, res) => {
        try {
            const data = await new HashtagService().getAllHashtag();
            // console.log('data: ', data);
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
    getHashtagByID = async (req, res, next) => {
        try {
            const { id } = req.params;
            const data = await new HashtagService().getHashtagByID(id);
            // console.log('data: ', data);
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
    getHashtagByPostID = async (req, res, next) => {
        try {
            const { id } = req.query;
            const data = await new HashtagService().getHashtagByPostID(id);
            // console.log('data: ', data);
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
    addHashtag = async (req, res, next) => {
        try {
            const { hashtag_name } = req.body;
            const result = await new HashtagService().addOrUpdateHashtag(hashtag_name);
            return res.json(result);
        } catch (error) {
            console.log(error);
            return res.json(HttpResponse.error(error));
        }
    };
    
    searchHashtag = async (req, res) => {
        try {
            const { searchTerm } = req.query;
            // Gọi service để thực hiện tìm kiếm
            const hashtags = await new HashtagService().searchHashtag(searchTerm);
    
        // Kiểm tra xem `hashtags` có phải là một mảng hay không
        if (Array.isArray(hashtags) && hashtags.length > 0) {
            return res.json({
                success: true,
                hashtags,
            });
        } else {
            return res.json(HttpResponse.fail(HttpResponse.getErrorMessages('dataNotFound')));
        }
        } catch (error) {
            console.error(error);
            return res.json(HttpResponse.error(error));
        }
    };

}

module.exports = HashtagController;
