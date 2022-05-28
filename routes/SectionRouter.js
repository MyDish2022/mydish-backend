var express = require("express");
const catchMiddleware = require("../middlewares/api");
var router = express.Router();
const {
  sectionAdd,
  sectionEdit,
  getAllSections,
  removeSection,
} = require("../controllers/SectionController");
const { authorize, AUTH_ROLES } = require("../middlewares/auth");
const { ADMIN, RESTAURANT } = AUTH_ROLES;
router.post("/sectionAdd", catchMiddleware(sectionAdd));
router.put(
  "/updateSection",
  authorize(RESTAURANT),
  catchMiddleware(sectionEdit)
);
router.delete(
  "/removeSection/:sectionId",
  authorize(ADMIN),
  catchMiddleware(removeSection)
);
router.get("/", authorize(RESTAURANT), catchMiddleware(getAllSections));
module.exports = router;
