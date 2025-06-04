const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ryd-motos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
    transformation: [{ width: 1200, height: 800, crop: 'limit' }]
  }
});

module.exports = storage;
