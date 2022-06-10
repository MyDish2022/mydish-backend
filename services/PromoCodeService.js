const PromoCodeModel = require("../models/PromoCodeModel");
const { AuthorizationError, NotFoundError } = require("../errors/appError");
class PromoCodeService {
  constructor() {}

  async getAllPromoCodes() {
    try {
      const promoCodes = await PromoCodeModel.find({
        status: { $ne: "archived" },
      }).populate("authorizedUsers");
      return promoCodes;
    } catch (error) {
      throw error;
    }
  }
  async allRestaurantPromoCodes(restaurant, { status }) {
    let filterQuery = {
      restaurant: restaurant._id,
    };
    if (status) filterQuery = { ...filterQuery, status: { $eq: status } };
    try {
      const promoCodes = await PromoCodeModel.find(filterQuery).populate(
        "service"
      ); //.populate('authorizedUsers');
      return promoCodes;
    } catch (error) {
      throw error;
    }
  }
  async getMyPromoCodes(user) {
    try {
      const promoCodes = await PromoCodeModel.find(
        { status: { $ne: "archived" }, authorizedUsers: user._id },
        { authorizedUsers: 0 }
      )
        .populate("restaurant")
        .lean();
      //remove unauthorized user
      return promoCodes;
    } catch (error) {
      throw error;
    }
  }
  makeid() {
    var text = "";
    var possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 12; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
  }
  async addPromoCodes(body, { _id }) {
    try {
      body = { ...body, code: this.makeid() };
      const newPromoCode = new PromoCodeModel(body);
      newPromoCode.restaurant = _id;
      await newPromoCode.save();
      return { PromoCode: newPromoCode };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async updatePromoCodesInformation(body, promoCodeId, restaurant) {
    try {
      body = { ...body, code: this.makeid() };
      body = { ...body, restaurant: restaurant._id };
      console.log(body);
      console.log(promoCodeId);
      await PromoCodeModel.findOneAndUpdate({ _id: promoCodeId }, body);
      return PromoCodeModel.findById(promoCodeId);
    } catch (error) {
      throw error;
    }
  }
  async archivedPromoCode(promoCodeId) {
    try {
      const promoCode = await PromoCodeModel.findOne({
        _id: promoCodeId,
      }).lean();
      if (!promoCode) throw new NotFoundError("promo code not found!");
      await PromoCodeModel.findOneAndUpdate(
        { _id: promoCodeId },
        { status: "archived" }
      );
      const returnedPromoCodes = await PromoCodeModel.find({})
        .populate("service")
        .lean();
      return returnedPromoCodes;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async checkPromoCode({ code }) {
    try {
      let promoCode = await PromoCodeModel.findOne({ code }).lean();
      if (!promoCode) return new NotFoundError();
      else if (promoCode.status === "archived") return "code promo désactivé";
      else if (promoCode.maxUsageUser <= 0)
        return "ce code promo utilisé par plusieur utilisateurs";
      else if (new Date(promoCode.valideUntil) > new Date())
        return "code promo expiré";
      return promoCode;
    } catch (error) {
      throw error;
    }
  }
  async assignUserToPromoCode({ userId }, promoCodeId) {
    try {
      let promo = await PromoCodeModel.findOneAndUpdate(
        { _id: promoCodeId },
        {
          $addToSet: { authorizedUsers: userId },
        }
      );
      return `user ${userId} can use ${promo.code} as promoCode`;
    } catch (error) {
      throw error;
    }
  }
}
module.exports = PromoCodeService;
