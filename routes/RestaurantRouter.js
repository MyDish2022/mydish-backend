var express = require("express");
const { auth } = require("../middlewares/checkToken");
//const { authorize, AUTH_ROLES } = require('../middlewares/auth')
const catchMiddleware = require("../middlewares/api");
const upload = require("../middlewares/multer");
const { add } = require("../controllers/RestaurantController");
const {
  getRestaurantList,
  getRestaurantListByType,
} = require("../controllers/RestaurantController");

const {
  getRestaurantListWithPagination,
} = require("../controllers/RestaurantController");
const { update } = require("../controllers/RestaurantController");
const { authorize, AUTH_ROLES } = require("../middlewares/auth");
const { USER, ADMIN, RESTAURANT } = AUTH_ROLES;
const {
  restaurantByCategories,
  restaurantSearch,
  restaurantInHomePage,
  updateCordinates,
  updateRestaurantPresentation,
  restaurantSpecialities,
  restaurantNews,
  updateRestaurantBill,
  passAbonnement,
  passNotif,
  GetRestaurantNotifs,
  changePassword,
  profile,
  restaurantDetails,
  resetPassword,
  myRestaurantDetails,
  uploadImage,
  restaurantPaymentMethods
} = require("../controllers/RestaurantController");

var router = express.Router();
router.get("/profile", authorize(RESTAURANT), catchMiddleware(profile));
router.post("/add", authorize(ADMIN), catchMiddleware(add));
router.get("/getRestaurantList", catchMiddleware(getRestaurantList));
router.get("/restaurantList", catchMiddleware(restaurantByCategories));
router.get(
  "/restaurantDetails/:restaurantId",
  authorize(USER),
  catchMiddleware(restaurantDetails)
);
router.put(
  "/changePassword",
  authorize(RESTAURANT),
  catchMiddleware(changePassword)
);
router.get(
  "/getRestaurantListByType/:type",
  authorize(USER),
  catchMiddleware(getRestaurantListByType)
);
router.get("/list", catchMiddleware(getRestaurantListWithPagination));
router.put("/update", authorize(RESTAURANT), catchMiddleware(update));
router.put(
  "/updateCordinates",
  authorize(RESTAURANT),
  catchMiddleware(updateCordinates)
);
router.put(
  "/updateRestaurantPresentation",
  authorize(RESTAURANT),
  catchMiddleware(updateRestaurantPresentation)
);
router.put(
  "/updateRestaurantBill",
  authorize(RESTAURANT),
  catchMiddleware(updateRestaurantBill)
);
router.get("/searchRestaurant", catchMiddleware(restaurantSearch));
router.get("/restaurantInHomePage", catchMiddleware(restaurantInHomePage));
router.get("/restaurantSpecialities", catchMiddleware(restaurantSpecialities));
router.get("/restaurantNews", catchMiddleware(restaurantNews));
router.put(
  "/passAbonnement",
  authorize(RESTAURANT),
  catchMiddleware(passAbonnement)
);
router.post("/passNotif", catchMiddleware(passNotif));
router.get(
  "/GetRestaurantNotifs",
  authorize(RESTAURANT),
  catchMiddleware(GetRestaurantNotifs)
);
router.get("/resetPassword/:email", catchMiddleware(resetPassword));
router.post(
  "/uploadImage",
  authorize(RESTAURANT),
  upload.single("image"),
  uploadImage
);
router.get(
  "/myRestaurantDetails",
  authorize(RESTAURANT),
  catchMiddleware(myRestaurantDetails)
);
router.get("/restaurantPaymentMethods/:restaurantId", catchMiddleware(restaurantPaymentMethods))
module.exports = router;
