const User = require("../../models/userModel");
const FriendService = require("../../services/friendService");
const HttpResponse = require("../../utils/httpResponse");

class CommentController {
    getAllFriend = async (req, res) => {
        try {
            const data = await new FriendService().getAllFriend();
            // console.log('data: ', data);
            return res.json(HttpResponse.result(data));
        } catch (error) {
            console.log(error);
            return res.json(HttpResponse.error(error));
        }
    }
    getFriendByUserID = async (req, res, next) => {
        const { user_id } = req.query;
        try {
            const data = await new FriendService().getFriendByUserID(user_id);
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
    addFriend = async (req, res, next) => {
        const { user_id, user_friend_id } = req.body;
        console.log(req.body);

        try {
            const data = await new FriendService().addFriend(user_id, user_friend_id);
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
    updateFriend = async (req, res, next) => {
        const { user_id, user_friend_id } = req.body;
        console.log(req.body);

        try {
            const data = await new FriendService().updateFriend(user_id, user_friend_id);
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
    removeFriend = async (req, res, next) => {
        const { user_id, user_friend_id } = req.body;
        console.log(req.body);

        try {
            const data = await new FriendService().removeFriend(user_id, user_friend_id);
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
}

module.exports = CommentController;
