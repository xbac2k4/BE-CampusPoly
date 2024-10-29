const express = require('express');
const router = express.Router();
const GroupController = require('../../controllers/api/groupController');
const upload = require('../../config/common/upload');

router.get('/get-all-group', new GroupController().getAllGroup);
router.get('/get-group-by-id/:id', new GroupController().getGroupByID);
router.post('/create-group', new GroupController().createGroup);
router.put('/update-group/:id', upload.single('image'), new GroupController().updateGroup);
router.delete('/delete-group/:id', new GroupController().deleteGroup);

module.exports = router;
