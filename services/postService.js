const Post = require("../models/postModel");
const Group = require("../models/groupModel");
const Like = require("../models/likeModel");
const HttpResponse = require("../utils/httpResponse");
const dotenv = require('dotenv');
const { use } = require("../routes/api");
dotenv.config();

class PostService {
    getAllPost = async () => {
        try {
            const data = await Post.find().populate('user_id').populate('group_id');
            // console.log('data: ', data);
            const updatedPosts = await Promise.all(data.map(async (post) => {
                // Lấy số lượng like cho bài viết
                const likeData = await Like.find({ post_id: post._id });
                post.like_count = likeData.length;

                // Lấy số lượng comment cho bài viết
                // const commentData = await Comment.find({ post_id: post._id });
                // post.comment_count = commentData.length;

                return post;
            }));
            return HttpResponse.success(updatedPosts, HttpResponse.getErrorMessages('getDataSucces'));
        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    }
    getPostByPage = async (page, limit) => {
        try {
            const skip = (parseInt(page) - 1) * parseInt(limit);
            const posts = await Post.find().skip(skip).limit(parseInt(limit)).populate('group_id').populate('user_id');
            const total = await Post.countDocuments();
            const totalPages = Math.ceil(total / parseInt(limit));
            // console.log('data: ', data);
            // Cập nhật like_count và comment_count cho từng bài viết
            const updatedPosts = await Promise.all(posts.map(async (post) => {
                // Lấy số lượng like cho bài viết
                const likeData = await Like.find({ post_id: post._id });
                post.like_count = likeData.length;

                // Lấy số lượng comment cho bài viết
                // const commentData = await Comment.find({ post_id: post._id });
                // post.comment_count = commentData.length;

                return post;
            }));

            const data = {
                posts: updatedPosts,
                totalPages
            };
            return HttpResponse.success(data, HttpResponse.getErrorMessages('getDataSucces'));
        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    }
    getPostByID = async (id) => {
        try {
            const data = await Post.findById(id).populate('user_id').populate('group_id');
            // console.log('data: ', data);
            if (data) {
                // Lấy số lượng like cho bài viết
                const likeData = await Like.find({ post_id: data._id });
                data.like_count = likeData.length;
                return HttpResponse.success(data, HttpResponse.getErrorMessages('getDataSucces'));
            }
        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    }
    addPost = async (user_id, group_id, title, content, post_type, imageArray) => {
        try {
            // Tạo bài viết mới
            const newPost = new Post({
                user_id: user_id,
                group_id: group_id || null,
                image: imageArray,
                title: title,
                content: content,
                post_type: post_type,
            });

            // Lưu bài viết vào cơ sở dữ liệu
            const result = await newPost.save();

            return HttpResponse.success(result, HttpResponse.getErrorMessages('success'));
        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    }
    updatePost = async (id, user_id, group_id, title, content, post_type, imageArray) => {
        try {
            // Tìm bài viết theo ID
            const post = await Post.findById(id);
            if (post.user_id.toString() !== user_id) {
                return
            }
            let result
            if (post) {
                // Cập nhật thông tin bài viết
                post.user_id = user_id ?? post.user_id;
                post.group_id = group_id ?? post.group_id;
                post.image = imageArray.length > 0 ? imageArray : post.image;
                post.title = title ?? post.title;
                post.content = content ?? post.content;
                post.post_type = post_type ?? post.post_type;
                result = await post.save();
            }
            return HttpResponse.success(result, HttpResponse.getErrorMessages('success'));
        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    }
    deletePost = async (id, user_id) => {
        try {
            // Tìm bài viết theo ID
            const post = await Post.findById(id);
            // console.log(post.user_id.toString(), user_id);
            const postData = post;
            if (!post || post.user_id.toString() !== user_id) {
                return
            }
            const result = await post.deleteOne();
            return HttpResponse.success({result, post}, HttpResponse.getErrorMessages('success'));
        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    }
}

module.exports = PostService;