var mongoose = require("mongoose");

var Schema = mongoose.Schema;
const platType = {
  entree: "entrée",
  desert: "desert",
};
var PlatSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    options: [
      {
        name: { type: String, required: false },
        price: { type: Number, required: false },
      },
    ],
    type: {
      type: String,
      required: false,
    },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    restaurantId: {
      type: Schema.ObjectId,
      ref: "Restaurant",
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Plat", PlatSchema, "Plat");
