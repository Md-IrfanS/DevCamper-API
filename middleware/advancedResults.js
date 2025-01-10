// const { getPaginatedData } = require("../utils/paginate");

const advancedResults = (model, populate) => async(req, res, next) => {
    let query;   
    
    // Copy req.query
    const reqQuery = {...req.query};
    
    // Fields to exclude
    const removeFields = ['select','sort','page','limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach((parm)=> delete reqQuery[parm]);        

    // Convert query parameters to a JSON string    
    let queryStr = JSON.stringify(reqQuery);

    // Replace query operators ($gte, $gte ect);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);    
        
    // Parse the modified string back to an object
    let queryObj = JSON.parse(queryStr);
    
    // Execute the query
    query = model.find(queryObj);
    
    if (populate) {
        console.log(populate,'populate called')
        query = query.populate(populate)
    }

    // Select fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join(" ");
        query = query.select(fields);        
    }    
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join("");        
        query = query.sort(sortBy);
    }else{
        query =query.sort('-createAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await model.countDocuments();


    query = query.skip(startIndex).limit(limit);


    // Example
    // const paginationDetails = await getPaginatedData(model, { page: 2, limit: 5 });    

    const results = await query;

    // Pagination result 
    const pagination = {    
        totalPages: total,
        limit: limit,
        currentPage: page    
    };
    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit,
        }
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    }
    res.advancedResults = {
        success: true,
        count: total,
        pagination,
        data: results
    }

    next();
};


module.exports = advancedResults;