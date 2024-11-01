const Post = require("../models/postModel");
const Group = require("../models/groupModel");
const Like = require("../models/likeModel");
const Comment = require("../models/commentModel");
const HttpResponse = require("../utils/httpResponse");
const dotenv = require('dotenv');
const { use } = require("../routes/api");
dotenv.config();
const displayedPostIds = new Set(); // Set để lưu trữ ID bài viết đã hiển thị

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
                const commentData = await Comment.find({ post_id: post._id });
                post.comment_count = commentData.length;

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
            const posts = await Post.find().skip(skip).limit(parseInt(limit)).populate('group_id').populate('user_id', 'full_name avatar');
            const total = await Post.countDocuments();
            const totalPages = Math.ceil(total / parseInt(limit));
            // console.log('data: ', data);
            // Cập nhật like_count và comment_count cho từng bài viết
            const updatedPosts = await Promise.all(posts.map(async (post) => {
                // Lấy số lượng like cho bài viết
                const likeData = await Like.find({ post_id: post._id });
                post.like_count = likeData.length;

                // Lấy số lượng comment cho bài viết
                const commentData = await Comment.find({ post_id: post._id });
                post.comment_count = commentData.length;

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

    // getPostByPage = async (page, limit) => {
    //     try {
    //         // Lấy tất cả bài viết
    //         const allPosts = await Post.find().populate('group_id').populate('user_id', 'full_name avatar');
    //         // Trộn ngẫu nhiên các bài viết
    //         const shuffledPosts = allPosts.sort(() => Math.random() - 0.5);
    //         // Lọc ra bài viết chưa hiển thị
    //         const newPosts = shuffledPosts.filter(post => !displayedPostIds.has(post._id.toString()));
    //         // Tính toán chỉ số để phân trang
    //         const skip = (parseInt(page) - 1) * parseInt(limit);
    //         // Lấy bài viết theo phân trang
    //         const paginatedPosts = newPosts.slice(skip, skip + parseInt(limit));
    //         // Cập nhật like_count và comment_count cho từng bài viết
    //         const updatedPosts = await Promise.all(paginatedPosts.map(async (post) => {
    //             // Lấy số lượng like cho bài viết
    //             const likeData = await Like.find({ post_id: post._id });
    //             post.like_count = likeData.length;
    //             // Lấy số lượng comment cho bài viết
    //             const commentData = await Comment.find({ post_id: post._id });
    //             post.comment_count = commentData.length;
    //             return post;
    //         }));
    //         // Lưu ID các bài viết đã hiển thị vào Set
    //         updatedPosts.forEach(post => displayedPostIds.add(post._id.toString()));
    //         // Tính tổng số trang
    //         const totalPages = Math.ceil(allPosts.length / parseInt(limit));
    //         const data = {
    //             posts: updatedPosts,
    //             totalPages
    //         };
    //         return HttpResponse.success(data, HttpResponse.getErrorMessages('getDataSucces'));
    //     } catch (error) {
    //         console.log(error);
    //         return HttpResponse.error(error);
    //     }
    // }

    getPostByID = async (id) => {
        try {
            const data = await Post.findById(id).populate('user_id', 'full_name avatar').populate('group_id');
            // console.log('data: ', data);
            if (data) {
                // Lấy số lượng like cho bài viết
                const likeData = await Like.find({ post_id: data._id }).select('user_id_like').populate('user_id_like', 'full_name');
                data.like_count = likeData.length;
                // Lấy số lượng comment cho bài viết
                const commentData = await Comment.find({ post_id: data._id }).populate('user_id_comment', 'avatar full_name');
                data.comment_count = commentData.length;
                const postData = {
                    postData: data,
                    // likeData,
                    commentData
                }
                return HttpResponse.success(postData, HttpResponse.getErrorMessages('getDataSucces'));
            }
        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    }
    getPostByUserID = async (user_id) => {
        try {
            const data = await Post.find({
                user_id
            }).populate('user_id', 'full_name avatar').populate('group_id');
            if (data) {
                // Lấy số lượng like cho bài viết
                const updatedPosts = await Promise.all(data.map(async (post) => {
                    // Lấy số lượng like cho bài viết
                    const likeData = await Like.find({ post_id: post._id });
                    post.like_count = likeData.length;
    
                    // Lấy số lượng comment cho bài viết
                    const commentData = await Comment.find({ post_id: post._id });
                    post.comment_count = commentData.length;
    
                    return post;
                }));
                
                return HttpResponse.success(updatedPosts, HttpResponse.getErrorMessages('getDataSucces'));
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
            if (!post || post.user_id.toString() !== user_id) {
                return
            }
            // Xóa bài viết
            const result = await post.deleteOne();
            if (result) {
                // Xóa like và comment
                await Like.deleteMany({ post_id: id });
                await Comment.deleteMany({ post_id: id });
            }
            return HttpResponse.success({ result, post }, HttpResponse.getErrorMessages('success'));
        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    }
}

module.exports = PostService;