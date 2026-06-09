/**
 * Image Upload Service — ReTruck MVP
 *
 * Handles validation and local preview for user-uploaded images.
 * Categories:
 *   'profile-picture' → public/User Images/profile-pictures/
 *   'truck-photo'     → public/User Images/truck-photos/
 *   'kyc-document'    → public/User Images/kyc-documents/
 *
 * NOTE: In a frontend-only (Vite) app, actual file persistence to the
 * filesystem requires a backend endpoint. Here we:
 *   1. Validate the file strictly (type + size)
 *   2. Return an object URL for instant live preview
 *   3. Provide the intended save path for when a backend is wired up
 */

/** Allowed MIME types */
var ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/** Allowed extensions (for display purposes) */
var ALLOWED_EXTENSIONS = ['JPG', 'JPEG', 'PNG', 'WebP'];

/** Maximum file size: 1 MB in bytes */
var MAX_SIZE_BYTES = 1 * 1024 * 1024; // 1,048,576 bytes

/** Category to subfolder mapping */
var CATEGORY_FOLDERS = {
  'profile-picture': 'profile-pictures',
  'truck-photo': 'truck-photos',
  'kyc-document': 'kyc-documents'
};

/**
 * Validate an image file against rules.
 * @param {File} file
 * @returns {{ valid: boolean, error: string|null }}
 */
function validateImageFile(file) {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  // Check MIME type
  var mimeType = file.type.toLowerCase();
  if (!ALLOWED_TYPES.includes(mimeType)) {
    return {
      valid: false,
      error: 'Invalid file type. Only ' + ALLOWED_EXTENSIONS.join(', ') + ' files are allowed.'
    };
  }

  // Double-check extension as well (some browsers spoof MIME)
  var fileName = file.name.toLowerCase();
  var ext = fileName.split('.').pop();
  var allowedExts = ['jpg', 'jpeg', 'png', 'webp'];
  if (!allowedExts.includes(ext)) {
    return {
      valid: false,
      error: 'Invalid file extension. Only ' + ALLOWED_EXTENSIONS.join(', ') + ' are accepted.'
    };
  }

  // Check file size
  if (file.size > MAX_SIZE_BYTES) {
    var sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: 'File is too large (' + sizeMB + ' MB). Maximum allowed size is 1 MB.'
    };
  }

  return { valid: true, error: null };
}

/**
 * Generate a filename for the uploaded file.
 * Format: {category}_{userId}_{timestamp}.{ext}
 * @param {string} category
 * @param {string} userId
 * @param {File} file
 * @returns {string}
 */
function generateFileName(category, userId, file) {
  var ext = file.name.split('.').pop().toLowerCase();
  var timestamp = Date.now();
  var safeUserId = (userId || 'anonymous').replace(/[^a-zA-Z0-9]/g, '_');
  return category + '_' + safeUserId + '_' + timestamp + '.' + ext;
}

/**
 * Get the intended save path for a file.
 * @param {string} category
 * @param {string} fileName
 * @returns {string}
 */
function getSavePath(category, fileName) {
  var folder = CATEGORY_FOLDERS[category] || 'misc';
  return 'public/User Images/' + folder + '/' + fileName;
}

/**
 * Process an image upload:
 * 1. Validate type and size
 * 2. Create a local object URL for preview
 * 3. Return metadata including intended save path
 *
 * @param {File} file - The selected File object
 * @param {string} category - 'profile-picture' | 'truck-photo' | 'kyc-document'
 * @param {string} userId - Current user's ID (for filename)
 * @returns {{ success: boolean, previewUrl: string|null, fileName: string|null, savePath: string|null, error: string|null }}
 */
function processImageUpload(file, category, userId) {
  // Validate
  var validation = validateImageFile(file);
  if (!validation.valid) {
    return {
      success: false,
      previewUrl: null,
      fileName: null,
      savePath: null,
      error: validation.error
    };
  }

  // Generate filename and path
  var fileName = generateFileName(category, userId, file);
  var savePath = getSavePath(category, fileName);

  // Create object URL for live preview
  var previewUrl = URL.createObjectURL(file);

  return {
    success: true,
    previewUrl: previewUrl,
    fileName: fileName,
    savePath: savePath,
    error: null
  };
}

/**
 * Revoke a previously created object URL to free memory.
 * Call this when the component unmounts or the image is replaced.
 * @param {string} url
 */
function revokePreviewUrl(url) {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

/**
 * Convert a File object to a Base64 data URL.
 * @param {File} file
 * @returns {Promise<string>}
 */
function fileToBase64(file) {
  return new Promise(function (resolve, reject) {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () { resolve(reader.result); };
    reader.onerror = function (error) { reject(error); };
  });
}

export {
  ALLOWED_EXTENSIONS,
  MAX_SIZE_BYTES,
  CATEGORY_FOLDERS,
  validateImageFile,
  generateFileName,
  getSavePath,
  processImageUpload,
  revokePreviewUrl,
  fileToBase64
};

export default processImageUpload;
