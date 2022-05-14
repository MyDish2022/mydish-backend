var express = require("express");
const catchMiddleware = require("../middlewares/api");
var router = express.Router();
const {
  profile,
  createAdminAccount,
  addUser,
  getUsersList,
  verifyEmail,
  changePassword,
  removeUser,
  updateInfo,
  updateUserInfos,
  forgetPassword,
} = require("../controllers/adminController");
const { authorize, AUTH_ROLES } = require("../middlewares/auth");
const { ADMIN, RESTAURANT } = AUTH_ROLES;
router.get("/profile", authorize(ADMIN), catchMiddleware(profile));
router.post(
  "/createAdminAccount",
  authorize(ADMIN),
  catchMiddleware(createAdminAccount)
);
router.post("/addUser", authorize(ADMIN, RESTAURANT), catchMiddleware(addUser));
router.get(
  "/getAllUsers",
  authorize(ADMIN, RESTAURANT),
  catchMiddleware(getUsersList)
);
router.get(
  "/verifyEmail/:email",
  authorize(ADMIN),
  catchMiddleware(verifyEmail)
);
router.put(
  "/changePassword",
  authorize(ADMIN),
  catchMiddleware(changePassword)
);
router.delete(
  "/removeUser/:userId",
  authorize(ADMIN, RESTAURANT),
  catchMiddleware(removeUser)
);
router.put("/updateInfo", authorize(ADMIN), catchMiddleware(updateInfo));
router.put(
  "/updateUserInfos/:userId",
  authorize(ADMIN),
  catchMiddleware(updateUserInfos)
);
router.post("/forgetPassword", catchMiddleware(forgetPassword));
module.exports = router;
