const AdminService = require("../services/AdminService");
const { success, error } = require("../middlewares/response");
const profile = (req, res, next) => {
  res.status(200).json(success("PROFILE", req.admin, res.statusCode));
};
const getUsersList = (req, res, next) => {
  new AdminService()
    .getAllusers()
    .then((info) =>
      res.status(200).json(success("USER_LIST", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const removeUser = (req, res, next) => {
  new AdminService()
    .removeUser(req.params)
    .then((info) =>
      res.status(200).json(success("REMOVE_USER", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const addUser = (req, res, next) => {
  new AdminService()
    .addUser(req.body)
    .then((info) =>
      res.status(200).json(success("USER_CREATE", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const verifyEmail = (req, res, next) => {
  new AdminService()
    .verifyEmail(req.params)
    .then((info) =>
      res.status(200).json(success("VERIFY_EMAIL", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const createAdminAccount = (req, res, next) => {
  new AdminService()
    .createAdminAccount(req.body)
    .then((info) =>
      res.status(200).json(success("ADMIN_CREATE", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const changePassword = (req, res, next) => {
  new AdminService()
    .changePassword(req.body, req.admin)
    .then((info) =>
      res.status(200).json(success("CHANGE_PASSWORD", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const updateInfo = (req, res, next) => {
  new AdminService()
    .updateInformation(req.body, req.admin)
    .then((info) =>
      res.status(200).json(success("UPDATE_PROFILE", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const updateUserInfos = (req, res, next) => {
  new AdminService()
    .updateUserInfos(req.body, req.params)
    .then((info) =>
      res.status(200).json(success("UPDATE_USER", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const forgetPassword = (req, res, next) => {
  new AdminService()
    .forgetPassword(req.body)
    .then((info) =>
      res
        .status(info.status || 200)
        .json(success("FORGET_PASSWORD", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};

module.exports = {
  profile,
  createAdminAccount,
  getUsersList,
  addUser,
  verifyEmail,
  changePassword,
  removeUser,
  updateUserInfos,
  updateInfo,
  forgetPassword,
};
