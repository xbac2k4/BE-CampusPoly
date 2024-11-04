const Friend = require("../models/friendModel");
const HttpResponse = require("../utils/httpResponse");

class FriendService {
    getAllFriend = async () => {
        try {
            const data = await Friend.find().populate('user_friend_id', 'full_name avatar').populate('user_id', 'full_name avatar').populate('status_id', 'status_name');
            // console.log('data: ', data);
            return HttpResponse.success(data, HttpResponse.getErrorMessages('getDataSucces'));
        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    }
    getFriendByUserID = async (user_id) => {
        try {
            const data = await Friend.find({
                user_id
            }).populate('user_friend_id', 'full_name avatar').populate('user_id', 'full_name avatar').populate('status_id', 'status_name');
            return HttpResponse.success(data, HttpResponse.getErrorMessages('getDataSucces'));
        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    }
    addFriend = async (user_id, user_friend_id, status_id) => {
        try {
            // Tìm kiếm bản ghi bạn bè theo user_id và user_friend_id
            let existingFriend = await Friend.findOne({ user_id, user_friend_id });

            if (existingFriend) {
                // Nếu chưa tồn tại, tạo mới Friend
                console.log('Bạn đã tồn tại trong danh sách bạn bè');
                return
            }
            const newFriend = new Friend({
                user_id,
                user_friend_id,
                status_id
            });
            const result = await newFriend.save();
            console.log('Tạo Friend thành công');
            return HttpResponse.success(result, HttpResponse.getErrorMessages('success'));
        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    }
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