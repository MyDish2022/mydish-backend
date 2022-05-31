var express = require("express");
const catchMiddleware = require("../middlewares/api");
var router = express.Router();
const {
  addPlat,
  removePlat,
  updatePlat,
  getAllPlats,
  addPlatRestaurant,
  getAllPlatsByRestaurant,
} = require("../controllers/PlatController");
const { authorize, AUTH_ROLES } = require("../middlewares/auth");
const { ADMIN, USER, RESTAURANT } = AUTH_ROLES;
router.post("/addPlat", authorize(ADMIN), catchMiddleware(addPlat));
router.post(
  "/addPlatRestaurant",
  authorize(RESTAURANT),
  catchMiddleware(addPlatRestaurant)
);
router.delete(
  "/removePlat/:platId",
  authorize(ADMIN),
  catchMiddleware(removePlat)
);
router.put(
  "/updatePlat/:platId",
  authorize(ADMIN),
  catchMiddleware(updatePlat)
);
router.get("/getAllPlats", catchMiddleware(getAllPlats));
router.get(
  "/getAllPlatsByRestaurant/:restaurantId",
  catchMiddleware(getAllPlatsByRestaurant)
);
module.exports = router;
