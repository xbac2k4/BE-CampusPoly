const Post = require("../../models/postModel");
const User = require("../../models/userModel");
const Group = require("../../models/groupModel");
const GroupService = require("../../services/groupService");
const HttpResponse = require("../../utils/httpResponse");

class GroupController {
    getAllGroup = async (req, res) => {
        try {
            const data = await new GroupService().getAllGroup();
            // console.log('data: ', data);
            return res.json(HttpResponse.result(data));
        } catch (error) {
            console.log(error);
            return res.json(HttpResponse.error(error));
        }
    }
    getGroupByID = async (req, res, next) => {
        const { id } = req.params;
        try {
            const data = await new GroupService().getGroupByID(id);
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
    createGroup = async (req, res, next) => {
        const { group_name, owner_id, description } = req.body;
        try {
            const data = await new GroupService().createGroup(group_name, owner_id, description);
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
    updateGroup = async (req, res, next) => {
        const file = req.file;
        const { id } = req.params;
        const { group_name, owner_id, description, imagetype } = req.body;
        let image = file?.filename === undefined ? '' : `${req.protocol}://${req.get("host")}/uploads/${file?.filename}}`;
        console.log(req.body);
        
        try {
            const data = await new GroupService().updateGroup(id, group_name, owner_id, description, image, imagetype);
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
    deleteGroup = async (req, res, next) => {
        const { owner_id } = req.body;
        const { id } = req.params;
        // console.log(owner_id, id);

        try {
            const data = await new GroupService().deleteGroup(owner_id, id);
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

module.exports = GroupController;
