const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'image/tiff'
];

const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.tiff', '.tif'];
const MAX_FILE_SIZE = 52428800; // 50MB

export function validateFile(file) {
  const errors = [];

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    errors.push(`File exceeds maximum size of 50MB`);
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    errors.push(`File type ${file.mimetype} is not allowed`);
  }

  // Check file extension
  const ext = '.' + file.originalname.split('.').pop().toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    errors.push(`File extension ${ext} is not allowed`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function sanitizeFileName(fileName) {
  // Remove path traversal attempts and dangerous characters
  return fileName
    .replace(/\.\./g, '')
    .replace(/[\/\\]/g, '')
    .replace(/[<>:"|?*]/g, '')
    .trim();
}

export function getFileCategory(mimetype) {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype === 'application/pdf') return 'pdf';
  if (mimetype.includes('word') || mimetype.includes('document')) return 'document';
  if (mimetype.includes('sheet') || mimetype.includes('excel')) return 'spreadsheet';
  return 'file';
}
