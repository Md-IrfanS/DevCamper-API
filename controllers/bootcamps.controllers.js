const path = require('path');
const fs = require('fs');
const mime = require('mime-types');
const { sendResponse } = require("../utils/response");
const geocoder = require('../utils/geocoder');
const BootcampModel = require('../models/Bootcamp.model');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler =require('../middleware/async');
const { getPaginatedData } = require('../utils/paginate');
const CourseModel = require("../models/Course.model");
const { v4: uuidv4 } = require('uuid'); // Import uuid to generate unique IDs
const { allowedMimeTypes, isAllowedMimeType, getFolderByMimeType } = require('../utils/projectconstant');

// @desc    GET all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
module.exports.getBootcamps = asyncHandler(async (req, res, next) =>{       
    // Send the response
    return sendResponse(res, 200, "Show all bootcamps", {count: res.advancedResults.count, pagination: false && paginationDetails.pagination, data: res.advancedResults.data, pagination: res.advancedResults.pagination});            
});

// Utility function to safely extract and format query parameters
const queryExtract = (req, type) => {
    const queryValue = req.query[type];
    return queryValue ? queryValue.split(",").join(" ") : ""; // Return empty string if undefined
};

// @desc    GET single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public

module.exports.getBootcamp = asyncHandler(async (req, res, next) =>{    
    
    const select = queryExtract(req, 'select');
    const populate = queryExtract(req, 'courses');
    
    // Build the query
    let query = BootcampModel.findById(req.params.id);

    // Apply user-based filtering if `req.user` exists
    if (req.user) {
        query = query.find({ user: req.user.id });
    }

    // Apply the "select" fields if provided
    if (select) {
        query = query.select(select);
    }
    // Apply population if requested
    if (populate) {
        query = query.populate({ path: "courses", select: populate });
    }
    // Execute the query
    const bootcamp = await query;    
    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404))
    }

    // Send the response
    return sendResponse(res, 200, `Show bootcamp ${req.params.id}`, bootcamp);
});

// @desc    create new bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private

module.exports.createBootcamp = asyncHandler(async (req, res, next) => {    
    // Add user to req.body    
    req.body.user = req.user.id;
    
    // Check for published bootcamp
    const publishBootcamp = await BootcampModel.findOne({user: req.user.id});

    // if user is not an admin, they can only add one bootcamp
    if (publishBootcamp && req.user.role !== 'admin') {
        return next(new ErrorResponse(`The user with ID ${req.user.id} has already published a bootcamp`,404));
    }

    const newBootcamp = await BootcampModel.create(req.body);
    return sendResponse(res, 201, 'create new bootcamp', newBootcamp);    
});

// @desc    Update bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private

module.exports.updateBootcamp = asyncHandler(async (req, res, next) => {    
    let bootcamp = await BootcampModel.findById(req.params.id);

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404))
    }

    if (bootcamp.user.toString() !== req.user.id && !req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.params.id} is not authorized to update this bootcamp`,401));
    }

    bootcamp = await BootcampModel.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    return sendResponse(res, 201, `Update bootcamp ${req.params.id}`, bootcamp);    
});


// @desc    Delete bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private

module.exports.deleteBootcamp = asyncHandler(async (req, res, next) => {    
    console.log(req.params);
    const bootcamp = await BootcampModel.findById(req.params.id);

    console.log(bootcamp);
    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404))
    }

    if (bootcamp.user.toString() !== req.user.id && !req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.params.id} is not authorized to delete this bootcamp`,401));
    }
    
    await bootcamp.deleteOne();

    return sendResponse(res, 200, `Deleted bootcamp ${req.params.id} successfully`);    
});


// @desc    Delete all bootcamp
// @route   DELETE /api/v1/bootcamps/all
// @access  Private

module.exports.allDeleteBootcamp = asyncHandler(async (req, res, next) => {    
    const bootcamps = await BootcampModel.find({});
    
    if (!bootcamps || bootcamps.length == 0) {
        return sendResponse(res, 404, `No bootcamps found to delete`);
    }
    
    // Delete related courses for each bootcamp
    const bootcampsId = bootcamps.map((bootcamp) => bootcamp._id);

    // Delete all related courses
    await CourseModel.deleteMany({bootcamp: { $in: bootcampsId }});

    // Delete all bootcamps
    const deleteAll = await BootcampModel.deleteMany({});
    
    return sendResponse(res, 200, `Deleted all bootcamps`, { deletedData: deleteAll });
});


// @desc    Get bootcamps within a radius
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access  Private

module.exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
    const {zipcode, distance} = req.params;

    // Get lat/lng from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lng = loc[0].longitude;
    const lat = loc[0].latitude;

    // Calc radius using radians
    // Divide distance by radius
    // Earth Radius = 3,963.1906 mi / 6,378.1370 km
    const radius = distance / 3963
    const bootcamps = await BootcampModel.find({location: {$geoWithin: {$centerSphere: [[lng, lat], radius]}}});

    return sendResponse(res, 200, `Filter by Based on radius and distance bootcamps`, {count: bootcamps.length, data: bootcamps });
});


// @desc    Upload photo
// @route   PUT /api/v1/bootcamps/:bootcampId/photo
// @access  Private

module.exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {        
    try {
        // Check if bootcamp ID exists
        const bootcamp = await BootcampModel.findById(req.params.bootcampId);
        if (!bootcamp) {
            return next(new ErrorResponse(`Bootcamp not found with ID ${req.params.bootcampId}`, 404));
        }

        if (bootcamp.user.toString() !== req.user.id && !req.user.role !== 'admin') {
            return next(new ErrorResponse(`User ${req.params.id} is not authorized to update this bootcamp`,401));
        }

        // Check if a file is uploaded
        if (!req.files || !req.files.file) {
            return next(new ErrorResponse('Please upload a file', 400));
        }

        const file = req.files.file;        

        // Validate MIME type
        if (!isAllowedMimeType(file.mimetype)) {
            return next(new ErrorResponse('Unsupported file type', 400));
        }       

        // Validate file size (5MB limit)
        const MAX_FILE_SIZE = process.env.MAX_FILE_UPLOAD * 1024 * 1024; // 5MB
        if (file.size > MAX_FILE_SIZE) {
            return next(new ErrorResponse(`File size exceeds the ${MAX_FILE_SIZE}MB limit`, 400));
        }

        // Get folder based on file type
        const folder = getFolderByMimeType(file.mimetype);
        if (!folder) {
            return next(new ErrorResponse('Unsupported file type', 400));
        }

        // Build upload directory and path
        const uploadDir = path.join(__dirname, process.env.FILE_UPLOAD_PATH, folder);
        const fileName = `${bootcamp._id}_${Date.now()}_${file.name}`;
        const uploadPath = path.join(uploadDir, fileName);

        // Ensure the upload directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Move file to the upload directory
        file.mv(uploadPath, async (err) => {
            if (err) {
                console.error('File upload error:', err.message || err);
                return next(new ErrorResponse('Problem with file upload', 500));
            }

            // Update the bootcamp record with the uploaded file name
            await BootcampModel.findByIdAndUpdate(req.params.bootcampId, { photo: fileName });

            res.status(200).json({
                success: true,
                data: fileName,
            });
        });
    } catch (err) {
        console.error('Unexpected error:', err.message || err);
        return next(new ErrorResponse('Unexpected error occurred', 500));
    }
});


// @desc    Remove photo
// @route   DELETE /api/v1/bootcamps/:bootcampId/photo
// @access  Private

module.exports.deleteBootcampPhoto = asyncHandler(async (req, res, next) => {
    try {
        const bootcamp = await BootcampModel.findById(req.params.bootcampId);

        if (!bootcamp) {
            return next(new ErrorResponse(`Bootcamp not found with ID ${req.params.bootcampId}`, 404));
        }

        if (bootcamp.user.toString() !== req.user.id && !req.user.role !== 'admin') {
            return next(new ErrorResponse(`User ${req.params.id} is not authorized to update this bootcamp`,401));
        }

        // Find the file to be deleted by unique ID
        const fileToDelete = bootcamp.photo;
        if (!bootcamp.phone) {
            bootcamp.phone = ""
        }
                             
        // Determine the MIME type based on the file name
        const mimeType = mime.lookup(fileToDelete);

        


        // Find the corresponding folder for the MIME type
        const folderMapping = allowedMimeTypes.find(item => item.mimeType === mimeType);        
        if (!folderMapping) {
            return next(new ErrorResponse('Unsupported file type', 400));
        }

        // Construct the file path and normalize it
        const filePath = path.normalize(path.join(__dirname, process.env.FILE_UPLOAD_PATH, folderMapping.folder, fileToDelete));
        console.log('__dirname:', __dirname);
        console.log('FILE_UPLOAD_PATH:', process.env.FILE_UPLOAD_PATH);
        console.log('File Name:', fileToDelete.fileName);
        console.log('Complete file path:', filePath);  // Log full path for troubleshooting

        try {
            // Check if the file exists and delete
            await fs.promises.access(filePath);
            await fs.promises.unlink(filePath);  // Delete the file
            console.log(`File deleted at path: ${filePath}`);
        } catch (err) {
            return next(new ErrorResponse(`File not found at path: ${filePath}`, 404));
        }

        // Remove the file entry from the photo array in the bootcamp document
        await BootcampModel.findByIdAndUpdate(req.params.bootcampId, {
            photo: ""
        }, { new: true }); // Return the updated bootcamp document

        res.status(200).json({
            success: true,
            message: 'File deleted successfully',
        });

    } catch (error) {
        console.error('Unexpected error:', error.message || error);
        return next(new ErrorResponse('Unexpected error occurred', 500));
    }
});

// @desc    Upload doc
// @route   PUT /api/v1/bootcamps/:bootcampId/docupload
// @access  Private

module.exports.bootcampDocUpload = asyncHandler(async (req, res, next) => {        
    try {
        // Check if bootcamp ID exists
        const bootcamp = await BootcampModel.findById(req.params.bootcampId);
        if (!bootcamp) {
            return next(new ErrorResponse(`Bootcamp not found with ID ${req.params.bootcampId}`, 404));
        }

        // Check if a file is uploaded
        if (!req.files || !req.files.file) {
            return next(new ErrorResponse('Please upload a file', 400));
        }
        

        const files = Array.isArray(req.files.file) ? req.files.file : [req.files.file];
                
        // Allowed MIME types and folder mappings
        const allowedMimeTypes = [
            { mimeType: 'image/jpeg', folder: 'images', description: 'JPEG image (jpg, jpeg)' },
            { mimeType: 'image/png', folder: 'images', description: 'PNG image (png)' },
            { mimeType: 'application/pdf', folder: 'documents', description: 'PDF document (pdf)' },
            { mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', folder: 'excel', description: 'Excel spreadsheet (xlsx)' },
            { mimeType: 'application/vnd.ms-excel', folder: 'excel', description: 'Excel spreadsheet (xls)' },
            { mimeType: 'application/msword', folder: 'documents', description: 'Word document (doc)' },
            { mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', folder: 'documents', description: 'Word document (docx)' }
        ];
                
        const fileDetails = []; // Array to store file details with unique ID

        // Iterate over all uploaded files
        for(const file of files){
            // Check if MIME type is allowed
            const fileType = allowedMimeTypes.find(type => type.mimeType === file.mimetype);
            if (!fileType) {
                return next(new ErrorResponse(`Unsupported file type: ${file.mimetype}`, 400));
            }

            // Check file size
            const MAX_FILE_SIZE = process.env.MAX_FILE_UPLOAD * 1024 * 1024;
            if (file.size > MAX_FILE_SIZE) {
                return next(new ErrorResponse(`File size exceeds the ${process.env.MAX_FILE_UPLOAD}MB limit`, 400));
            }

            // Create folder path based on file type
            const folder = fileType.folder || 'others';
            const uploadDir = path.join(__dirname, process.env.FILE_UPLOAD_PATH, folder);
            const uniqueId = uuidv4(); // Generate unique ID for the file
            const fileName = `${bootcamp._id}_${uniqueId}_${file.name}`; // Append unique ID to file name
            const uploadPath = path.join(uploadDir, fileName);            

            // Ensure the upload directory exists
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            // Use Promise to handle file upload asynchronously
            await file.mv(uploadPath, async (err) => {
                if (err) {
                    console.error('File upload error:', err.message || err);
                    return next(new ErrorResponse('Problem with file upload', 500));
                }
            })
            
            // Store file details with the unique ID
            fileDetails.push({
                fileName,
                fileSize: file.size,
                fileType: fileType.mimeType,
                url: fileName,
            });
        }
        
        await BootcampModel.findByIdAndUpdate(req.params.bootcampId,  { $push: { uploadDoc: { $each: fileDetails } } },{new: true});

        // Return response with uploaded file information
        res.status(200).json({
            success: true,
            data: fileDetails, // Return uploaded file info with unique IDs
        });

    } catch (err) {
        console.error('Unexpected error:', err.message || err);
        return next(new ErrorResponse('Unexpected error occurred', 500));
    }
});



// @desc    Remove upload
// @route   DELETE /api/v1/bootcamps/:bootcampId/uploaddoc/:docId
// @access  Private

module.exports.deleteBootcampUploadDoc = asyncHandler(async (req, res, next) => {
    try {
        const bootcamp = await BootcampModel.findById(req.params.bootcampId);

        if (!bootcamp) {
            return next(new ErrorResponse(`Bootcamp not found with ID ${req.params.bootcampId}`, 404));
        }

        // Find the file to be deleted by unique ID
        const fileToDelete = bootcamp.uploadDoc.find(file => String(file._id) === req.params.docId);
        
        if (!fileToDelete) {
            return next(new ErrorResponse('File not found', 404));
        }

         // Get MIME type of the file (assuming it's stored in the file object)
         const fileType = fileToDelete.fileType;
         const allowedMimeTypes = [
            { mimeType: 'image/jpeg', folder: 'images', description: 'JPEG image (jpg, jpeg)' },
            { mimeType: 'image/png', folder: 'images', description: 'PNG image (png)' },
            { mimeType: 'application/pdf', folder: 'documents', description: 'PDF document (pdf)' },
            { mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', folder: 'excel', description: 'Excel spreadsheet (xlsx)' },
            { mimeType: 'application/vnd.ms-excel', folder: 'excel', description: 'Excel spreadsheet (xls)' },
            { mimeType: 'application/msword', folder: 'documents', description: 'Word document (doc)' },
            { mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', folder: 'documents', description: 'Word document (docx)' }
        ];


        // Find the corresponding folder for the MIME type
        const folderMapping = allowedMimeTypes.find(item => item.mimeType === fileType);
        
        if (!folderMapping) {
            return next(new ErrorResponse('Unsupported file type', 400));
        }

        // Construct the file path and normalize it
        const filePath = path.normalize(path.join(__dirname, process.env.FILE_UPLOAD_PATH, folderMapping.folder, fileToDelete.fileName));        

        try {
            // Check if the file exists and delete
            await fs.promises.access(filePath);
            await fs.promises.unlink(filePath);  // Delete the file            
        } catch (err) {
            return next(new ErrorResponse(`File not found at path: ${filePath}`, 404));
        }

        // Remove the file entry from the photo array in the bootcamp document
        await BootcampModel.findByIdAndUpdate(req.params.bootcampId, {
            $pull: { uploadDoc: { _id: req.params.docId } }
        }, { new: true }); // Return the updated bootcamp document

        res.status(200).json({
            success: true,
            message: 'File deleted successfully',
        });

    } catch (error) {
        console.error('Unexpected error:', error.message || error);
        return next(new ErrorResponse('Unexpected error occurred', 500));
    }
});


// @desc    Get all bootcamps for the user
// @route   GET /api/v1/bootcamps/user
// @access  Private

module.exports.getAllBootcampsByUser = asyncHandler ( async (req, res, next) => {      
    const allBootcamps = await BootcampModel.find({user: req.user.id});     
    return sendResponse(res, 200, `Get by user ${req.user.id} bootcamps`, allBootcamps);
});