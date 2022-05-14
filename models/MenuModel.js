var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: false },
    disponibilite: { type: String, required: false },
    discount: { type: Number, required: false },
    price: { type: Number, required: false },
    restaurantId: {
      type: Schema.ObjectId,
      ref: "Restaurant",
      required: false,
    },
    imageUrl: { type: String, required: false },
    category: { type: String, required: false },
    type: { type: String, required: false },
    jours: [{ type: String, required: false }],
    service: { type: String, required: false },
    status: { type: String, required: false, default: "en cours" },
    plats: [
      {
        type: Schema.ObjectId,
        ref: "Plat",
        required: false,
      },
    ],
    boissons: [
      {
        type: Schema.ObjectId,
        ref: "Boisson",
        required: false,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Menu", ProductSchema, "Menu");
