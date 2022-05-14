var mongoose = require("mongoose");

var Schema = mongoose.Schema;
var SectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Section", SectionSchema, "Section");
