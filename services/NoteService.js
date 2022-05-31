const NoteModel = require("../models/NoteModel");
const {
  AuthorizationError,
  NotFoundError,
  LimitEssay,
  AlreadyExistError,
  InternalError,
} = require("../errors/appError");
class NoteService {
  constructor() {}
  async addNoteToService(body) {
    try {
      const registeredNote = new NoteModel(body);

      const note = await registeredNote.save();
      return note;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getNoteByServiceId({ serviceId }) {
    try {
      const notes = await NoteModel.find({
        $or: [{ allServices: true }, { service: { $in: [serviceId] } }],
      }).lean();
      if (!notes) throw new NotFoundError();
      return notes;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getAllNotes() {
    try {
      const notes = await NoteModel.find({}).lean();
      if (!notes) throw new NotFoundError();
      return notes;
    } catch (error) {
      throw error;
    }
  }
  async deleteNoteById({ noteId }) {
    try {
      const fetchNote = await NoteModel.findOne({ _id: noteId }).lean();
      if (!fetchNote) throw new NotFoundError("Note id does not exist !!!");
      await NoteModel.findByIdAndDelete(noteId);
      return "note deleted successfully!";
    } catch (err) {
      throw err;
    }
  }
}
module.exports = NoteService;
