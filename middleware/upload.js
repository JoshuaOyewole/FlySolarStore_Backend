const multer = require("multer");

// memory storage (best if you upload to S3 / Cloudinary)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"), false);
    }
    cb(null, true);
  },
});

const productImageUpload = upload.fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "images", maxCount: 5 },
]);

const blogImageUpload = upload.fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "coverImg", maxCount: 1 },
]);

const bannerImageUpload = upload.single("image");

module.exports = {
  productImageUpload,
  blogImageUpload,
  bannerImageUpload,
};
