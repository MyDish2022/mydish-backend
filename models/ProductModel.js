var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: false },
    restaurantId: {
      type: Schema.ObjectId,
      ref: "Restaurant",
      required: false,
    },
    description: { type: String, required: false },
    ingredients: [{ type: String, required: false }],
    diatetic: { type: String, required: false },
    discount: { type: Number, required: false },
    price: { type: Number, required: false },
    imageUrl: { type: String, required: false },
    calories: { type: Number, required: false },
    category: { type: String, required: false },
    type: { type: String, required: false, default: "en cours" },
    orders: { type: Number, required: false },
    globalRating: { type: Number, required: false, default: 5 },
    ratings: [
      {
        type: Schema.ObjectId,
        ref: "Rating",
        required: false,
      },
    ],
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

module.exports = mongoose.model("Product", ProductSchema, "Product");
