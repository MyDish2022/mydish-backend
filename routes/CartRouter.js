var express = require("express");
const catchMiddleware = require("../middlewares/api");
var router = express.Router();
const { authorize, AUTH_ROLES } = require("../middlewares/auth");
const { USER } = AUTH_ROLES;
const {
  getProduct,
  getProductInCart,
  addToCart,
  decrementProductInCart,
  incrementProductInCart,
  removeFromCart,
  clearMyCart,
} = require("../controllers/CartController");
router.post("/addToCart", authorize(USER), catchMiddleware(addToCart));
router.put(
  "/decrementProductInCart",
  authorize(USER),
  catchMiddleware(decrementProductInCart)
);
router.put(
  "/incrementProductInCart",
  authorize(USER),
  catchMiddleware(incrementProductInCart)
);
router.get("/product/:productId", catchMiddleware(getProduct));
router.get(
  "/getProductInCart",
  authorize(USER),
  catchMiddleware(getProductInCart)
);
router.delete(
  "/removeFromCart",
  authorize(USER),
  catchMiddleware(removeFromCart)
);
router.delete("/clearMyCart", authorize(USER), catchMiddleware(clearMyCart));
module.exports = router;
