const Post = require("../models/postModel");
const Group = require("../models/groupModel");
const HttpResponse = require("../utils/httpResponse");
const dotenv = require('dotenv');
dotenv.config();

class PostService {
    getPostByPage = async (page, limit) => {
        try {
            const skip = (parseInt(page) - 1) * parseInt(limit);
            const posts = await Post.find().skip(skip).limit(parseInt(limit)).populate('group_id').populate('user_id');
            const total = await Post.countDocuments();
            const totalPages = Math.ceil(total / parseInt(limit));
            // console.log('data: ', data);
            const data = {
                posts,
                totalPages
            }
            return HttpResponse.success(data, HttpResponse.getErrorMessages('getDataSucces'));
        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    }
}

module.exports = PostService;