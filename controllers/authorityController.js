const AuthService = require("../services/AuthService");
const { success, error } = require("../middlewares/response");
const loginUser = (req, res, next) => {
  new AuthService()
    .LoginUser(req.body)
    .then((info) =>
      res.status(200).json(success("LOGIN_USER", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const loginAdmin = (req, res, next) => {
  new AuthService()
    .loginAdmin(req.body)
    .then((info) =>
      res.status(200).json(success("LOGIN_ADMIN", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const loginRestaurant = (req, res, next) => {
  new AuthService()
    .loginRestaurant(req.body)
    .then((info) =>
      res.status(200).json(success("LOGIN_RESTAURANT", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const loginWithFacebook = (req, res, next) => {
  new AuthService()
    .loginWithFacebook(req.body)
    .then((info) =>
      res.status(200).json(success("LOGIN_FACEBOOK", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const loginWithGoogle = (req, res, next) => {
  new AuthService()
    .loginWithGoogle(req.body)
    .then((info) =>
      res.status(200).json(success("LOGIN_GMAIL", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
module.exports = {
  loginUser,
  loginAdmin,
  loginRestaurant,
  loginWithFacebook,
  loginWithGoogle,
};
