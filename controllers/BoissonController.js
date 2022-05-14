const BoissonService = require("../services/BoissonService");
const { success, error } = require("../middlewares/response");
const getAllBoissons = (req, res, next) => {
  new BoissonService()
    .getAllBoissons()
    .then((info) =>
      res.status(200).json(success("BOISSON_LIST", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const removeBoisson = (req, res, next) => {
  new BoissonService()
    .removeBoisson(req.params)
    .then((info) =>
      res.status(200).json(success("REMOVE_BOISSON", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const addBoisson = (req, res, next) => {
  new BoissonService()
    .addBoisson(req.body)
    .then((info) =>
      res.status(200).json(success("BOISSON_CREATE", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const updateBoisson = (req, res, next) => {
  new BoissonService()
    .updateBoisson(req.body, req.params)
    .then((info) =>
      res.status(200).json(success("UPDATE_BOISSON", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};

module.exports = {
  addBoisson,
  removeBoisson,
  updateBoisson,
  getAllBoissons,
};
