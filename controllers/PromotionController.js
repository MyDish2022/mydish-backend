const PromotionService = require("../services/PromotionService");
const { success, error } = require("../middlewares/response");
const getAllPromotions = (req, res, next) => {
  new PromotionService()
    .getAllPromotions()
    .then((info) =>
      res.status(200).json(success("PROMOTIONS_LIST", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const removePromotion = (req, res, next) => {
  new PromotionService()
    .removePromotion(req.params)
    .then((info) =>
      res.status(200).json(success("REMOVE_PROMOTION", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const addPromotion = (req, res, next) => {
  new PromotionService()
    .addPromotion(req.body)
    .then((info) =>
      res.status(200).json(success("PROMOTION_CREATE", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const updatePromotion = (req, res, next) => {
  new PromotionService()
    .updatePromotion(req.body, req.params)
    .then((info) =>
      res.status(200).json(success("UPDATE_PROMOTION", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};

module.exports = {
  addPromotion,
  removePromotion,
  updatePromotion,
  getAllPromotions,
};
