const Post = require("../../models/postModel");
const User = require("../../models/userModel");
const Group = require("../../models/groupModel");
const PostService = require("../../services/postService");
const HttpResponse = require("../../utils/httpResponse");

class PostController {
    getAllPost = async (req, res) => {
        try {
            const data = await new PostService().getAllPost();
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
    getPostByPage = async (req, res, next) => {
        const { page, limit } = req.query;
        try {
            const data = await new PostService().getPostByPage(page, limit);
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
    getPostByID = async (req, res, next) => {
        try {
            const { id } = req.params;
            const data = await new PostService().getPostByID(id);
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
    addPost = async (req, res, next) => {
        try {
            
            const { user_id, group_id, title, content, post_type } = req.body;
            // Xử lý hình ảnh (nếu có)
            let imageArray = [];
            if (req.files && req.files.length > 0) {
                imageArray = req.files.map(file => {
                    return `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
                });
            }
            console.log(imageArray);
            
            const createdPost = await new PostService().addPost(user_id, group_id, title, content, post_type, imageArray);
            if (createdPost) {
                return res.json(HttpResponse.result(createdPost));
            } else {
                return res.json(HttpResponse.fail(HttpResponse.getErrorMessages('dataNotFound')));
            }
        } catch (error) {
            console.log(error);
            return res.json(HttpResponse.error(error));
        }
    }
    updatePost = async (req, res, next) => {
        try {
            const { id } = req.params;
            const { user_id } = req.query;
            const { group_id, title, content, post_type } = req.body;
            // Xử lý hình ảnh (nếu có)
            let imageArray = [];
            if (req.files && req.files.length > 0) {
                imageArray = req.files.map(file => {
                    return `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
                });
            }
            const updatedPost = await new PostService().updatePost(id, user_id, group_id, title, content, post_type, imageArray);
            if (updatedPost) {
                return res.json(HttpResponse.result(updatedPost));
            } else {
                return res.json(HttpResponse.fail(HttpResponse.getErrorMessages('dataNotFound')));
            }
        } catch (error) {
            console.log(error);
            return res.json(HttpResponse.error(error));
        }
    }
    deletePost = async (req, res, next) => {
        try {
            const { id } = req.params;
            const { user_id } = req.query
            const deletedPost = await new PostService().deletePost(id, user_id);
            if (deletedPost) {
                return res.json(HttpResponse.result(deletedPost));
            } else {
                return res.json(HttpResponse.fail(HttpResponse.getErrorMessages('dataNotFound')));
            }
        } catch (error) {
            console.log(error);
            return res.json(HttpResponse.error(error));
        }
    }
}

module.exports = PostController;
