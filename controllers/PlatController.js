const PlatService = require("../services/PlatService");
const { success, error } = require("../middlewares/response");
const getAllPlats = (req, res, next) => {
  new PlatService()
    .getAllPlats(req.query)
    .then((info) =>
      res.status(200).json(success("PLAT_LIST", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const getAllPlatsByRestaurant = (req, res, next) => {
  new PlatService()
    .getAllPlatsByRestaurant(req.params)
    .then((info) =>
      res
        .status(200)
        .json(success("RESTAURANT_PLAT_LIST", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const removePlat = (req, res, next) => {
  new PlatService()
    .removePlat(req.params)
    .then((info) =>
      res.status(200).json(success("REMOVE_PLAT", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const addPlat = (req, res, next) => {
  new PlatService()
    .addPlat(req.body)
    .then((info) =>
      res.status(200).json(success("PLAT_CREATE", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const addPlatRestaurant = (req, res, next) => {
  new PlatService()
    .addPlatRestaurant(req.body, req.restaurant)
    .then((info) =>
      res.status(200).json(success("PLAT_CREATE", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const updatePlat = (req, res, next) => {
  new PlatService()
    .updatePlat(req.body, req.params)
    .then((info) =>
      res.status(200).json(success("UPDATE_PLAT", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};

module.exports = {
  addPlat,
  removePlat,
  updatePlat,
  getAllPlats,
  getAllPlatsByRestaurant,
  addPlatRestaurant,
};
