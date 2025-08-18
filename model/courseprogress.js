const mongoose = require('mongoose');




const lectureProgressSchema = new mongoose.Schema({
    lectureId: {
        type: String,
        required: true,
    },
    viewed: {
        type: Boolean,
        default: false,
    },

}, { timestamps: true });


const courseProgressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile'
    },
    courselecture: [],
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    courseprogresscompleted: {
        type: Number,
    },
    completed: {
        type: Boolean,
        default: false,
    },
    lectureProgress: [lectureProgressSchema]
}, { timestamps: true });


module.exports = mongoose.model('CourseProg', courseProgressSchema);
