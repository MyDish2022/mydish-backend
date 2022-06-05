var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var RatingSchema = new mongoose.Schema(
  {
    target: { type: String, required: false }, // can be Product or Restaurant for the moment
    restaurant: { type: Schema.ObjectId, ref: "Restaurant", required: true },
    productId: { type: Schema.ObjectId, ref: "Product", required: false },
    globalRating: { type: Number, required: true },
    ratePerService: [{ type: Object, required: false }],
    detail: { type: String, required: true },
    comment: { type: String, required: true },
    userName: { type: String, required: false },
    user: { type: Schema.ObjectId, ref: "User", required: true },
    replies: [{ type: String, required: false }],
  },
  { timestamps: true }
);

/*const User = mongoose.model("user", UserSchema);
const restaurant = mongoose.model("Restaurant", RestaurantSchema);*/

module.exports = mongoose.model("Rating", RatingSchema, "Rating");
