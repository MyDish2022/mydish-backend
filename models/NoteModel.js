var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var NoteSchema = new Schema(
  {
    title: { type: String, required: true },
    isImportant: { type: Boolean, required: true },
    details: { type: String, required: true },
    service: [{ type: Schema.ObjectId, ref: "Service", required: true }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Note", NoteSchema, "Note");
