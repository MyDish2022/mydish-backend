const PlatModel = require("../models/PlatModel");
const {
  AuthorizationError,
  NotFoundError,
  LimitEssay,
  AlreadyExistError,
  InternalError,
} = require("../errors/appError");
class PlatService {
  constructor() {}
  async addPlat(body) {
    try {
      
      const checkIfPlatExist = await PlatModel.findOne(body).lean();
      if (checkIfPlatExist) throw new AlreadyExistError("Plat already exist!");
      const registeredPlat = new PlatModel(body);
      await registeredPlat.save();
      return { Plat: registeredPlat };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async addPlatRestaurant(body, restaurant) {
    console.log(body)
    try {
      let platData = {};
      platData.name = body.nom;
      platData.price = parseInt(body.prix);
      platData.options = [
        { name: body.option, price: parseInt(body.prix_option) },
      ];
      platData.description = body.description;
      platData.restaurantId = restaurant._id;
      platData.imageUrl = body.image[0].thumbUrl;
      platData.type = body.sectionName;
      const registeredPlat = new PlatModel(platData);
      await registeredPlat.save();
      return registeredPlat;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getAllPlats({ section }) {
    let filterQuery = {};
    if (section) filterQuery = { ...filterQuery, type: section };
    try {
      const Plats = await PlatModel.find(filterQuery)
        .populate("type", "name")
        .lean();
      Plats.map((element) => {
        console.log(element);
      });

      return Plats;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getAllPlatsByRestaurant({ restaurantId }) {
    try {
      const Plats = await PlatModel.find({ restaurantId })
        .populate("type", "name")
        .lean();
      return Plats;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async removePlat({ platId }) {
    try {
      let Plat = await PlatModel.findOne({ _id: platId }).lean();
      if (!Plat) throw new NotFoundError();
      await PlatModel.findByIdAndRemove({ _id: platId }).lean();
      return { info: "Plat removed" };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async updatePlat(body, { platId }) {
    try {
      let Plat = await PlatModel.findOne({ _id: platId }).lean();
      if (!Plat) throw new NotFoundError();
      await PlatModel.findOneAndUpdate(
        { _id: platId },
        {
          $set: body,
        },
        { returnOriginal: false }
      ).lean();
      const newPlat = await PlatModel.findById(platId).lean();
      return newPlat;
    } catch (error) {
      throw error;
    }
  }
}
module.exports = PlatService;
