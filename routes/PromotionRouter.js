var express = require("express");
const { auth } = require("../middlewares/checkToken");
const catchMiddleware = require("../middlewares/api");
const {
  addPromotion,
  removePromotion,
  updatePromotion,
  getAllPromotions,
} = require("../controllers/PromotionController");
var router = express.Router();
const { authorize, AUTH_ROLES } = require("../middlewares/auth");
const { ADMIN } = AUTH_ROLES;
router.post("/addPromotion", authorize(ADMIN), catchMiddleware(addPromotion));
router.delete(
  "/removePromotion/:promotionId",
  authorize(ADMIN),
  catchMiddleware(removePromotion)
);
router.put(
  "/updatePromotion/:promotionId",
  authorize(ADMIN),
  catchMiddleware(updatePromotion)
);
router.get(
  "/getAllPromotions",
  authorize(ADMIN),
  catchMiddleware(getAllPromotions)
);
module.exports = router;
