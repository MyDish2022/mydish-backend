const PromotionModel = require("../models/PromotionModel");
const {
  AuthorizationError,
  NotFoundError,
  LimitEssay,
  AlreadyExistError,
  InternalError,
} = require("../errors/appError");
class PromotionService {
  constructor() {}
  async addPromotion(body) {
    try {
      const registeredPromotion = new PromotionModel(body);
      await registeredPromotion.save();
      return { promotion: registeredPromotion };
    } catch (error) {
      throw error;
    }
  }
  async getAllPromotions() {
    try {
      const promotions = await PromotionModel.find({}).lean();
      return promotions;
    } catch (error) {
      throw error;
    }
  }
  async removePromotion({ promotionId }) {
    try {
      let service = await PromotionModel.findOne({ _id: promotionId }).lean();
      if (!service) throw new NotFoundError();
      await PromotionModel.findByIdAndRemove({ _id: promotionId }).lean();
      return { info: "Promotion removed" };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async updatePromotion(body, { promotionId }) {
    try {
      await PromotionModel.findOneAndUpdate(
        { _id: promotionId },
        {
          $set: body,
        },
        { returnOriginal: false }
      ).lean();
      const newService = await PromotionModel.findById(promotionId).lean();
      return newService;
    } catch (error) {
      throw error;
    }
  }
}
module.exports = PromotionService;
