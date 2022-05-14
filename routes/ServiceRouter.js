var express = require("express");
const catchMiddleware = require("../middlewares/api");
var router = express.Router();
const {
  addService,
  removeService,
  updateService,
  getAllServices,
  changeServiceDisponibility,
  manageSchedule,
  addFermeture,
} = require("../controllers/serviceController");
const { authorize, AUTH_ROLES } = require("../middlewares/auth");
const { ADMIN, RESTAURANT } = AUTH_ROLES;
router.post(
  "/addService",
  authorize(ADMIN, RESTAURANT),
  catchMiddleware(addService)
);
router.delete(
  "/removeService/:serviceId",
  authorize(ADMIN),
  catchMiddleware(removeService)
);
router.put(
  "/updateService/:serviceId",
  authorize(ADMIN),
  catchMiddleware(updateService)
);
router.get(
  "/getAllServices",
  authorize(ADMIN, RESTAURANT),
  catchMiddleware(getAllServices)
);
router.put(
  "/manageSchedule/:serviceId",
  authorize(ADMIN),
  catchMiddleware(manageSchedule)
);
router.put(
  "/changeServiceDisponibility/:serviceId",
  authorize(ADMIN),
  catchMiddleware(changeServiceDisponibility)
);
router.put(
  "/addFermeture",
  authorize(RESTAURANT),
  catchMiddleware(addFermeture)
);
module.exports = router;
