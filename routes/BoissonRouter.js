var express = require("express");
const catchMiddleware = require("../middlewares/api");
var router = express.Router();
const {
  addBoisson,
  removeBoisson,
  updateBoisson,
  getAllBoissons,
} = require("../controllers/BoissonController");
const { authorize, AUTH_ROLES } = require("../middlewares/auth");
const { ADMIN } = AUTH_ROLES;
router.post("/addBoisson", authorize(ADMIN), catchMiddleware(addBoisson));
router.delete(
  "/removeBoisson/:boissonId",
  authorize(ADMIN),
  catchMiddleware(removeBoisson)
);
router.put(
  "/updateBoisson/:boissonId",
  authorize(ADMIN),
  catchMiddleware(updateBoisson)
);
router.get(
  "/getAllBoissons",
  authorize(ADMIN),
  catchMiddleware(getAllBoissons)
);
module.exports = router;
