const mongoose = require("mongoose");

const SignupSchema = new mongoose.Schema({
  email: {
    type: String,    
    required: true,
    unique: true,
  },
  username: {         
    type: String,
    required: true,
    unique: true,
  },
  phonenumber: {
    type: String,      
    required: true,
    unique: true,
    minlength: 10,     
    maxlength: 10,
  },
  Role:{
    type: String,
    enum:["Student","Teacher"]
  },
  password: {
    type: String,
    required: true,
  },
  enrolledcourses:[
    {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Course"
    }
  ],

 photourl: {
  type: String,
  required: false,   
},

});

module.exports = mongoose.model("Signup", SignupSchema);
