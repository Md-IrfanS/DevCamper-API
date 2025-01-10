const allowedMimeTypes = [
    { mimeType: 'image/jpeg', folder: 'images', description: 'JPEG image (jpg, jpeg)' },
    { mimeType: 'image/png', folder: 'images', description: 'PNG image (png)' },
    { mimeType: 'application/pdf', folder: 'documents', description: 'PDF document (pdf)' },
    { mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', folder: 'excel', description: 'Excel spreadsheet (xlsx)' },
    { mimeType: 'application/vnd.ms-excel', folder: 'excel', description: 'Excel spreadsheet (xls)' },
    { mimeType: 'application/msword', folder: 'documents', description: 'Word document (doc)' },
    { mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', folder: 'documents', description: 'Word document (docx)' }
];

// Helper: Get folder based on MIME type
const getFolderByMimeType = (mimeType) => {
    const type = allowedMimeTypes.find(item => item.mimeType === mimeType);
    return type ? type.folder : null;
};

// Helper: Check if MIME type is allowed
const isAllowedMimeType = (mimeType) => allowedMimeTypes.some(item => item.mimeType === mimeType);

module.exports = {allowedMimeTypes, getFolderByMimeType, isAllowedMimeType}