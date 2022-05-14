const fs = require("fs");
const AWS = require("aws-sdk");
const BUCKET_NAME = "www.mydish.com";
const s3 = new AWS.S3({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
});
const params = {
  Bucket: BUCKET_NAME,
  CreateBucketConfiguration: {
    LocationConstraint: "us-east-2",
  },
};
class UtilsService {
  constructor() {}
  async createBucket() {
    s3.createBucket(params, function (err, data) {
      if (err) console.log(err, err.stack);
      else console.log("Bucket Created Successfully", data.Location);
    });
  }
  async uploadImageToAwsBucket(body, imageId, path) {
    try {
      const fileContent = fs.readFileSync(body.path);
      const params = {
        Bucket: BUCKET_NAME,
        Key: `${path}/${imageId}.jfif`,
        Body: fileContent,
      };
      s3.upload(params, function (err, data) {
        if (err) {
          throw err;
        }
        console.log(`File uploaded successfully. ${data.Location}`);
      });
      return "File uploaded successfully.";
    } catch (error) {
      throw error;
    }
  }
}
module.exports = UtilsService;
