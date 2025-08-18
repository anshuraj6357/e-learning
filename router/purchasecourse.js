const express=require('express');
const router =express.Router();
const Validate = require("../middleware/uservalidate");

const {
    CreateCheckOut,
Getallpurchasedcourse,checkcoursestatus
}=require('../controller/coursepurchase');


router.get('/allpurchasecourse',Getallpurchasedcourse)
router.post('/checkout/create-checkout-session',Validate,CreateCheckOut);
router.get('/purchasedcoursedetail/:courseId',Validate,checkcoursestatus)
router.get('/getallpurchasedcourse',Validate,Getallpurchasedcourse)


module.exports = router;
