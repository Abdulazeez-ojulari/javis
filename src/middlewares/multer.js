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
