const ServiceService = require("../services/ServiceService");
const { success, error } = require("../middlewares/response");
const getAllServices = (req, res, next) => {
  new ServiceService()
    .getAllServices(req.query)
    .then((info) =>
      res.status(200).json(success("SERVICES_LIST", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const removeService = (req, res, next) => {
  new ServiceService()
    .removeService(req.params)
    .then((info) =>
      res.status(200).json(success("REMOVE_SERVICE", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const addService = (req, res, next) => {
  new ServiceService()
    .addService(req.body)
    .then((info) =>
      res.status(200).json(success("SERVICE_CREATE", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const updateService = (req, res, next) => {
  new ServiceService()
    .updateService(req.body, req.params)
    .then((info) =>
      res.status(200).json(success("UPDATE_SERVICE", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const changeServiceDisponibility = (req, res, next) => {
  new ServiceService()
    .changeServiceDisponibility(req.params, req.body)
    .then((info) =>
      res
        .status(info.status || 200)
        .json(success("CHANGE_SERVICE_DISPO", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const manageSchedule = (req, res, next) => {
  new ServiceService()
    .manageSchedule(req.params, req.body)
    .then((info) =>
      res
        .status(info.status || 200)
        .json(success("CHANGE_SCHEDULE", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const addFermeture = (req, res, next) => {
  new ServiceService()
    .addFermeture(req.body)
    .then((info) =>
      res
        .status(info.status || 200)
        .json(success("CHANGE_SCHEDULE", info, res.statusCode))
    )
    .catch((err) => console.log(err));
};
module.exports = {
  addService,
  removeService,
  updateService,
  getAllServices,
  changeServiceDisponibility,
  manageSchedule,
  addFermeture,
};
