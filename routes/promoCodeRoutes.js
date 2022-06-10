var express = require("express");
var router = express.Router();
const { authorize, AUTH_ROLES } = require("../middlewares/auth");
const { USER, RESTAURANT } = AUTH_ROLES;
const catchMiddleware = require("../middlewares/api");
const {
  getAllPromoCodes,
  updatePromoCode,
  addPromoCode,
  archivedPromoCode,
  checkPromoCode,
  assignUserToPromoCode,
  getMyPromoCodes,
  allRestaurantPromoCodes,
} = require("../controllers/PromoCodeController");

router.get("/allPromoCodes", catchMiddleware(getAllPromoCodes));
router.get(
  "/allRestaurantPromoCodes",
  authorize(RESTAURANT),
  catchMiddleware(allRestaurantPromoCodes)
);
router.get(
  "/getMyPromoCodes",
  authorize(USER),
  catchMiddleware(getMyPromoCodes)
);
router.patch(
  "/updateInfoPromocode/:promoCodeId",
  authorize(RESTAURANT),
  catchMiddleware(updatePromoCode)
);
router.post(
  "/addPromocode",
  authorize(RESTAURANT),
  catchMiddleware(addPromoCode)
);
router.delete(
  "/archivedPromoCode/:promocodeId",
  catchMiddleware(archivedPromoCode)
);
router.get("/checkPromoCode", catchMiddleware(checkPromoCode));
router.post(
  "/assignUserToPromoCode/:promoCodeId",
  catchMiddleware(assignUserToPromoCode)
);
module.exports = router;
