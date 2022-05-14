const BoissonModel = require("../models/BoissonModel");
const {
  AuthorizationError,
  NotFoundError,
  LimitEssay,
  AlreadyExistError,
  InternalError,
} = require("../errors/appError");
class BoissonService {
  constructor() {}
  async addBoisson(body) {
    const { name } = body;
    try {
      const checkIfBoissonExist = await BoissonModel.findOne({ name }).lean();
      if (checkIfBoissonExist)
        throw new AlreadyExistError("Boisson already exist!");
      const registeredBoisson = new BoissonModel(body);
      await registeredBoisson.save();
      return { boisson: registeredBoisson };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getAllBoissons() {
    try {
      const boissons = await BoissonModel.find({}).lean();
      return boissons;
    } catch (error) {
      throw error;
    }
  }
  async removeBoisson({ boissonId }) {
    try {
      let boisson = await BoissonModel.findOne({ _id: boissonId }).lean();
      if (!boisson) throw new NotFoundError();
      await BoissonModel.findByIdAndRemove({ _id: boissonId }).lean();
      return { info: "boisson removed" };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async updateBoisson(body, { boissonId }) {
    try {
      await BoissonModel.findOneAndUpdate(
        { _id: boissonId },
        {
          $set: body,
        },
        { returnOriginal: false }
      ).lean();
      const newboisson = await BoissonModel.findById(boissonId).lean();
      return newboisson;
    } catch (error) {
      throw error;
    }
  }
}
module.exports = BoissonService;
