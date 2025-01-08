const dotenv = require('dotenv');
const express = require('express');
const morgan = require('morgan');
const connectToDB = require('./config/db');
const colors = require('colors');
const errorHandler = require('./middleware/error');

// Load env vars
dotenv.config({path: './config/config.env'});

// Connect to Database
connectToDB();

// Middleware files
const logger = require('./middleware/logger');

// Route Files
const bootcamps = require('./routes/bootcamps.routes');



const PORT = process.env.PORT || 5000;

const app = express();

// Body parser
app.use(express.json());


app.get("/", (req, res)=> {
    res.status(200).json({success: true, data: {id: 1}});
});

// Dev logging middleware
if (process.env.NODE_ENV == "development") {
 app.use(morgan('dev'));   
}

app.use(logger); // Own middleware for logger

// Mount Routers
app.use('/api/v1/bootcamps', bootcamps);
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