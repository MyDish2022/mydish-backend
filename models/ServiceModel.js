var mongoose = require("mongoose");

var Schema = mongoose.Schema;
const DayOfWeek = {
  LUNDI: "LUNDI",
  MARDI: "MARDI",
  MERCREDI: "MERCREDI",
  JEUDI: "JEUDI",
  VENDREDI: "VENDREDI",
  SAMEDI: "SAMEDI",
  DIMANCHE: "DIMANCHE",
};
var ServiceSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true },
    couverts: { type: Number, required: true },
    mealDuration: { type: Number, required: false },
    availablity: {
      startDate: { type: Date, required: false, default: null },
      endDate: { type: Date, required: false, default: null },
    },
    isAlwaysAvailable: { type: Boolean, required: false },
    serviceDuration: {
      start: { type: String, required: false },
      end: { type: String, required: false },
    },
    lastReservationHour: { type: String, required: false },
    serviceSpecifity: [
      {
        week: {
          type: String,
          enum: [
            DayOfWeek.LUNDI,
            DayOfWeek.MARDI,
            DayOfWeek.MERCREDI,
            DayOfWeek.JEUDI,
            DayOfWeek.VENDREDI,
            DayOfWeek.SAMEDI,
            DayOfWeek.DIMANCHE,
          ],
        },
        openingTime: { type: String, required: false },
        couverts: { type: Number, required: false },
      },
    ],
    fermeture: {
      start: { type: String, required: false },
      end: { type: String, required: false },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", ServiceSchema, "Service");
