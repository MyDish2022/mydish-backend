var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var InvoiceSchema = new mongoose.Schema(
  {
    client: { type: Schema.ObjectId, ref: "User", required: true },
    restaurant: { type: Schema.ObjectId, ref: "Restaurant", required: false },
    amount: { type: Number, required: true },
    status: { type: String, required: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", InvoiceSchema, "Invoice");
