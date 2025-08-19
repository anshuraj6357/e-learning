const mongoose = require("mongoose")
const ProfileSchema = new mongoose.Schema({
    userid: {

        type: mongoose.Schema.Types.ObjectId,
        ref: 'Signup',

    },
})
module.exports = mongoose.model("Profile", ProfileSchema);