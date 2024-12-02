const Post = require("../models/postModel");
const User = require("../models/userModel");
const Group = require("../models/groupModel");
const Like = require("../models/likeModel");
const Comment = require("../models/commentModel");
const Hashtag = require("../models/hashtagModel");
const HttpResponse = require("../utils/httpResponse");
const dotenv = require('dotenv');
const { use } = require("../routes/api");
const { access } = require("fs");
dotenv.config();
const displayedPostIds = new Set(); // Set để lưu trữ ID bài viết đã hiển thị
const removeVietnameseTones = (str) => {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Loại bỏ dấu
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase();
};

class SearchplusService {
    searchPlus = async (searchTerm) => {
        try {
            let normalizedSearchTerm = removeVietnameseTones(searchTerm || "").trim();
            let result = {
                users: [],
                hashtags: []
            };
            // **Bước 1: Tìm kiếm người dùng trước**
            const users = await User.find().populate("full_name");
            const filteredUsers = users.filter((user) => {
                const normalizedFullName = removeVietnameseTones(user?.full_name || "");
                return normalizedFullName.includes(normalizedSearchTerm);
            });
            result.users = filteredUsers; // Lưu kết quả người dùng
            // **Bước 2: Nếu không có kết quả từ người dùng, thì tìm kiếm hashtag/bài viết**
            if (filteredUsers.length === 0 || !searchTerm.startsWith("#")) {
                // Xử lý tìm kiếm hashtag hoặc bài viết nếu người dùng không có kết quả
                let isHashtagSearch = normalizedSearchTerm[0] === "#";
                if (isHashtagSearch) {
                    normalizedSearchTerm = normalizedSearchTerm.substring(1); // Cắt bỏ dấu #
                }
                // Tải tất cả bài viết từ database và lọc theo tiêu đề hoặc hashtag
                const hashtags = await Hashtag.find();
                const filteredHashtags = hashtags.filter((hashtag) => {
                    const normalizedHashtag = hashtag
                        ? removeVietnameseTones(hashtag?.hashtag_name.replace("#", "") || "")
                        : "";
                    return (
                        normalizedHashtag.includes(normalizedSearchTerm) // Tìm trong hashtag
                    );
                });
                result.hashtags = filteredHashtags; // Lưu kết quả bài viết
            }
            // Trả về kết quả bao gồm cả người dùng và bài viết
            console.log("Filtered Users:", result.users);
            console.log("Filtered Hashtags:", result.hashtags);
            return result;
        } catch (error) {
            console.error("Error during search:", error);
            throw error;
        }
    };
    searchPostsByHashtag = async (searchTerm) => {
        try {
            // Loại bỏ dấu và chuẩn hóa từ tìm kiếm
            let normalizedSearchTerm = removeVietnameseTones(searchTerm || "").trim();
            console.log("Normalized Search Term:", normalizedSearchTerm); // Log normalizedSearchTerm 
            // Kiểm tra xem searchTerm có phải là hashtag không
            let isHashtagSearch = normalizedSearchTerm[0] === "#";
            console.log("Is Hashtag Search:", isHashtagSearch); // Log xem có phải hashtag không
            // Nếu là hashtag, cắt bỏ # và tìm kiếm phần còn lại
            if (isHashtagSearch) {
                normalizedSearchTerm = normalizedSearchTerm.substring(1); // Cắt bỏ dấu #
            }
            // Chuẩn hóa searchTerm (sau khi cắt bỏ dấu #) để tìm kiếm chính xác
            normalizedSearchTerm = removeVietnameseTones(normalizedSearchTerm);
            console.log("Normalized Search Term after removing '#':", normalizedSearchTerm); // Log sau khi chuẩn hóa lại
            // Tải tất cả bài viết từ database
            const posts = await Post.find()
                .populate({
                    path: 'user_id',
                    select: 'full_name avatar role', // Chọn các trường của `user`
                    populate: {
                        path: 'role', // Populate thêm `role` bên trong `user_id`
                        select: 'role_name permissions' // Các trường bạn muốn lấy từ `role`
                    }
                }).populate('group_id').populate('hashtag', 'hashtag_name')// Giả sử bạn có mối quan hệ với hashtag


            const filteredPosts = posts.filter((post) => {
                const normalizedHashtag = post?.hashtag ? removeVietnameseTones(post?.hashtag?.hashtag_name.replace('#', '') || "") : "";

                return (
                    normalizedHashtag.includes(normalizedSearchTerm)
                );
            });
            const updatedPosts = await Promise.all(filteredPosts.map(async (post) => {
                // Lấy số lượng like cho bài viết
                const likeData = await Like.find({ post_id: post._id });
                post.like_count = likeData.length;

                // Lấy số lượng comment cho bài viết
                const commentData = await Comment.find({ post_id: post._id });
                post.comment_count = commentData.length;

                return {
                    postData: post,
                    likeData,
                    commentData
                };
            }));
            console.log("Updated Posts:", updatedPosts); // Log các bài viết đã được cập nhật
            // console.log("Filtered Posts:", filteredPosts); // Log các bài viết đã được lọc
            // Nếu không tìm thấy bài viết phù hợp
            // if (filteredPosts.length === 0) {
            //     throw { status: 400, message: "Data not found" };
            // }
            return HttpResponse.success(updatedPosts, HttpResponse.getErrorMessages('getDataSucces'));
        } catch (error) {
            console.error("Error:", error); // Log lỗi nếu có
            return HttpResponse.error(error);
        }
    };
}

module.exports = SearchplusService;