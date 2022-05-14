const RatingService = require("../services/RatingService");
const { success, error } = require("../middlewares/response");
const add = (req, res, next) => {
  new RatingService()
    .Add(req.user, req.body)
    .then((info) =>
      res.status(200).json(success("RATING_ADD", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const update = (req, res, next) => {
  new RatingService()
    .updateRating(req.params, req.body)
    .then((info) =>
      res.status(200).json(success("RATING_UPDATE", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const deleteRating = (req, res, next) => {
  new RatingService()
    .deleteRating(req.params.RatingId)
    .then((info) =>
      res.status(200).json(success("RATING_DELETE", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const removeRatings = (req, res, next) => {
  new RatingService()
    .removeRatings(req.body)
    .then((info) =>
      res.status(200).json(success("RATING_DELETE", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const getRatingList = (req, res, next) => {
  new RatingService()
    .getAllRatings()
    .then((info) =>
      res.status(200).json(success("RATING_LIST", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const getRestaurantRatings = (req, res, next) => {
  new RatingService()
    .getRestaurantRatings(req)
    .then((info) =>
      res.status(200).json(success("RATING_LIST", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const getRatingInfos = (req, res, next) => {
  new RatingService()
    .getRatingInfos(req.params)
    .then((info) =>
      res.status(200).json(success("ALL_RATING_INFOS", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const getMyRatingList = (req, res, next) => {
  new RatingService()
    .getMyRatingList(req.user)
    .then((info) =>
      res.status(200).json(success("MY_RATING_LIST", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
module.exports = {
  add,
  getRatingList,
  update,
  deleteRating,
  getMyRatingList,
  getRatingInfos,
  getRestaurantRatings,
  removeRatings,
};
