var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var NotifSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    restaurantId: { type: Schema.ObjectId, ref: "Restaurant", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notif", NotifSchema, "Notif");
