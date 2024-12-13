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
        const { page, limit, isBlocked, isPopular } = req.query;
        try {
            const data = await new PostService().getPostByPage(page, limit, isBlocked, isPopular);
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
    getPostByFriends = async (req, res, next) => {
        try {
            const { user_id } = req.query;
            const data = await new PostService().getPostByFriends(user_id);
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
    getTopPost = async (req, res, next) => {
        try {
            const data = await new PostService().getTopPost();
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

            // Gọi dịch vụ để cập nhật bài viết
            const updatedPost = await new PostService().updatePost(id, user_id, group_id, title, content, hashtag, imageArray);

            // Trả về phản hồi phù hợp
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

    updateViolationPoint = async (postId) => {
        try {
            // Lấy tất cả các báo cáo của bài viết
            const reports = await ReportedPost.find({ post_id: postId });

            // Tính tổng điểm vi phạm
            const totalViolationPoint = reports.reduce((sum, report) => sum + (report.violation_point || 0), 0);

            // Cập nhật bài viết với điểm vi phạm mới
            const updateData = {
                violation_point: totalViolationPoint
            };

            // Kiểm tra xem có cần chặn bài viết không
            const BLOCK_THRESHOLD = 10; // Ngưỡng chặn bài viết
            if (totalViolationPoint > BLOCK_THRESHOLD) {
                updateData.is_blocked = true;
                updateData.block_reason = "Điểm vi phạm vượt ngưỡng cho phép.";
            }

            // Cập nhật bài viết trong cơ sở dữ liệu
            await Post.findByIdAndUpdate(postId, updateData);
        } catch (err) {
            console.error("Error updating violation point:", err);
            throw err;
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

    deletePostByUser = async (req, res) => {
        try {
            const { id } = req.params; // Lấy ID bài viết từ URL params
            const { user_id } = req.query; // Lấy user_id và role từ query string

            // Gọi PostService để thực hiện xóa bài viết
            const deletedPost = await new PostService().deletePostByUser(id, user_id);

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

    getVisiblePosts = async (req, res) => {
        try {
            // Gọi hàm getVisiblePosts từ PostService
            const data = await new PostService().getVisiblePosts();

            // Kiểm tra và trả về kết quả
            if (data) {
                return res.json(HttpResponse.result(data));
            } else {
                return res.json(HttpResponse.fail(HttpResponse.getErrorMessages('dataNotFound')));
            }
        } catch (error) {
            console.error("Error in getVisiblePosts:", error);
            return res.json(HttpResponse.error(error));
        }
    };

    updateBlockPost = async (req, res, next) => {
        try {
            const { id } = req.params;
            const { is_blocked } = req.body;
            // Gọi dịch vụ để cập nhật bài viết
            const updateBlockPost = await new PostService().updateBlockPost(id, is_blocked);
            // Trả về phản hồi phù hợp
            if (updateBlockPost) {
                return res.json(HttpResponse.result(updateBlockPost));
            } else {
                return res.json(HttpResponse.fail(HttpResponse.getErrorMessages('dataNotFound')));
            }
        } catch (error) {
            console.log(error);
            return res.json(HttpResponse.error(error));
        }
    }

    checkPost = async (req, res) => {
        try {
            const { _id } = req.body;
            const post = await Post.findById(_id);
            console.log("post: ", post);

            if (!post) {
                return res.json({ success: false, message: 'Bài viết không tồn tại' });
            }

            if (post.is_blocked) {
                return res.json({ success: false, message: 'Bài viết đã bị chặn', isBlocked: true });
            }

            return res.json({ success: true });
        } catch (error) {
            console.log(error);
            return res.json(HttpResponse.error(error));
        }
    }

}

module.exports = PostController;
