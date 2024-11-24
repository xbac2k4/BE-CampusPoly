const Friend = require("../models/friendModel");
const HttpResponse = require("../utils/httpResponse");

class FriendService {
    getAllFriend = async () => {
        try {
            const data = await Friend.find().populate('user_id', 'full_name avatar').populate('status_id', 'status_name');
            // console.log('data: ', data);
            return HttpResponse.success(data, HttpResponse.getErrorMessages('getDataSucces'));
        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    }
    // getFriendByUserID = async (user_id) => {
    //     try {
    //         const data = await Friend.find({
    //             user_id
    //         }).populate('user_friend_id', 'full_name avatar').populate('user_id', 'full_name avatar').populate('status_id', 'status_name');
    //         return HttpResponse.success(data, HttpResponse.getErrorMessages('getDataSucces'));
    //     } catch (error) {
    //         console.log(error);
    //         return HttpResponse.error(error);
    //     }
    // }
    getFriendByUserID = async (user_id) => {
        try {
            // Tìm kiếm bạn bè với điều kiện user_id khớp và status_name là "Chấp nhận"
            const data = await Friend.find({
                user_id: user_id
            })
                .populate({
                    path: 'status_id',
                    match: { status_name: 'Chấp nhận' }, // Chỉ lấy các bản ghi có status_name là "Chấp nhận"
                    select: 'status_name'
                })
                .populate('user_id', 'full_name avatar'); // Lấy thông tin user_id

            // Lọc kết quả nếu populate trả về null do không khớp điều kiện `match`
            const filteredData = data.filter(item => item.status_id !== null);

            return HttpResponse.success(filteredData, HttpResponse.getErrorMessages('getDataSuccess'));
        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    };

    // addFriend = async (user_id, user_friend_id, status_id) => {
    //     try {
    //         // Tìm kiếm bản ghi bạn bè theo user_id và user_friend_id
    //         let existingFriend = await Friend.findOne({ user_id, user_friend_id });

    //         if (existingFriend) {
    //             // Nếu chưa tồn tại, tạo mới Friend
    //             console.log('Bạn đã tồn tại trong danh sách bạn bè');
    //             return
    //         }
    //         const newFriend = new Friend({
    //             user_id,
    //             user_friend_id,
    //             status_id
    //         });
    //         const result = await newFriend.save();
    //         console.log('Tạo Friend thành công');
    //         return HttpResponse.success(result, HttpResponse.getErrorMessages('success'));
    //     } catch (error) {
    //         console.log(error);
    //         return HttpResponse.error(error);
    //     }
    // }
    addFriend = async (user_id, user_friend_id) => {
        try {
            // Kiểm tra xem user_friend_id đã tồn tại trong danh sách user_id của bản ghi chưa
            let existingFriend = await Friend.findOne({
                user_id: { $all: [user_id, user_friend_id] } // Kiểm tra user_id chứa cả user_id và user_friend_id
            });

            if (existingFriend) {
                // Nếu bản ghi đã tồn tại và user_friend_id đã có trong danh sách user_id
                console.log('Người bạn này đã tồn tại trong danh sách bạn bè.');
                return;
            }

            // Nếu không có bản ghi nào, tạo mới
            const newFriend = new Friend({
                user_id: [user_id, user_friend_id], // Khởi tạo danh sách user_id
                status_id: "6722f39c6b106a3d9e47d7a6"
            });
            const result = await newFriend.save();
            console.log('Tạo bản ghi bạn bè mới thành công.');
            return HttpResponse.success(result, HttpResponse.getErrorMessages('success'));
        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    }
    updateFriend = async (user_id, user_friend_id) => {
        try {
            // Tìm kiếm bản ghi bạn bè và cập nhật trạng thái
            const result = await Friend.findOneAndUpdate(
                { user_id: { $all: [user_id, user_friend_id] } }, // Tìm theo cả 2 user_id
                { $set: { status_id: "6722f3cd6b106a3d9e47d7a7" } },  // Cập nhật status_id
                { new: true } // Trả về bản ghi đã cập nhật
            );
            console.log(result);

            if (!result) {
                console.log('Không tìm thấy bạn bè');
                return HttpResponse.error(null, HttpResponse.getErrorMessages('dataNotFound'));
            }

            console.log('Cập nhật trạng thái thành công:', result);
            return HttpResponse.success(result, HttpResponse.getErrorMessages('success'));
        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    };

    removeFriend = async (user_id, user_friend_id) => {
        try {
            // Tìm kiếm bản ghi bạn bè theo user_id và user_friend_id
            const existingFriend = await Friend.findOne({ user_id, user_friend_id });

            if (!existingFriend) {
                return
            }

            // Nếu đã tìm thấy, xóa bản ghi
            await Friend.deleteOne({ user_id, user_friend_id });

            return HttpResponse.success(existingFriend, HttpResponse.getErrorMessages('success'));
        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    }
}

module.exports = FriendService;