const Post = require("../../models/postModel");
const User = require("../../models/userModel");
const Group = require("../../models/groupModel");
const CommentService = require("../../services/commentService");
const HttpResponse = require("../../utils/httpResponse");

class CommentController {
    getAllComment = async (req, res) => {
        try {
            const data = await new CommentService().getAllComment();
            // console.log('data: ', data);
            return res.json(HttpResponse.result(data));
        } catch (error) {
            console.log(error);
            return res.json(HttpResponse.error(error));
        }
    }
    getCommentByPost = async (req, res, next) => {
        const { post_id } = req.query;
        try {
            const data = await new CommentService().getCommentByPost(post_id);
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
    addCommentToPost = async (req, res, next) => {
        const { user_id, post_id, comment_content } = req.body;
        try {
            const data = await new CommentService().addCommentToPost(user_id, post_id, comment_content); 
            if (data) {
                return res.json(HttpResponse.result(data));
            } else {
                return res.json(HttpResponse.fail(HttpResponse.getErrorMessages('dataNotFound')));
            }        } catch (error) {
            console.log(error);
            return res.json(HttpResponse.error(error));
        }
    }
    removeCommentFromPost = async (req, res, next) => {
        const { id } = req.params;
        const { user_id, post_id } = req.body;
                
        try {
            const data = await new CommentService().removeCommentFromPost(id, user_id, post_id);
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

module.exports = CommentController;
