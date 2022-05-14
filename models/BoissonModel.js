var mongoose = require("mongoose");

var Schema = mongoose.Schema;
const bottleType = {
  verre: "verre",
  bouteille: "bouteille",
};
var BoissonSchema = new mongoose.Schema(
  {
    bottleType: {
      type: String,
      enum: [bottleType.verre, bottleType.bouteille],
      required: false,
    },
    description: { type: String, required: true },
    name: { type: String, required: false },
    price: { type: Number, required: false },
    imageUrl: { type: String, required: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Boisson", BoissonSchema, "Boisson");
