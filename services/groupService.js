const Group = require("../models/groupModel");
const Conversation = require("../models/conversationModel");
const HttpResponse = require("../utils/httpResponse");

class GroupService {
    getAllGroup = async () => {
        try {
            const data = await Group.find().populate('owner_id', 'full_name');
            // console.log('data: ', data);
            return HttpResponse.success(data, HttpResponse.getErrorMessages('getDataSucces'));
        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    }
    getGroupByID = async (id) => {
        try {
            const data = await Group.findById(id).populate('owner_id', 'full_name');
            return HttpResponse.success(data, HttpResponse.getErrorMessages('getDataSucces'));
        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    }
    createGroup = async (group_name, owner_id, description) => {
        try {
            // Tạo cuộc hội thoại mới cho nhóm
            const newConversation = new Conversation({
                type: 'group',
            });
            await newConversation.save();
            const newGroup = new Group({
                group_name,
                owner_id,
                conversation_id: newConversation._id,
                description,
            });
            await newGroup.save();
            return HttpResponse.success(newGroup, HttpResponse.getErrorMessages('success'));
        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    }
    updateGroup = async (id, group_name, owner_id, description, image, imagetype) => {
        try {
            const newUpdate = await Group.findById(id);
            console.log(newUpdate.owner_id.toString());
            
            if (newUpdate.owner_id.toString() !== owner_id) {
                return
            }
            let result = null;
            if (newUpdate) {
                newUpdate.group_name = group_name ?? newUpdate.group_name,
                newUpdate.description = description ?? newUpdate.description,
                newUpdate.avatar = imagetype === 'avatar' ? image : newUpdate.avatar,
                newUpdate.background_image = imagetype === 'background_image' ? image : newUpdate.background_image,

                result = await newUpdate.save();
            }
            if (result) {
                return HttpResponse.success(result, HttpResponse.getErrorMessages('success'));
            } else {
                return HttpResponse.fail(HttpResponse.getErrorMessages('dataNotFound'));
            }

        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    }
    deleteGroup = async (owner_id, group_id) => {
        try {
            // Kiểm tra xem người dùng đã like bài viết này chưa
            const existingGroup = await Group.findById(group_id);
            console.log(existingGroup.owner_id.toString());
            if (existingGroup.owner_id.toString() !== owner_id) {
                return
            }

            // tiến hành xóa
            await existingGroup.deleteOne();
            return HttpResponse.success(existingGroup, HttpResponse.getErrorMessages('success'));
        } catch (error) {
            console.log(error);
            return HttpResponse.error(error);
        }
    }
}

module.exports = GroupService;