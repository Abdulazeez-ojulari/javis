const multer = require("multer");

exports.inventoryImagesUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: function (req, file, cb) {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/jpg"
    ) {
      return cb(null, true);
    } else {
      let error = new Error("Only .PNG, .JPG, and, .JPEG files allowed.");
      error.status = 400;
      cb(error, false);
    }
  },
}).array("images", 6);

exports.avatar = multer({
  storage: multer.memoryStorage(),
  fileFilter: function (req, file, cb) {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/jpg"
    ) {
      return cb(null, true);
    } else {
      let error = new Error("Only .PNG, .JPG, and, .JPEG files allowed.");
      error.status = 400;
      cb(error, false);
    }
  },
}).single("avatar");

exports.doc = multer({
  storage: multer.memoryStorage(),
  fileFilter: function (req, file, cb) {
    if (
      file.mimetype === "application/msword" ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.mimetype === "application/pdf"
    ) {
      return cb(null, true);
    } else {
      let error = new Error("Only .PDF and Word Docs allowed.");
      error.status = 400;
      cb(error, false);
    }
  },
}).single("doc");
