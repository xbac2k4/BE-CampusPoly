const Like = require("../models/likeModel");
const HttpResponse = require("../utils/httpResponse");

class LikeService {
    getAllLike = async () => {
        try {
            const data = await Like.find().populate('user_id_like').populate('post_id');
            // console.log('data: ', data);
            return HttpResponse.success(data, HttpResponse.getErrorMessages('getDataSucces'));
        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    }
    getLikeByPost = async (post_id) => {
        try {
            const data = await Like.findOne({
                post_id: post_id
            }).populate('user_id_like').populate('post_id');
            return HttpResponse.success(data, HttpResponse.getErrorMessages('getDataSucces'));
        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    }
    addLikeToPost = async (user_id, post_id) => {
        try {
            const existingLike = await Like.findOne({ user_id_like: user_id, post_id: post_id });
            if (existingLike) {
                return
            }
            const newLike = new Like({
                user_id_like: user_id,
                post_id: post_id
            });
            await newLike.save();
            return HttpResponse.success(newLike, HttpResponse.getErrorMessages('success'));
        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    }
    removeLikeFromPost = async (user_id, post_id) => {
        try {
            // Kiểm tra xem người dùng đã like bài viết này chưa
            const existingLike = await Like.findOne({ user_id_like: user_id, post_id: post_id });
            if (!existingLike) {
                return
            }

            // Nếu đã like, tiến hành xóa like
            await existingLike.deleteOne();
            return HttpResponse.success(existingLike, HttpResponse.getErrorMessages('success'));
        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    }
}

module.exports = LikeService;