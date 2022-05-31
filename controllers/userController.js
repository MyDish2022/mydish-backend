const UserService = require("../services/UserService");
const StripeService = require("../services/StripeService");
const { success, error } = require("../middlewares/response");
const profile = (req, res, next) => {
  req.user.creditCardInfos.map((cardItem) => {
    delete cardItem.CCV;
  });
  res.status(200).json(success("PROFILE", req.user, res.statusCode));
};
const verifyEmail = (req, res, next) => {
  new UserService()
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
const verifyPassword = (req, res, next) => {
  new UserService()
    .verifyPassword(req.body, req.user)
    .then((info) =>
      res.status(200).json(success("VERIFY_PASSWORD", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const registerUser = (req, res, next) => {
  new UserService()
    .Register(req.body)
    .then((info) =>
      res.status(200).json(success("REGISTER_USER", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const addMyRestaurant = (req, res, next) => {
  new UserService()
    .addMyRestaurant(req.body, req.user)
    .then((info) =>
      res.status(200).json(success("ADD_MY_RESTAURANT", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const changePassword = (req, res, next) => {
  new UserService()
    .changePassword(req.body, req.user)
    .then((info) =>
      res.status(200).json(success("CHANGE_PASSWORD", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const changePasswordByEmail = (req, res, next) => {
  new UserService()
    .changePasswordByEmail(req.body)
    .then((info) =>
      res
        .status(200)
        .json(success("CHANGE_PASSWORD_EMAIL", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const paymentStripe = (req, res, next) => {
  new StripeService()
    .paymentStripe(req.body)
    .then((info) =>
      res.status(200).json(success("PAYMENT", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const paymentSuccess = (req, res, next) => {
  res.json({ response: "success" });
};
const paymentError = (req, res, next) => {
  res.json({ response: "error" });
};
const changePhoneNumber = (req, res, next) => {
  new UserService()
    .changeTelephone(req.body, req.user)
    .then((info) =>
      res.status(200).json(success("CHANGE_PHONE_NUMBER", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const updateInfo = (req, res, next) => {
  new UserService()
    .updateInformation(req.body, req.user)
    .then((info) =>
      res.status(200).json(success("UPDATE_INFO", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const addCreditCard = (req, res, next) => {
  new UserService()
    .creditCardAdd(req.body, req.user)
    .then((info) =>
      res.status(200).json(success("ADD_CREDIT_CARD", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const removeCreditCard = (req, res, next) => {
  new UserService()
    .creditCardRemove(req.params.cardId, req.user)
    .then((info) =>
      res.status(200).json(success("REMOVE_CREDIT_CARD", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const unbookmark = (req, res, next) => {
  new UserService()
    .unbookmark(req.params, req.user)
    .then((info) =>
      res.status(200).json(success("UNBOOKMARK", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const bookmark = (req, res, next) => {
  new UserService()
    .bookmark(req.params, req.user)
    .then((info) =>
      res.status(200).json(success("BOOKMARK", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const unbookmarkPlat = (req, res, next) => {
  new UserService()
    .unbookmarkPlat(req.params, req.user)
    .then((info) =>
      res.status(200).json(success("UNBOOKMARK_PLAT", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const unbookmarkAllPlat = (req, res, next) => {
  new UserService()
    .unbookmarkAllPlat(req.user)
    .then((info) =>
      res.status(200).json(success("UNBOOKMARK_ALL_PLAT", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const unbookmarkAllRestaurants = (req, res, next) => {
  new UserService()
    .unbookmarkAllRestaurants(req.user)
    .then((info) =>
      res
        .status(200)
        .json(success("UNBOOKMARK_ALL_RESTAURANTS", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const bookmarkPlat = (req, res, next) => {
  new UserService()
    .bookmarkPlat(req.params, req.user)
    .then((info) =>
      res.status(200).json(success("BOOKMARK_PLAT", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const getCreditCard = (req, res, next) => {
  new UserService()
    .creditCardAll(req.user)
    .then((info) =>
      res.status(200).json(success("GET_CREDIT_CARD", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const getMyRates = (req, res, next) => {
  new UserService()
    .getUserRates(req.user)
    .then((info) =>
      res.status(200).json(success("GET_MY_RATES", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const confirmSms = (req, res, next) => {
  new UserService()
    .confirmSms(req.body)
    .then((info) =>
      res.status(200).json(success("CONFIRM_SMS", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const forgetPasswordSms = (req, res, next) => {
  new UserService()
    .forgetPasswordSms(req.query)
    .then((info) =>
      res.status(200).json(success("FORGET_PASSWORD_SMS", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const forgetPassword = (req, res, next) => {
  new UserService()
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
const getNearByRestaurants = (req, res, next) => {
  new UserService()
    .getNearByRestaurants(req.user, req.query)
    .then((info) =>
      res
        .status(info.status || 200)
        .json(success("NEARBY_RESTAURANTS", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const contactMydish = (req, res, next) => {
  res.status(200).json("21121");
};
module.exports = {
  profile,
  forgetPasswordSms,
  forgetPassword,
  confirmSms,
  registerUser,
  changePassword,
  paymentStripe,
  paymentSuccess,
  paymentError,
  changePhoneNumber,
  updateInfo,
  addCreditCard,
  removeCreditCard,
  getCreditCard,
  getMyRates,
  changePasswordByEmail,
  unbookmark,
  bookmark,
  verifyEmail,
  bookmarkPlat,
  unbookmarkPlat,
  unbookmarkAllPlat,
  unbookmarkAllRestaurants,
  getNearByRestaurants,
  addMyRestaurant,
  verifyPassword,
  contactMydish,
};
