var express = require("express");
const multer = require("multer");
const uploadMiddleWare = multer({ dest: "uploads/" }).single("image");
const { uploadImage, createBucket } = require("../controllers/UtilsController");
const catchMiddleware = require("../middlewares/api");
var router = express.Router();

router.post("/createBucket", catchMiddleware(createBucket));
router.post(
  "/uploadImageOnBucket",
  uploadMiddleWare,
  catchMiddleware(uploadImage)
);
module.exports = router;
