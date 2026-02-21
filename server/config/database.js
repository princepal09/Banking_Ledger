const mongoose = require("mongoose")
require('dotenv').config();

exports.dbConnect = async() =>{
    try{
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("DATABASE Connection Successfully!!");


    }catch(err){
        console.error(err.message);
        console.log("DATABASE connection failed !!");
        process.exit(1);

    }
}