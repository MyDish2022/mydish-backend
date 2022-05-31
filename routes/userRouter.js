var express = require("express");
const {
  profile,
  getUsersList,
  registerUser,
  changePassword,
  paymentStripe,
  paymentSuccess,
  paymentError,
  changePhoneNumber,
  getNearByRestaurants,
  unbookmarkAllRestaurants,
  verifyEmail,
  unbookmarkAllPlat,
  bookmarkPlat,
  unbookmarkPlat,
  forgetPassword,
  updateInfo,
  addCreditCard,
  removeCreditCard,
  bookmark,
  getCreditCard,
  getMyRates,
  confirmSms,
  forgetPasswordSms,
  changePasswordByEmail,
  addMyRestaurant,
  unbookmark,
  verifyPassword
} = require("../controllers/userController");
const { getMyRatingList } = require("../controllers/RatingController");
const catchMiddleware = require("../middlewares/api");
var router = express.Router();
const { authorize, AUTH_ROLES } = require("../middlewares/auth");
const { USER, ADMIN } = AUTH_ROLES;
router.get("/profile", authorize(USER), catchMiddleware(profile));
router.post("/confirmSms", catchMiddleware(confirmSms));
router.get("/forgetPasswordSms", catchMiddleware(forgetPasswordSms));
router.get("/verifyEmail/:email", catchMiddleware(verifyEmail));
router.post("/forgetPassword", catchMiddleware(forgetPassword));
router.post("/register", catchMiddleware(registerUser));
router.put("/changePassword", authorize(USER), catchMiddleware(changePassword));
router.put("/changePasswordByEmail", catchMiddleware(changePasswordByEmail));
router.put(
  "/changePhoneNumber",
  authorize(USER),
  catchMiddleware(changePhoneNumber)
);
router.post("/payment", catchMiddleware(paymentStripe));
router.get("/paymentSucceded", catchMiddleware(paymentSuccess));
router.get("/paymentError", catchMiddleware(paymentError));
router.put("/updateInfo", authorize(USER), catchMiddleware(updateInfo));
router.post("/addCreditCard", authorize(USER), catchMiddleware(addCreditCard));
router.delete(
  "/removeCreditCard/:cardId",
  authorize(USER),
  catchMiddleware(removeCreditCard)
);
router.delete(
  "/unbookmarkRestaurant/:restaurantId",
  authorize(USER),
  catchMiddleware(unbookmark)
);
router.post(
  "/bookmarkRestaurant/:restaurantId",
  authorize(USER),
  catchMiddleware(bookmark)
);
router.delete(
  "/unbookmarkPlat/:platId",
  authorize(USER),
  catchMiddleware(unbookmarkPlat)
);
router.delete(
  "/unbookmarkAllPlat",
  authorize(USER),
  catchMiddleware(unbookmarkAllPlat)
);
router.delete(
  "/unbookmarkAllRestaurants",
  authorize(USER),
  catchMiddleware(unbookmarkAllRestaurants)
);
router.post(
  "/bookmarkPlat/:platId",
  authorize(USER),
  catchMiddleware(bookmarkPlat)
);
router.get(
  "/getMyCreditCards",
  authorize(USER),
  catchMiddleware(getCreditCard)
);
router.get(
  "/getNearByRestaurants",
  authorize(USER),
  catchMiddleware(getNearByRestaurants)
);
router.post("/addMyRestaurant", authorize(USER), catchMiddleware(addMyRestaurant));
router.get("/getMyRates", authorize(USER), catchMiddleware(getMyRatingList));
router.post("/verifyPassword", authorize(USER), catchMiddleware(verifyPassword));
module.exports = router;
