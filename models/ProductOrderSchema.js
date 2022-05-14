var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ProductOrderSchema = new mongoose.Schema(
  {
    menu: { type: Schema.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true },
    consigne: { type: String, required: false },
    sum: { type: Number, required: false },
    offer: { type: String, required: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "ProductOrder",
  ProductOrderSchema,
  "ProductOrder"
);
