const mongoose =require("mongoose");

require('dotenv').config();



exports.connect=() =>{
    mongoose.connect(process.env.MONGODB_URL)
    .then(()=>{console.log("your  database is connected")})
    .catch((error)=>{
        console.log("something webt wrong in database");
        console.error("your error is ",error);
        process.exit(1);
    })
};