const Post = require("../../models/postModel");
const User = require("../../models/userModel");
const Group = require("../../models/groupModel");
const PostService = require("../../services/postService");
const HashtagService = require("../../services/hashtagService");
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
    getPostsByUserInteraction = async (req, res, next) => {
        try {
            const { user_id } = req.query;
            const data = await new PostService().getPostsByUserInteraction(user_id);
            console.log('data: ', data);
            if (data) {
                return res.json({
                    status: data.status,
                    message: data.message,
                    data: data.data,
                    totalPages: data.totalPages,
                });
            } else {
                return res.json(HttpResponse.fail(HttpResponse.getErrorMessages('dataNotFound')));
            }
        } catch (error) {
            console.log(error);
            return res.json(HttpResponse.error(error));
        }
    }
    getPostByUserID = async (req, res, next) => {
        try {
            const { user_id } = req.query;
            const data = await new PostService().getPostByUserID(user_id);
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
            const { user_id, group_id, title, content, hashtag } = req.body;
            // Xử lý hình ảnh (nếu có)
            let imageArray = [];
            if (req.files && req.files.length > 0) {
                imageArray = req.files.map(file => {
                    return `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
                });
            }
            // console.log(imageArray);

            // Xử lý hashtags (nếu có)
            let processedHashtags = [];
            if (hashtag && hashtag.length > 0) {
                const hashtagArray = Array.isArray(hashtag) ? hashtag : [hashtag];
                const hashtagService = new HashtagService();
                for (const tag of hashtagArray) {
                    const result = await hashtagService.addOrUpdateHashtag(tag.trim());
                    processedHashtags.push(result.data._id); // Lưu lại ID của hashtag để sử dụng
                }
            } else {
                // Nếu không có hashtag, set processedHashtags là mảng trống hoặc null
                processedHashtags = null; // Hoặc có thể để processedHashtags = [] nếu cần
            }

            const createdPost = await new PostService().addPost(user_id, group_id, title, content, processedHashtags, imageArray);
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
            const { group_id, title, content, hashtag } = req.body;
            // Xử lý hình ảnh (nếu có)
            let imageArray = [];
            if (req.files && req.files.length > 0) {
                imageArray = req.files.map(file => {
                    return `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
                });
            }
            const updatedPost = await new PostService().updatePost(id, user_id, group_id, title, content, hashtag, imageArray);
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
            const { id } = req.params; // Lấy ID bài viết từ URL params
            const { user_id, role } = req.query; // Lấy user_id và role từ query string

            // Gọi PostService để thực hiện xóa bài viết
            const deletedPost = await new PostService().deletePost(id, user_id, role);

            // Kiểm tra kết quả xóa bài viết
            if (deletedPost) {
                return res.json(HttpResponse.result(deletedPost)); // Trả kết quả thành công
            } else {
                console.log("Không phải admin hoặc người dùng không sở hữu bài viết, không cho phép xóa");
                return res.json(HttpResponse.fail(HttpResponse.getErrorMessages('dataNotFound'))); // Nếu không tìm thấy bài viết
            }
        } catch (error) {
            console.log(error);

            return res.json(HttpResponse.error(error)); // Trả về lỗi nếu có
        }
    }

    searchPostsAdmin = async (req, res) => {
        try {
            const { searchTerm } = req.query;

            // Gọi service để thực hiện tìm kiếm
            const posts = await new PostService().searchPostsAdmin(searchTerm);

            if (posts.length > 0) {
                return res.json({
                    success: true,
                    posts,
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

module.exports = PostController;
