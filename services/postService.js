const Post = require("../models/postModel");
const User = require("../models/userModel");
const Group = require("../models/groupModel");
const Like = require("../models/likeModel");
const Comment = require("../models/commentModel");
const HttpResponse = require("../utils/httpResponse");
const dotenv = require('dotenv');
const { use } = require("../routes/api");
const userPreferencesModel = require("../models/userPreferencesModel");
const friendModel = require("../models/friendModel");
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

class PostService {
    getAllPost = async () => {
        try {
            const data = await Post.find().populate({
                path: 'user_id',
                select: 'full_name avatar role', // Chọn các trường của `user`
                populate: {
                    path: 'role', // Populate thêm `role` bên trong `user_id`
                    select: 'role_name permissions' // Các trường bạn muốn lấy từ `role`
                }
            }).populate('group_id').populate('hashtag', 'hashtag_name');
            // console.log('data: ', data);
            const updatedPosts = await Promise.all(data.map(async (post) => {
                // Lấy số lượng like cho bài viết
                const likeData = await Like.find({ post_id: post._id });
                post.like_count = likeData.length;

                // Lấy số lượng comment cho bài viết
                const commentData = await Comment.find({ post_id: post._id });
                post.comment_count = commentData.length;

                return {
                    postData: post,
                    likeData
                };
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
            const posts = await Post.find().sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).populate('group_id').populate('user_id', 'full_name avatar').populate('hashtag', 'hashtag_name');
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
                postData: updatedPosts,
                totalPages
            };
            return HttpResponse.success(data, HttpResponse.getErrorMessages('getDataSucces'));
        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    }
    // ------------------------------------- //
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
    getPostsByUserInteraction = async (user_id) => {
        try {
            // Lấy danh sách hashtag mà user đã tương tác
            const userPreferences = await userPreferencesModel.find({ user_id: user_id })
                .sort({ interaction_score: -1 });

            if (!userPreferences.length) {
                // Nếu không có dữ liệu tương tác thì không lọc theo hashtag
                const posts = await Post.find()
                    .populate('group_id')
                    .populate({
                        path: 'user_id',
                        select: 'full_name avatar role', // Chọn các trường của `user`
                        populate: {
                            path: 'role', // Populate thêm `role` bên trong `user_id`
                            select: 'role_name permissions' // Các trường bạn muốn lấy từ `role`
                        }
                    })
                    .populate('hashtag', 'hashtag_name');

                // Tính điểm cho bài viết không có tương tác (điểm = 0)
                const scoredPosts = posts.map(post => ({
                    ...post.toObject(),
                    interactionScore: 0, // Bài viết không có tương tác, điểm là 0
                }));

                // Sắp xếp bài viết theo điểm và thời gian tạo
                scoredPosts.sort((a, b) => {
                    if (b.interactionScore === a.interactionScore) {
                        return new Date(b.createdAt) - new Date(a.createdAt); // Bài viết mới hơn sẽ lên trước
                    }
                    return b.interactionScore - a.interactionScore; // Sắp xếp theo điểm
                });

                // Lấy số lượng like và comment cho bài viết
                const updatedPosts = await Promise.all(scoredPosts.map(async (post) => {
                    const likeData = await Like.find({ post_id: post._id });
                    post.like_count = likeData.length;

                    const commentData = await Comment.find({ post_id: post._id });
                    post.comment_count = commentData.length;

                    return {
                        postData: post,
                        likeData,
                        comment_count: commentData.length,
                    };
                }));

                return {
                    status: 200,
                    message: 'Get data success',
                    data: updatedPosts,
                };
            }

            // Nếu có dữ liệu tương tác, tiếp tục lọc bài viết theo các hashtag tương tác
            const hashtagScoreMap = {};
            userPreferences.forEach(pref => {
                hashtagScoreMap[pref.hashtag_id.toString()] = pref.interaction_score;
            });

            const hashtagIds = userPreferences.map(pref => pref.hashtag_id);

            // Lấy tất cả bài viết có các hashtag user đã tương tác
            const posts = await Post.find({ hashtag: { $in: hashtagIds } })
                .populate('group_id')
                .populate({
                    path: 'user_id',
                    select: 'full_name avatar role', // Chọn các trường của `user`
                    populate: {
                        path: 'role', // Populate thêm `role` bên trong `user_id`
                        select: 'role_name permissions' // Các trường bạn muốn lấy từ `role`
                    }
                })
                .populate('hashtag', 'hashtag_name');

            // Tính điểm tương tác cho từng bài viết
            const scoredPosts = posts.map(post => {
                const interactionScore = hashtagScoreMap[post.hashtag?._id.toString()] || 0;
                return {
                    ...post.toObject(),
                    interactionScore,
                };
            });

            // Lấy các bài viết không có tương tác
            const otherPosts = await Post.find({ hashtag: { $nin: hashtagIds } })
                .populate('group_id')
                .populate({
                    path: 'user_id',
                    select: 'full_name avatar role', // Chọn các trường của `user`
                    populate: {
                        path: 'role', // Populate thêm `role` bên trong `user_id`
                        select: 'role_name permissions' // Các trường bạn muốn lấy từ `role`
                    }
                }).populate('hashtag', 'hashtag_name');

            const scoredOtherPosts = otherPosts.map(post => ({
                ...post.toObject(),
                interactionScore: 0, // Điểm mặc định cho bài viết không có tương tác
            }));

            const allPosts = [...scoredPosts, ...scoredOtherPosts];

            // Sắp xếp tất cả bài viết theo điểm và thời gian tạo
            allPosts.sort((a, b) => {
                if (b.interactionScore === a.interactionScore) {
                    return new Date(b.createdAt) - new Date(a.createdAt); // Bài viết mới hơn sẽ lên trước
                }
                return b.interactionScore - a.interactionScore; // Sắp xếp theo điểm
            });

            // Lấy số lượng like và comment cho mỗi bài viết
            const updatedPosts = await Promise.all(allPosts.map(async (post) => {
                const likeData = await Like.find({ post_id: post._id });
                post.like_count = likeData.length;

                const commentData = await Comment.find({ post_id: post._id });
                post.comment_count = commentData.length;

                return {
                    postData: post,
                    likeData,
                    comment_count: commentData.length,
                };
            }));

            return {
                status: 200,
                message: 'Get data success',
                data: updatedPosts,
            };
        } catch (error) {
            console.error(error);
            return {
                status: 500,
                message: 'Internal server error',
                error: error.message,
            };
        }
    };

    // getPostsByUserInteraction = async (user_id, page, limit) => {
    //     try {
    //         const skip = (parseInt(page) - 1) * parseInt(limit);

    //         // Lấy danh sách hashtag mà user đã tương tác
    //         const userPreferences = await userPreferencesModel.find({ user_id: user_id })
    //             .sort({ interaction_score: -1 });

    //         if (!userPreferences.length) {
    //             // Nếu không có dữ liệu tương tác thì không lọc theo hashtag
    //             const posts = await Post.find()
    //                 .populate('group_id')
    //                 .populate('user_id', 'full_name avatar')
    //                 .populate('hashtag', 'hashtag_name');

    //             // Tính điểm cho bài viết không có tương tác (điểm = 0)
    //             const scoredPosts = posts.map(post => ({
    //                 ...post.toObject(),
    //                 interactionScore: 0, // Bài viết không có tương tác, điểm là 0
    //             }));

    //             // Sắp xếp bài viết theo điểm từ cao xuống thấp
    //             scoredPosts.sort((a, b) => b.interactionScore - a.interactionScore);

    //             // Phân trang
    //             const paginatedPosts = scoredPosts.slice(skip, skip + parseInt(limit));
    //             const total = scoredPosts.length;
    //             const totalPages = Math.ceil(total / parseInt(limit));

    //             // Lấy số lượng like và comment cho bài viết
    //             const updatedPosts = await Promise.all(paginatedPosts.map(async (post) => {
    //                 // Lấy số lượng like cho bài viết
    //                 const likeData = await Like.find({ post_id: post._id });
    //                 post.like_count = likeData.length;

    //                 // Lấy số lượng comment cho bài viết
    //                 const commentData = await Comment.find({ post_id: post._id });
    //                 post.comment_count = commentData.length;

    //                 return {
    //                     postData: post,
    //                     likeData,  // Dữ liệu like nếu cần
    //                     commentData, // Dữ liệu comment nếu cần
    //                 };
    //             }));

    //             const data = {
    //                 updatedPosts,
    //                 totalPages,
    //             };

    //             return HttpResponse.success(data, HttpResponse.getErrorMessages('getDataSuccess'));
    //         }

    //         // Nếu có dữ liệu tương tác, tiếp tục lọc bài viết theo các hashtag tương tác
    //         const hashtagScoreMap = {};
    //         userPreferences.forEach(pref => {
    //             hashtagScoreMap[pref.hashtag_id.toString()] = pref.interaction_score;
    //         });

    //         const hashtagIds = userPreferences.map(pref => pref.hashtag_id);

    //         // Lấy tất cả bài viết có các hashtag user đã tương tác
    //         const posts = await Post.find({ hashtag: { $in: hashtagIds } })
    //             .populate('group_id')
    //             .populate('user_id', 'full_name avatar')
    //             .populate('hashtag', 'hashtag_name');

    //         // Tính điểm tương tác cho từng bài viết
    //         const scoredPosts = posts.map(post => {
    //             const interactionScore = hashtagScoreMap[post.hashtag?._id.toString()] || 0;
    //             return {
    //                 ...post.toObject(),
    //                 interactionScore,
    //             };
    //         });

    //         // Lấy các bài viết không có tương tác (không có hashtag trong danh sách)
    //         const otherPosts = await Post.find({ hashtag: { $nin: hashtagIds } })
    //             .populate('group_id')
    //             .populate('user_id', 'full_name avatar')
    //             .populate('hashtag', 'hashtag_name');

    //         // Đặt điểm tương tác = 0 cho các bài viết không có tương tác
    //         const scoredOtherPosts = otherPosts.map(post => ({
    //             ...post.toObject(),
    //             interactionScore: 0, // Điểm mặc định cho bài viết không có tương tác
    //         }));

    //         // Ghép danh sách bài viết có tương tác và bài viết không có tương tác
    //         const allPosts = [...scoredPosts, ...scoredOtherPosts];

    //         // Sắp xếp tất cả bài viết theo điểm từ cao xuống thấp
    //         allPosts.sort((a, b) => b.interactionScore - a.interactionScore);

    //         // Phân trang
    //         const paginatedPosts = allPosts.slice(skip, skip + parseInt(limit));
    //         const total = allPosts.length;
    //         const totalPages = Math.ceil(total / parseInt(limit));

    //         // Lấy số lượng like và comment cho mỗi bài viết
    //         const updatedPosts = await Promise.all(paginatedPosts.map(async (post) => {
    //             // Lấy số lượng like cho bài viết
    //             const likeData = await Like.find({ post_id: post._id });
    //             post.like_count = likeData.length;

    //             // Lấy số lượng comment cho bài viết
    //             const commentData = await Comment.find({ post_id: post._id });
    //             post.comment_count = commentData.length;

    //             return {
    //                 postData: post,
    //                 likeData,  // Dữ liệu like nếu cần
    //                 // commentData, // Dữ liệu comment nếu cần
    //             };
    //         }));

    //         const data = updatedPosts;
    //         // totalPages,

    //         return {
    //             status: 200,
    //             message: 'Get data success',
    //             totalPages,
    //             data
    //         };
    //     } catch (error) {
    //         console.error(error);
    //         return HttpResponse.error(error);
    //     }
    // };

    getPostByID = async (id) => {
        try {
            const data = await Post.findById(id).populate({
                path: 'user_id',
                select: 'full_name avatar role', // Chọn các trường của `user`
                populate: {
                    path: 'role', // Populate thêm `role` bên trong `user_id`
                    select: 'role_name permissions' // Các trường bạn muốn lấy từ `role`
                }
            }).populate('group_id').populate('hashtag', 'hashtag_name');
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
                    likeData,
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
    getPostByFriends = async (user_id) => {
        try {
            const dataFriend = await friendModel.find({
                user_id: user_id
            })
                .populate({
                    path: 'status_id',
                    match: { status_name: 'Chấp nhận' }, // Chỉ lấy các bản ghi có status_name là "Chấp nhận"
                    select: 'status_name'
                })
                .populate('user_id', 'full_name avatar'); // Lấy thông tin user_id

            // Lọc kết quả nếu populate trả về null do không khớp điều kiện `match`
            const filteredData = dataFriend.filter(item => item.status_id !== null);

            // Lấy danh sách user_id thuộc trạng thái "Chấp nhận" và khác với user_id truyền vào
            const friendList = filteredData.flatMap(item =>
                item.user_id.filter(friend => friend._id.toString() !== user_id.toString())
            );
            // console.log(friendList);

            const friendIds = friendList.map(item => item._id);
            console.log(friendIds);


            // Tìm bài viết của bạn bè
            const posts = await Post.find({ user_id: { $in: friendIds } })
                .sort({ createdAt: -1 }) // Sắp xếp theo `createdAt` giảm dần
                .populate({
                    path: 'user_id',
                    select: 'full_name avatar role', // Chọn các trường của `user`
                    populate: {
                        path: 'role', // Populate thêm `role` bên trong `user_id`
                        select: 'role_name permissions' // Các trường bạn muốn lấy từ `role`
                    }
                })
                .populate('group_id', 'group_name') // Populate thông tin nhóm (nếu cần)
                .populate('hashtag', 'hashtag_name'); // Populate hashtag (nếu cần)

            // Thêm thông tin like_count và comment_count cho từng bài viết
            const postData = await Promise.all(
                posts.map(async (post) => {
                    const likeData = await Like.find({ post_id: post._id });
                    post.like_count = likeData.length;

                    const commentData = await Comment.find({ post_id: post._id });
                    post.comment_count = commentData.length;

                    return {
                        postData: post,
                        likeData,
                        comment_count: commentData.length
                    };
                })
            );

            return HttpResponse.success(postData, HttpResponse.getErrorMessages('getDataSucces'));
        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    }
    getPostByUserID = async (user_id) => {
        try {
            const data = await Post.find({
                user_id
            }).populate({
                path: 'user_id',
                select: 'full_name avatar role', // Chọn các trường của `user`
                populate: {
                    path: 'role', // Populate thêm `role` bên trong `user_id`
                    select: 'role_name permissions' // Các trường bạn muốn lấy từ `role`
                }
            }).populate('group_id');
            // console.log('data: ', data);
            const updatedPosts = await Promise.all(data.map(async (post) => {
                // Lấy số lượng like cho bài viết
                const likeData = await Like.find({ post_id: post._id });
                post.like_count = likeData.length;

                // Lấy số lượng comment cho bài viết
                const commentData = await Comment.find({ post_id: post._id });
                post.comment_count = commentData.length;

                return {
                    postData: post,
                    likeData
                };
            }));
            return HttpResponse.success(updatedPosts, HttpResponse.getErrorMessages('getDataSucces'));
        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    }
    addPost = async (user_id, group_id, title, content, hashtag, imageArray) => {
        try {
            // Tạo bài viết mới
            // console.log(hashtag[0]);
            const newPost = new Post({
                user_id: user_id,
                group_id: group_id || null,
                image: imageArray,
                title: title,
                content: content,
                hashtag: hashtag[0],
            });

            // Lưu bài viết vào cơ sở dữ liệu
            const result = await newPost.save();
            console.log(result);

            return HttpResponse.success(result, HttpResponse.getErrorMessages('success'));
        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    }
    updatePost = async (id, user_id, group_id, title, content, hashtag, imageArray) => {
        try {
            // Tìm bài viết theo ID
            const post = await Post.findById(id);
            if (!post) {
                return HttpResponse.fail(HttpResponse.getErrorMessages('dataNotFound'));
            }

            // Kiểm tra quyền người dùng (chỉ người sở hữu bài viết mới có thể sửa)
            if (post.user_id.toString() !== user_id) {
                return HttpResponse.fail(HttpResponse.getErrorMessages('unauthorized'));
            }

            // Cập nhật thông tin bài viết
            post.user_id = user_id ?? post.user_id;
            post.group_id = group_id ?? post.group_id;
            post.title = title ?? post.title;
            post.content = content ?? post.content;
            post.hashtag = hashtag ?? post.hashtag;

            // Kiểm tra và cập nhật ảnh: nếu không có ảnh mới, set thành mảng rỗng
            post.image = imageArray.length > 0 ? imageArray : [];

            // Lưu bài viết đã cập nhật
            const result = await post.save();
            return HttpResponse.success(result, HttpResponse.getErrorMessages('success'));

        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    }
    deletePost = async (id, user_id, role) => {
        try {
            // Tìm bài viết theo ID
            const post = await Post.findById(id);
            if (!post) {
                return null; // Trả về null nếu không tìm thấy bài viết
            }
            // Kiểm tra nếu người dùng có quyền xóa
            if (post.user_id.toString() !== user_id && role !== 'Admin') {
                console.log("Không phải admin hoặc người dùng không sở hữu bài viết, không cho phép xóa");
                return; // Nếu không phải admin hoặc người dùng không sở hữu bài viết, không cho phép xóa
            }
            // Tiến hành xóa bài viết
            const result = await post.deleteOne();
            if (result) {
                // Xóa like và comment liên quan
                await Like.deleteMany({ post_id: id });
                await Comment.deleteMany({ post_id: id });
            }
            return result; // Trả về kết quả xóa bài viết
        } catch (error) {
            console.log(error);
            throw error; // Ném lỗi nếu có sự cố xảy ra
        }
    }

    searchPostsAdmin = async (searchTerm) => {
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
                .populate("user_id")
                .populate("hashtag") // Giả sử bạn có mối quan hệ với hashtag
            console.log("All Posts Retrieved:", posts); // Log tất cả bài viết được tải
            // Lọc bài viết dựa trên tiêu đề hoặc hashtag
            const filteredPosts = posts.filter((post) => {
                const normalizedTitle = removeVietnameseTones(post.title || "");
                const normalizedHashtag = post.hashtag ? removeVietnameseTones(post.hashtag.hashtag_name.replace('#', '') || "") : "";
                // console.log("Post Title:", post.title); // Log tiêu đề bài viết
                // console.log("Normalized Post Title:", normalizedTitle); // Log tiêu đề đã chuẩn hóa
                // console.log("Post Hashtag:", post.hashtag?.hashtag_name); // Log hashtag của bài viết
                // console.log("Normalized Hashtag:", normalizedHashtag); // Log hashtag đã chuẩn hóa
                // Tìm kiếm trong tiêu đề hoặc hashtag (có hoặc không có dấu #)
                return (
                    normalizedTitle.includes(normalizedSearchTerm) ||
                    normalizedHashtag.includes(normalizedSearchTerm)
                );
            });
            console.log("Filtered Posts:", filteredPosts); // Log các bài viết đã được lọc
            // Nếu không tìm thấy bài viết phù hợp
            if (filteredPosts.length === 0) {
                throw { status: 400, message: "Data not found" };
            }
            return filteredPosts; // Trả về danh sách bài viết phù hợp
        } catch (error) {
            console.error("Error:", error); // Log lỗi nếu có
            throw error;
        }
    };
}

module.exports = PostService;