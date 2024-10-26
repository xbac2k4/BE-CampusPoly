const Post = require("../../models/postModel");
const User = require("../../models/userModel");
const Group = require("../../models/groupModel");
const LikeService = require("../../services/likeService");
const HttpResponse = require("../../utils/httpResponse");

class LikeController {
    getAllLike = async (req, res) => {
        try {
            const data = await new LikeService().getAllLike();
            // console.log('data: ', data);
            return res.json(HttpResponse.result(data));
        } catch (error) {
            console.log(error);
            return res.json(HttpResponse.error(error));
        }
    }
    getLikeByPost = async (req, res, next) => {
        const { post_id } = req.query;
        try {
            const data = await new LikeService().getLikeByPost(post_id);
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
    addLikeToPost = async (req, res, next) => {
        const { user_id, post_id } = req.body;
        try {
            const data = await new LikeService().addLikeToPost(user_id, post_id); 
            if (data) {
                return res.json(HttpResponse.result(data));
            } else {
                return res.json(HttpResponse.fail(HttpResponse.getErrorMessages('dataNotFound')));
            }        } catch (error) {
            console.log(error);
            return res.json(HttpResponse.error(error));
        }
    }
    removeLikeFromPost = async (req, res, next) => {
        const { user_id, post_id } = req.body;
        try {
            const data = await new LikeService().removeLikeFromPost(user_id, post_id);
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

module.exports = LikeController;
