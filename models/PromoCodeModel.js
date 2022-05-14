var mongoose = require("mongoose");
const promoCodeStatus = {
  archived: "archived",
  activated: "activated",
  reserved: "reserved",
};
var Schema = mongoose.Schema;

var PromoCodeSchema = new mongoose.Schema(
  {
    discountType: { type: String, required: true }, // can be 'Percentage' or 'Fixed'
    code: { type: String, required: true },
    description: { type: String, required: false },
    discountAmount: { type: Number, required: true },
    restaurant: {
      type: Schema.ObjectId,
      ref: "Restaurant",
      required: false,
    },
    valideUntil: { type: Date, required: false },
    status: {
      type: String,
      enum: Object.values(promoCodeStatus),
      default: promoCodeStatus.activated,
      required: true,
    },
    availablity: {
      startDate: { type: Date, required: false },
      endDate: { type: Date, required: false },
    },
    maxUsageUser: {
      type: Number,
      required: true,
    },
    service: [{ type: Schema.ObjectId, ref: "Service", required: false }],
    authorizedUsers: [{ type: Schema.ObjectId, ref: "User", required: false }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("PromoCode", PromoCodeSchema, "PromoCode");
