function paginate({ totalItems, currentPage = 1, limit = 10, data = [] }) {
    // Ensure currentPage and limit are integers and greater than zero
    currentPage = Math.max(1, parseInt(currentPage, 10) || 1);
    limit = Math.max(1, parseInt(limit, 10) || 10);

    // Calculate total pages
    const totalPages = Math.ceil(totalItems / limit);

    // Ensure currentPage is within bounds
    currentPage = Math.min(currentPage, totalPages);

    // Calculate start and end indices
    const startIndex = (currentPage - 1) * limit;
    const endIndex = Math.min(startIndex + limit, totalItems);

    // Pagination object
    const pagination = {
        totalItems,
        totalPages,
        limit, // Number of items per page
        currentPage,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
        nextPage: currentPage < totalPages ? currentPage + 1 : null,
        prevPage: currentPage > 1 ? currentPage - 1 : null,
        startIndex: Math.max(0, startIndex),
        endIndex: Math.max(0, endIndex),
    };

    // Paginated data (only if a data array is passed)
    const paginatedData = data.slice(pagination.startIndex, pagination.endIndex);

    return { pagination, data: paginatedData };
}


const getPaginatedData = async (Model, { page = 1, limit = 10 }, query) => {
    const totalItems = await Model.countDocuments(query);
    const data = await Model.find(query)
        .skip((page - 1) * limit)
        .limit(limit);

    return paginate({ totalItems, currentPage: page, pageSize: limit, data });
};


module.exports = {paginate, getPaginatedData}