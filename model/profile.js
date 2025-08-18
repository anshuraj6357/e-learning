const mongoose = require("mongoose")




const ProfileSchema = new mongoose.Schema({

    userid: {

        type: mongoose.Schema.Types.ObjectId,
        ref: 'Signup',

    },

    enrolledcourses:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
    }],

})

module.exports = mongoose.model("Profile", ProfileSchema);