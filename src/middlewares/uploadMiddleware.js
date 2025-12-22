const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure directories exist
const itemsDir = path.join(__dirname, '../../uploads/items');
const profileDir = path.join(__dirname, '../../uploads/profile');

if (!fs.existsSync(itemsDir)) {
  fs.mkdirSync(itemsDir, { recursive: true });
}
if (!fs.existsSync(profileDir)) {
  fs.mkdirSync(profileDir, { recursive: true });
}

// Item storage configuration
const itemStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('Setting destination for file:', file.originalname);
    cb(null, itemsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = 'item-' + uniqueSuffix + path.extname(file.originalname);
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

// Profile storage configuration
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profileDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  console.log('File upload attempt:', {
    fieldname: file.fieldname,
    originalname: file.originalname,
    mimetype: file.mimetype,
    encoding: file.encoding
  });
  
  // Accept common image types, check file extension, or allow if no mimetype (Flutter issue)
  const isImageMimetype = file.mimetype && file.mimetype.startsWith('image/');
  const hasImageExtension = /\.(jpg|jpeg|png|gif|webp)$/i.test(file.originalname || '');
  const noMimetype = !file.mimetype || file.mimetype === 'application/octet-stream';
  
  if (isImageMimetype || hasImageExtension || noMimetype) {
    cb(null, true);
  } else {
    const error = new Error(`Only image files are allowed. Received: ${file.mimetype}`);
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

const itemUpload = multer({
  storage: itemStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
}).any(); // Accept any field names

// Add logging wrapper
const loggedItemUpload = (req, res, next) => {
  console.log('=== MULTER UPLOAD START ===');
  console.log('Request headers:', req.headers);
  console.log('Content-Type:', req.get('content-type'));
  
  itemUpload(req, res, (err) => {
    if (err) {
      console.log('=== MULTER ERROR ===');
      console.log('Error:', err.message);
      console.log('Error code:', err.code);
      console.log('=== MULTER ERROR END ===');
    } else {
      console.log('=== MULTER SUCCESS ===');
      console.log('Files received:', req.files ? req.files.length : 0);
      if (req.files) {
        req.files.forEach((file, index) => {
          console.log(`File ${index}:`, {
            fieldname: file.fieldname,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            filename: file.filename
          });
        });
      }
      console.log('=== MULTER SUCCESS END ===');
    }
    next(err);
  });
};

const profileUpload = multer({
  storage: profileStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const profileUploadAny = multer({
  storage: profileStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
}).any(); // Accept any field names

// Add logging wrapper for profile upload
const loggedProfileUpload = (req, res, next) => {
  console.log('=== PROFILE UPLOAD START ===');
  console.log('Request headers:', req.headers);
  console.log('Content-Type:', req.get('content-type'));
  
  profileUploadAny(req, res, (err) => {
    if (err) {
      console.log('=== PROFILE UPLOAD ERROR ===');
      console.log('Error:', err.message);
      console.log('Error code:', err.code);
      console.log('=== PROFILE UPLOAD ERROR END ===');
    } else {
      console.log('=== PROFILE UPLOAD SUCCESS ===');
      console.log('Files received:', req.files ? req.files.length : 0);
      if (req.files && req.files.length > 0) {
        // Set req.file for backward compatibility
        req.file = req.files[0];
        console.log('File details:', {
          fieldname: req.file.fieldname,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          filename: req.file.filename
        });
      }
      console.log('=== PROFILE UPLOAD SUCCESS END ===');
    }
    next(err);
  });
};

module.exports = {
  uploadItemImage: loggedItemUpload,
  uploadItemImages: loggedItemUpload, // Accept any files
  uploadProfileImage: loggedProfileUpload
};