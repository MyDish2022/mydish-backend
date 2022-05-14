var express = require("express");
const { auth } = require("../middlewares/checkToken");
const catchMiddleware = require("../middlewares/api");
const {
  addMenu,
  getMenuList,
  getRestaurantMenuList,
  removeMenu,
  updateMenu,
  searchRecord,
  getMenuListByRestaurant,
} = require("../controllers/ProductController");
const { authorize, AUTH_ROLES } = require("../middlewares/auth");
const { USER, ADMIN, RESTAURANT } = AUTH_ROLES;
var router = express.Router();
router.post("/addMenu", authorize(RESTAURANT), catchMiddleware(addMenu));
router.put("/updateMenu/:menuId", catchMiddleware(updateMenu));
router.get("/getMenuList", catchMiddleware(getMenuList));
router.get(
  "/getRestaurantMenuList",
  authorize(RESTAURANT),
  catchMiddleware(getRestaurantMenuList)
);
router.get(
  "/getMenuListByRestaurant/:restaurantId",
  catchMiddleware(getMenuListByRestaurant)
);
router.delete(
  "/removeMenu/:menuId",
  authorize(ADMIN, RESTAURANT),
  catchMiddleware(removeMenu)
);
router.get("/search/:keyword", catchMiddleware(searchRecord));

module.exports = router;
