var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var OrderSchema = new mongoose.Schema(
  {
    orderCreator: { type: Schema.ObjectId, ref: "User", required: false },
    orderType: { type: String, required: true, default: "RESERVATION" }, // can be 'LIVRAISON'/ 'RESERVATION'
    isProgram: { type: Boolean, required: false, default: false }, // flag to specify either the command is Normal or Program
    paymentType: { type: String, required: false }, // can be 'TICKET'/'ONLINE'/ 'INPLACE'
    restaurant: {
      type: mongoose.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    peopleNumber: { type: Number, required: false },
    totalPrice: { type: Number, required: false },
    consigne: { type: String, required: false },
    discount: { type: Number, required: false },
    discountCode: {
      type: Schema.ObjectId,
      ref: "PromoCode",
      required: false,
    },
    status: { type: String, required: false, default: "new" },
    isCancelled: { type: Boolean, required: false, default: false },
    isPaid: { type: Boolean, required: false, default: false },
    orderedForDate: { type: Date, required: false, default: new Date() },
    orderDetails: {
      type: Schema.ObjectId,
      ref: "Product",
      required: false,
    },
    deliveryAddress: { type: String, required: false },
    instruction: { type: String, required: false },
    notification: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema, "Order");
