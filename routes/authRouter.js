var express = require("express");
const {
  loginUser,
  loginAdmin,
  loginRestaurant,
  loginWithFacebook,
  loginWithGoogle,
} = require("../controllers/authorityController");
const catchMiddleware = require("../middlewares/api");
var router = express.Router();
router.post("/login", catchMiddleware(loginUser));
router.post("/loginAdmin", catchMiddleware(loginAdmin));
router.post("/loginRestaurant", catchMiddleware(loginRestaurant));
router.post("/loginWithFacebook", catchMiddleware(loginWithFacebook));
router.post("/loginWithGoogle", catchMiddleware(loginWithGoogle));
module.exports = router;
