const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary storage for items
const itemCloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'scrum-coffee/items',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }]
  }
});

// Cloudinary storage for profiles
const profileCloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'scrum-coffee/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'limit' }]
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
  storage: itemCloudinaryStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
}).any();

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
  storage: profileCloudinaryStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const profileUploadAny = multer({
  storage: profileCloudinaryStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
}).any();

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