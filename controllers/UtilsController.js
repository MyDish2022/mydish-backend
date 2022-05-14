const UtilsService = require("../services/UtilsService");
const createBucket = (req, res, next) => {
  new UtilsService()
    .createBucket()
    .then((info) =>
      res.status(200).json(success("CREATE_AWS_BUCKET", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const uploadImage = (req, res, next) => {
  //uploadImageToAwsBucket(req.file(multer),'image name','folder in bucket')
  new UtilsService()
    .uploadImageToAwsBucket(req.file, "6172188b352c8e51bfb310fd", "Restaurant")
    .then((info) =>
      res.status(200).json(success("UPDATE_IMAGE_ON_AWS", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
module.exports = {
  createBucket,
  uploadImage,
};
