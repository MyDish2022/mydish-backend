var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var PromotionSchema = new Schema(
  {
    percentage: {
      type: Number,
      required: true,
    },
    isAlwaysAvailable: { type: Boolean, required: false, default: false },
    availablity: {
      startDate: { type: Date, required: false },
      endDate: { type: Date, required: false },
    },
    exceptionPromo: [
      {
        start: { type: Date, required: false },
        end: { type: Date, required: false },
      },
    ],
    service: [{ type: Schema.ObjectId, ref: "Service", required: false }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Promotion", PromotionSchema, "Promotion");
