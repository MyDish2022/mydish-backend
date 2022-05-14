var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var CartSchema = new Schema(
  {
    userSession: { type: Schema.ObjectId, ref: "User", required: true },
    description: { type: String, required: false, default: "" },
    articles: [
      {
        article: { type: Schema.ObjectId, ref: "Plat", required: false },
        numbers: { type: Number, required: false, default: 0 },
        description: { type: String, required: false },
        options: [
          {
            name: { type: String, required: false },
            price: { type: Number, required: false },
          },
        ],
      },
    ],
    boisson: [
      {
        article: { type: Schema.ObjectId, ref: "Boisson", required: false },
        numbers: { type: Number, required: false, default: 0 },
        description: { type: String, required: false },
      },
    ],
    subTotalPrice: { type: Number, required: true, default: 0 },
    deliveryCosts: { type: Number, required: true, default: 0 },
    totalPrice: { type: Number, required: false },
    promoCodeApplied: { type: Boolean, required: false, default: false },
    promoCode: { type: Schema.ObjectId, ref: "PromoCode", required: false },
    payedBy: { type: String, required: false, default: false },
    orderType: { type: String, required: false, default: "Reservation" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", CartSchema, "Cart");
