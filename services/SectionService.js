const SectionModel = require("../models/SectionModel");
const {
  AuthorizationError,
  NotFoundError,
  LimitEssay,
  AlreadyExistError,
  InternalError,
} = require("../errors/appError");
class SectionService {
  constructor() {}
  async sectionAdd(body) {
    const { name } = body;
    try {
      const checkIfSectionExist = await SectionModel.findOne({ name }).lean();
      if (checkIfSectionExist)
        throw new AlreadyExistError("Section already exist!");
      const registeredSection = new SectionModel(body);
      await registeredSection.save();
      return { section: registeredSection };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async sectionEdit({ oldS, newS }) {
    console.log(oldS, newS);
    try {
      const checkIfSectionExist = await SectionModel.findOne({
        name: oldS,
      }).lean();
      if (!checkIfSectionExist)
        throw new NotFoundError("Section does not exist!");
      const checkIfSameName = await SectionModel.findOne({ name: newS }).lean();
      if (checkIfSameName && checkIfSectionExist.name != newS)
        throw new AlreadyExistError("Section already exist!");
      await SectionModel.findOneAndUpdate(
        { name: oldS },
        { name: newS }
      ).lean();
      const newSection = await SectionModel.findOne({ name: newS }).lean();
      return newSection;
    } catch (error) {
      throw error;
    }
  }
  async removeSection({ sectionId }) {
    try {
      let section = await SectionModel.findOne({ _id: sectionId }).lean();
      if (!section) throw new NotFoundError();
      await SectionModel.findByIdAndRemove({ _id: sectionId }).lean();
      return { info: "Section removed" };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getAllSections() {
    try {
      const sections = await SectionModel.find({}).lean();
      return sections;
    } catch (error) {
      throw error;
    }
  }
}
module.exports = SectionService;
