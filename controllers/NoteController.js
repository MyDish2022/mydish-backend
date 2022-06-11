const NoteService = require("../services/NoteService");
const { success, error } = require("../middlewares/response");
const addNoteToService = (req, res, next) => {
  new NoteService()
    .addNoteToService(req.body)
    .then((info) =>
      res.status(200).json(success("NOTE_CREATE", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const getNoteByServiceId = (req, res, next) => {
  new NoteService()
    .getNoteByServiceId(req.params)
    .then((info) =>
      res.status(200).json(success("NOTE_SERVICE", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const getAllNotes = (req, res, next) => {
  new NoteService()
    .getAllNotes()
    .then((info) =>
      res.status(200).json(success("NOTE_SERVICE", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const deleteNoteById = (req, res, next) => {
  new NoteService()
    .deleteNoteById(req.body)
    .then((info) =>
      res.status(200).json(success("REMOVE_NOTE", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
module.exports = {
  addNoteToService,
  getNoteByServiceId,
  deleteNoteById,
  getAllNotes,
};
