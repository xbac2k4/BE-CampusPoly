const Comment = require("../models/commentModel");
const HttpResponse = require("../utils/httpResponse");

class CommentService {
    getAllComment = async () => {
        try {
            const data = await Comment.find().populate('user_id_comment', 'full_name avatar').populate('post_id');
            // console.log('data: ', data);
            return HttpResponse.success(data, HttpResponse.getErrorMessages('getDataSucces'));
        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    }
    getCommentByPost = async (post_id) => {
        try {
            const data = await Comment.find({
                post_id: post_id
            }).populate('user_id_comment', 'full_name avatar').populate('post_id');
            return HttpResponse.success(data, HttpResponse.getErrorMessages('getDataSucces'));
        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    }
    addCommentToPost = async (user_id, post_id, comment_content) => {
        try {
            const newComment = new Comment({
                user_id_comment: user_id,
                post_id: post_id,
                comment_content: comment_content
            });
            await newComment.save();
            const populatedComment = await Comment.findById(newComment._id).populate(
                'user_id_comment',
                'full_name avatar' // Chỉ lấy các trường cần thiết từ User
            );
            return HttpResponse.success(populatedComment, HttpResponse.getErrorMessages('success'));
        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    }
    removeCommentFromPost = async (id, user_id, post_id) => {
        try {
            // Kiểm tra xem người dùng đã like bài viết này chưa
            const comment = await Comment.findById(id);
            // console.log(comment);

            const existingComment = comment.user_id_comment.toString() === user_id && comment.post_id.toString() === post_id ? true : false;
            console.log(existingComment);

            if (!existingComment) {
                return
            }

            // Nếu đã like, tiến hành xóa like
            await comment.deleteOne();
            return HttpResponse.success(comment, HttpResponse.getErrorMessages('success'));
        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    }
}

module.exports = CommentService;