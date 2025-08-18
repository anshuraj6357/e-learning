const mongoose = require('mongoose');





const CourseSchem=new mongoose.Schema({
    CourseTitle:{
        type:String,
        required:true,
    },
    CourseSubtitle:{
        type:String,
    },
    Description:{
        type:String,
    },
   Category:{
    type:String,
   },
   CourseLevel:{
    type:String,
    enum:['Beginer','Advance','Medium']
   },

   CoursePrice:{
    type:Number,
   },
   CourseThumbnail:{
    type:String,
   },
   enrolledStudents:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Signup',
   },
   Lectures:[
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:'lecture'
    },
   ],
   Createdby:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Signup'
   },
   isPublished:{
    type:Boolean,
    default:false,
   },
   courseprogress:{
     type:mongoose.Schema.Types.ObjectId,
    ref:'CourseProg'
   },
   coursesold: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Purchase",
      },
    ],
   },{timeStamps:true});

   module.exports = mongoose.model('Course', CourseSchem);

