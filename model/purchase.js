const mongoose = require('mongoose')



const PurchaseSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required:true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Signup',
        require:true
    },
    amount:{
        type:String,
        require:true
    },
    status:{
        type:String,
        enum:['pending','completed','failed']
    },
    paymentid:{
        type:String,
        required:true
    }
})


module.exports = mongoose.model("purchase", PurchaseSchema);