const NoteModel = require("../models/NoteModel");
const {
  AuthorizationError,
  NotFoundError,
  LimitEssay,
  AlreadyExistError,
  InternalError,
} = require("../errors/appError");
class NoteService {
  constructor() { }
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
  async deleteNoteById({ notesId, servicesId }) {
    console.log(notesId, servicesId)
    try {
      const fetchNote = await NoteModel.findOne({ _id: notesId }).lean();
      if (!fetchNote) throw new NotFoundError("Note id does not exist !!!");
      await NoteModel.updateOne({ _id: notesId }, { $pull: { service: servicesId } }).lean();
      return "note deleted successfully!";
    } catch (err) {
      throw err;
    }
  }
  async modifyNotesInfos({ noteId }, body) {
    try {
      let objNote = {};
      if (body.title) {
        objNote = { ...objNote, title: body.title };
      }
      if (body.details) {
        objNote = { ...objNote, details: body.details };
      }
      if (body.isImportant) {
        objNote = { ...objNote, isImportant: body.isImportant };
      }
      const updatedNote = await NoteModel.findOneAndUpdate({ _id: noteId }, objNote, { returnOriginal: false }).lean();
      console.log(updatedNote)
      return updatedNote;
    } catch (err) {
      throw err;
    }
  }
}
module.exports = NoteService;
