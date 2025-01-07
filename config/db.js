const mongoose = require('mongoose');

const connectToDB = async () => {
    const MONGOURI = process.env.MONGO_URI;
    try{
        const conn = await mongoose.connect(MONGOURI);
        console.log(`connection to DB: ${conn.connection.host} successfully...`.cyan.underline.bold);
    }catch(error){
        console.log("error in connecting DB", error)
    }
};

module.exports = connectToDB;