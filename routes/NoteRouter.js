var express = require("express");
const catchMiddleware = require("../middlewares/api");
var router = express.Router();
const { authorize, AUTH_ROLES } = require("../middlewares/auth");
const { ADMIN, RESTAURANT } = AUTH_ROLES;
const {
  addNoteToService,
  getNoteByServiceId,
  getAllNotes,
  deleteNoteById,
  modifyNotesInfos
} = require("../controllers/NoteController");
router.post(
  "/addNoteToService",
  authorize(ADMIN, RESTAURANT),
  catchMiddleware(addNoteToService)
);
router.get(
  "/getNoteByServiceId/:serviceId",
  authorize(ADMIN, RESTAURANT),
  catchMiddleware(getNoteByServiceId)
);
router.get(
  "/getAllNotes",
  authorize(ADMIN, RESTAURANT),
  catchMiddleware(getAllNotes)
);
router.put(
  "/deleteNoteById",
  authorize(RESTAURANT),
  catchMiddleware(deleteNoteById)
);
router.put("/modifyNotesInfos/:noteId",
authorize(RESTAURANT),
catchMiddleware(modifyNotesInfos))
module.exports = router;
