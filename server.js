const path = require('path');
const dotenv = require('dotenv');
const express = require('express');
const morgan = require('morgan');
const connectToDB = require('./config/db');
const colors = require('colors');
const errorHandler = require('./middleware/error');
const fileUpload = require('express-fileupload');

// Load env vars
dotenv.config({path: './config/config.env'});

// Connect to Database
connectToDB();

// Middleware files
const logger = require('./middleware/logger');

// Route Files
const bootcamps = require('./routes/bootcamps.routes');
const coursers = require('./routes/courses.routes');
const auth = require('./routes/auth.routes');
const cookieParser = require('cookie-parser');



const PORT = process.env.PORT || 5000;

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser())


app.get("/", (req, res)=> {
    res.status(200).json({success: true, data: {id: 1}});
});

// Dev logging middleware
if (process.env.NODE_ENV == "development") {
 app.use(morgan('dev'));   
}




app.use(logger); // Own middleware for logger

// File Uploading
// Set file size limit to 5MB globally
app.use(fileUpload({
    limits: { fileSize: process.env.MAX_FILE_UPLOAD * 1024 * 1024 },
}));

// Serve static files from 'public' directory
app.use('/public', express.static(path.join(__dirname, 'public')));

// Mount Routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', coursers);
app.use('/api/v1/auth', auth);
app.use(errorHandler)


const server = app.listen(PORT, ()=> {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold)
});


// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise)=> {
    console.log(`Error: ${err.message}`.red);
    
    // Close server & exit process
    server.close(()=> process.exit(1));
});