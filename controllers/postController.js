const Post = require("../models/postModel");
const User = require("../models/userModel");
const Group = require("../models/groupModel");
const PostService = require("../services/postService");
const HttpResponse = require("../utils/httpResponse");

class PostController {
    getAllPost = async (req, res) => {
        try {
            const data = await new PostService().getAllPost();
            // console.log('data: ', data);
            return res.json(HttpResponse.result(data));
        } catch (error) {
            console.log(error);
            return res.json(HttpResponse.error(error));
        }
    }
    getPostByPage = async (req, res, next) => {
        const { page, limit } = req.query;
        try {
            const data = await new PostService().getPostByPage(page, limit);
            return res.json(HttpResponse.result(data));
        } catch (error) {
            console.log(error);
            return res.json(HttpResponse.error(error));
        }
    }
}

module.exports = PostController;
