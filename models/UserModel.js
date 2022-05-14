var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    address: { type: String, required: false },
    postalCode: { type: Number, required: false },
    country: { type: String, required: false },
    countryCode: { type: Number, required: false },
    email: { type: String, required: true },
    paymentId: { type: String, required: false }, // stripeId
    password: { type: String, required: true },
    telephone: { type: Number, required: false },
    passwordSalt: { type: String, required: false },
    favoriteRestaurants: [
      {
        type: Schema.ObjectId,
        ref: "Restaurant",
        required: false,
      },
    ],
    favoritePlats: [
      {
        type: Schema.ObjectId,
        ref: "Plat",
        required: false,
      },
    ],
    userRatings: [
      {
        type: Schema.Types.ObjectId,
        ref: "Rating",
        required: false,
      },
    ],
    isConfirmed: { type: Boolean, required: false, default: true },
    confirmOTP: { type: String, required: false },
    otpTries: { type: Number, required: false, default: 0 },
    status: { type: Boolean, required: false, default: 1 },
    creditCardInfos: [
      {
        cardNumber: { type: Number, required: true },
        cardExpirationDate: { type: String, required: true },
        CCV: { type: Number, required: true },
        cardCountry: { type: String, required: false },
      },
    ],
    ttlCodeIndex: { type: Number, required: false },
    customerIdInnvoice: { type: String, required: true },
  },
  { timestamps: true }
);

// Virtual for user's full name
UserSchema.virtual("fullName").get(function () {
  return this.firstName + " " + this.lastName;
});

module.exports = mongoose.model("User", UserSchema, "User");
