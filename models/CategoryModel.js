var mongoose = require("mongoose");

var Schema = mongoose.Schema;
var CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    isBest: { boolean: false, required: true },
    restaurants: [{ type: Schema.ObjectId, required: false }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", CategorySchema, "Category");
