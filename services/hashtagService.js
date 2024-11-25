const Post = require("../models/postModel");
const Hashtag = require("../models/hashtagModel");
const User = require("../models/userModel");
const HttpResponse = require("../utils/httpResponse");
const dotenv = require('dotenv');
const { use } = require("../routes/api");
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

class HashtagService {
    getAllHashtag = async () => {
        try {
            const data = await Hashtag.find({}, 'hashtag_name hashtag_count');
            // console.log('data: ', data);
            return HttpResponse.success(data, HttpResponse.getErrorMessages('getDataSucces'));
        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    }

    getHashtagByID = async (id) => {
        try {
            const data = await Hashtag.findById(id);
            console.log('data: ', data);
            return HttpResponse.success(data, HttpResponse.getErrorMessages('getDataSucces'));
        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    }
    getHashtagByPostID = async (id) => {
        try {
            const data = await Post.find({
                id
            }).populate('user_id','full_name').populate('_id','title').populate('hashtag');
            console.log('data: ', data);
            return HttpResponse.success(data, HttpResponse.getErrorMessages('getDataSucces'));
        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    }
    addOrUpdateHashtag = async (hashtag_name) => {
        try {
            if (!hashtag_name) {
                throw new Error('Hashtag name is required');
            }
    
            // Kiểm tra hashtag có tồn tại hay không
            const existingHashtag = await Hashtag.findOne({ hashtag_name });
    
            let result;
            if (existingHashtag) {
                existingHashtag.hashtag_count += 1;
                result = await existingHashtag.save();
            } else {
                const newHashtag = new Hashtag({
                    hashtag_name,
                    hashtag_count: 1
                });
                result = await newHashtag.save();
            }
    
            return HttpResponse.success(result, HttpResponse.getErrorMessages('success'));
        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    };       
    
    // searchHashtag = async (searchTerm) => {
    //     try {
    //         const normalizedSearchTerm = removeVietnameseTones(searchTerm || "");

    //         // Tải tất cả bài viết từ database
    //         const posts = await Post.find()
    //             .populate("user_id") // Lấy thông tin người dùng liên quan
    //             .populate("group_id"); // Lấy thông tin nhóm liên quan

    //         // Lọc bài viết dựa trên tiêu đề hoặc loại bài viết
    //         const filteredPosts = posts.filter((post) => {
    //             const normalizedTitle = removeVietnameseTones(post.title || "");
    //             const normalizedPostType = removeVietnameseTones(post.post_type || "");
    //             return (
    //                 normalizedTitle.includes(normalizedSearchTerm) ||
    //                 normalizedPostType.includes(normalizedSearchTerm)
    //             );
    //         });

    //         return filteredPosts; // Trả về danh sách bài viết phù hợp
    //     } catch (error) {
    //         console.error(error);
    //         throw error;
    //     }
    // };
    // searchPosts = async (searchTerm) => {
    //     try {
    //         const normalizedSearchTerm = removeVietnameseTones(searchTerm || "");
    
    //         // Tìm kiếm bài viết
    //         const posts = await Post.find()
    //             .populate("user_id")  // Lấy thông tin người dùng liên quan
    //             .populate("group_id"); // Lấy thông tin nhóm liên quan
    
    //         // Lọc bài viết dựa trên tiêu đề hoặc loại bài viết
    //         const filteredPosts = posts.filter((post) => {
    //             const normalizedTitle = removeVietnameseTones(post.title || "");
    //             const normalizedPostType = removeVietnameseTones(post.post_type || "");
    //             return (
    //                 normalizedTitle.includes(normalizedSearchTerm) ||
    //                 normalizedPostType.includes(normalizedSearchTerm)
    //             );
    //         });
    
    //         // Tìm kiếm người dùng
    //         const users = await User.find();
    
    //         // Lọc người dùng dựa trên tên người dùng
    //         const filteredUsers = users.filter((_id) => {
    //             const normalizedFullName = removeVietnameseTones(_id.full_name || "");
    //             return normalizedFullName.includes(normalizedSearchTerm);
    //         });
    
    //         // Trả về kết quả bao gồm cả bài viết và người dùng
    //         return {
    //             posts: filteredPosts,
    //             users: filteredUsers
    //         };
    //     } catch (error) {
    //         console.error(error);
    //         throw error;
    //     }
    // };



}

module.exports = HashtagService;