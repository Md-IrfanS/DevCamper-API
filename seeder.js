const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({path: "./config/config.env"});

// Load models
const BootcampModel = require('./models/Bootcamp.model');
const CourseModel = require('./models/Course.model');

// connect to DB
const MONGOURI = process.env.MONGO_URI;
mongoose.connect(MONGOURI);

// Read JSON files
const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`,'utf-8'));
const courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`,'utf-8'));

// Import into DB
const importData = async () => {
    try {
        await BootcampModel.create(bootcamps);
        await CourseModel.create(courses);
        console.log(`Data Imported...`.green.inverse);
        process.exit();
    } catch (error) {
        console.error(error);
    }
};


const deleteData =  async () => {
    try{
        await BootcampModel.deleteMany();
        await CourseModel.deleteMany();
        console.log('Data Destroyed...'.red.inverse);
        process.exit();
    }catch(err){
        console.error(err);
    }
};

if (process.argv[2] === "-i") {
    importData()
}else if (process.argv[2] === "-d") {
    deleteData();
}