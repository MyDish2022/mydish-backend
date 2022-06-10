const PromoCodeService = require("../services/PromoCodeService");
const { success, error } = require("../middlewares/response");
const getAllPromoCodes = (req, res, next) => {
  new PromoCodeService()
    .getAllPromoCodes()
    .then((info) =>
      res.status(200).json(success("ALL_PROMO_CODES", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const allRestaurantPromoCodes = (req, res, next) => {
  new PromoCodeService()
    .allRestaurantPromoCodes(req.restaurant, req.query)
    .then((info) =>
      res.status(200).json(success("ALL_PROMO_CODES", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const getMyPromoCodes = (req, res, next) => {
  new PromoCodeService()
    .getMyPromoCodes(req.user)
    .then((info) =>
      res.status(200).json(success("MY_PROMO_CODES", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const addPromoCode = (req, res, next) => {
  new PromoCodeService()
    .addPromoCodes(req.body, req.restaurant)
    .then((info) =>
      res.status(200).json(success("ADD_PROMO_CODE", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const updatePromoCode = (req, res, next) => {
  new PromoCodeService()
    .updatePromoCodesInformation(
      req.body,
      req.params.promoCodeId,
      req.restaurant
    )
    .then((info) =>
      res.status(200).json(success("UPDATE_PROMO_CODE", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const archivedPromoCode = (req, res, next) => {
  new PromoCodeService()
    .archivedPromoCode(req.params.promocodeId)
    .then((info) =>
      res.status(200).json(success("UPDATE_PROMO_CODE", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const checkPromoCode = (req, res, next) => {
  new PromoCodeService()
    .checkPromoCode(req.body)
    .then((info) =>
      res.status(200).json(success("CHECK_PROMO_CODE", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const assignUserToPromoCode = (req, res, next) => {
  new PromoCodeService()
    .assignUserToPromoCode(req.body, req.params.promoCodeId)
    .then((info) =>
      res.status(200).json(success("UPDATE_PROMO_CODE", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
module.exports = {
  getAllPromoCodes,
  updatePromoCode,
  addPromoCode,
  archivedPromoCode,
  checkPromoCode,
  assignUserToPromoCode,
  getMyPromoCodes,
  allRestaurantPromoCodes,
};
