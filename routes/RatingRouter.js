var express = require("express");
const { auth } = require("../middlewares/checkToken");
//const { authorize, AUTH_ROLES } = require('../middlewares/auth')
const catchMiddleware = require("../middlewares/api");

const { add } = require("../controllers/RatingController");
const { update } = require("../controllers/RatingController");
const { getRatingList } = require("../controllers/RatingController");
const {
  deleteRating,
  getRatingInfos,
  getRestaurantRatings,
  removeRatings,
} = require("../controllers/RatingController");
const { authorize, AUTH_ROLES } = require("../middlewares/auth");
const { USER, ADMIN, RESTAURANT } = AUTH_ROLES;

var router = express.Router();

router.post("/add", authorize(USER), catchMiddleware(add));
router.put("/update/:ratingId", catchMiddleware(update));
router.get(
  "/getRatingList",
  authorize(USER, ADMIN),
  catchMiddleware(getRatingList)
);
router.get(
  "/getRatingInfos/:ratingId",
  authorize(USER, ADMIN),
  catchMiddleware(getRatingInfos)
);
router.delete("/delete/:RatingId", catchMiddleware(deleteRating));
router.delete(
  "/removeRatings",
  authorize(RESTAURANT),
  catchMiddleware(removeRatings)
);
router.get(
  "/getRestaurantRatings",
  authorize(RESTAURANT),
  catchMiddleware(getRestaurantRatings)
);
module.exports = router;
