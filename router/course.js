const express = require("express");
const router = express.Router();
const Validate = require("../middleware/uservalidate");
const upload = require('../utils/multer'); // import multer from utils
const {
    CourseControlller,
    GetAallCourses,Editcourse,
    GetCourse,Createlectures,
    Getcourselecture,
    PublishStateHandler,
    Getcoursecreatordetai,
    RemoveCoursed
} = require("../controller/course");
const {Updatecourseprogress,Getcourseprogress}=require('../controller/courseprogress')



console.log("createlecture",typeof RemoveCoursed)
const { EditLectures, RemoveLectures,Getcoursebylecture }=require('../controller/lecture')



router.post("/createcourse",Validate, CourseControlller);
router.get("/getallcourses",Validate, GetAallCourses);
router.get("/getcoursedetails/:courseId",Validate, GetCourse);
router.post("/admin/course/:courseId/lecture",Validate,Createlectures );
router.get("/admin/course/:courseId/getalllectures",Validate,Getcourselecture );
router.patch(`/admin/course/:courseId`,Validate,PublishStateHandler );
router.get('/coursecreatordetail/:userId',Validate,Getcoursecreatordetai)
router.get('/courseprogress/:courseId',Validate,Getcourseprogress)
router.post('/courseprogress/:courseId/:lectureId',Validate,Updatecourseprogress)
router.delete('/deletecourse/:courseId',Validate,RemoveCoursed);
//lectures   





router.delete('/lecture/:lectureId', Validate, RemoveLectures);
router.post('/admin/course/:courseId/lecture/:lectureId',Validate,EditLectures)
router.get('/course/:lectureId',Validate,Getcoursebylecture)



router.put("/editcourse/:courseId",Validate,  upload.single('CourseThumbnail'),
(req,res,next)=>{
 
    next();
    
},
Editcourse );


module.exports = router;