const mongoose=require('mongoose')




const LectureSchema =new mongoose.Schema({
    lectureTitle:{
        type:String,
        required:true,
    },
    videoUrl:{
        type:String,
    },
    publicid:{
        type:String,
    },
    isPreview:{
        type:Boolean,
    }
   },{timestamps:true});


module.exports = mongoose.model("lecture", LectureSchema);