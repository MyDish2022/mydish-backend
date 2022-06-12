var mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

var Schema = mongoose.Schema;

var RestaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    owner: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
    },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    category: { type: String, required: true }, // Cantine, Particulier, Livraison, Reservation
    services: [
      {
        type: Schema.ObjectId,
        ref: "Service",
        required: false,
      },
    ], // cet attribut ne sera pas utilisé ['DELIVERY', 'RESERVATION']
    budget: { type: Number, required: false },
    type: { type: String, required: true },
    coords: { type: Object, required: false }, // wont be used
    phoneNumber: { type: String, required: false },
    prefixNumber: { type: String, required: false },
    imagesPresentations: [{ type: String, required: false }],
    location: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
    },
    login: { type: String, required: false },
    password: { type: String, required: false },
    orders: { type: Number, required: false },
    globalRating: { type: Number, required: false, default: 5 },
    ratePerService: [{ type: Object, required: false }],
    generalInfos: {
      cuisine: { type: String, required: false },
      horaires: { type: String, required: false },
    },
    access: [
      { type: String, required: false },
      { type: String, required: false },
      { type: String, required: false }
    ],
    moreInfos: {
      security: { type: String, required: false },
      paymentMethods: [{ type: String, required: false }],
      exigence: { type: String, required: false },
    },
    facturation: {
      domination: { type: String, required: false },
      representFullName: { type: String, required: false },
      billAdress: { type: String, required: false },
      adress: { type: String, required: false },
      city: { type: String, required: false },
      pays: { type: String, required: false },
      billEmail: { type: String, required: false },
      RcsNumber: { type: String, required: false },
      Tva: { type: String, required: false },
      paymentMethod: { type: String, required: false },
    },
    ratings: [
      {
        type: Schema.ObjectId,
        ref: "Rating",
        required: false,
      },
    ],
    menus: [
      {
        type: Schema.ObjectId,
        ref: "Menu",
        required: false,
      },
    ],
    menusJours: {
      type: Schema.ObjectId,
      ref: "Menu",
      required: false,
    },
    address: { type: String, required: true },
    discount: { type: Number, required: false },
    views: { type: Number, required: false, default: 1 },
    diatetic: [{ type: String, required: false }],
    specialty: [{ type: String, required: false }],
    reduction: { type: Number, required: false },
    openingHours: [{ type: String, required: false },{ type: String, required: false } ],
    unavailableForDelivery: { type: Boolean, required: false, default: true },
    avgPrice: [{ type: Number, required: false }],
    abonnement: {
      type: String,
      Enum: ["Free", "Premium", "Ultimate"],
      required: false,
    },
  },
  { timestamps: true }
);

RestaurantSchema.index({ location: "2dsphere" });
RestaurantSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Restaurant", RestaurantSchema, "Restaurant");
