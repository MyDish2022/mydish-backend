var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var AdminSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    address: { type: String, required: false },
    postalCode: { type: Number, required: false },
    country: { type: String, required: false },
    email: { type: String, required: true },
    password: { type: String, required: true },
    telephone: { type: Number, required: true },
    isConfirmed: { type: Boolean, required: false, default: true },
    confirmOTP: { type: String, required: false },
    otpTries: { type: Number, required: false, default: 0 },
    status: { type: Boolean, required: false, default: 1 },
  },
  { timestamps: true }
);

// Virtual for user's full name
AdminSchema.virtual("fullName").get(function () {
  return this.firstName + " " + this.lastName;
});

module.exports = mongoose.model("Admin", AdminSchema, "Admin");
