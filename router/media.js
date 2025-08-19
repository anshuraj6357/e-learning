const express = require('express');
const router = express.Router();
const upload = require('../utils/multer');
const Validate = require("../middleware/uservalidate");
const {UploadindVideo}=require("../controller/uploadvideo");


router.post("/lecture/videoupload",Validate, upload.single('file'), UploadindVideo);

module.exports = router;
