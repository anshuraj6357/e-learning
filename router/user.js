const express = require("express");
const router = express.Router();
const Validate = require("../middleware/uservalidate");
const upload = require('../utils/multer'); // import multer from utils
const {
    signupcontroller,
    Logincontroller, GetUserProfile,UpdateProfile,Logoutcontroller
} = require("../controller/user");

router.post("/register", signupcontroller);
router.post("/login", Logincontroller)
router.get("/logout",Validate,Logoutcontroller)
router.get("/profile", Validate, GetUserProfile);
router.put(
  "/profile/update",
  Validate,
  upload.single('photourl'),
  (req, res, next) => {
       next(); 
  },
  UpdateProfile
);

module.exports = router;