const RestaurantService = require("../services/RestaurantService");
const { success, error } = require("../middlewares/response");
const add = (req, res, next) => {
  new RestaurantService()
    .Add(req.body)
    .then((info) =>
      res.status(200).json(success("ADD_RESTAURANT", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const update = (req, res, next) => {
  new RestaurantService()
    .updateRestaurant(req.body, req.restaurant._id)
    .then((info) =>
      res.status(200).json(success("UPDATE_RESTAURANT", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const updateRestaurantPresentation = (req, res, next) => {
  new RestaurantService()
    .updateRestaurantPresentation(req.body, req.restaurant._id)
    .then((info) =>
      res
        .status(200)
        .json(success("UPDATE_RESTAURANT_PRESENTATION", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const passNotif = (req, res, next) => {
  new RestaurantService()
    .passNotif(req.body)
    .then((info) =>
      res.status(200).json(success("NOTIF_PASS", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const updateRestaurantBill = (req, res, next) => {
  new RestaurantService()
    .updateRestaurantBill(req.body, req.restaurant._id)
    .then((info) =>
      res
        .status(200)
        .json(success("UPDATE_RESTAURANT_PRESENTATION", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const passAbonnement = (req, res, next) => {
  new RestaurantService()
    .passAbonnement(req.body, req.restaurant._id)
    .then((info) =>
      res
        .status(200)
        .json(success("PASS_ABONNEMENT_PRESENTATION", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const uploadImage = (req, res, next) => {
  new RestaurantService()
    .uploadImage(req.file, req.restaurant._id)
    .then((info) =>
      res.status(200).json(success("UPLOAD_IMAGE", info, res.statusCode))
    )
    .catch((err) => console.log(err));
};
const getPagination = (page, size) => {
  const limit = size ? +size : 3;
  const offset = page ? page * limit : 2;

  return { limit, offset };
};
const getRestaurantList = (req, res, next) => {
  new RestaurantService()
    .getAllRestaurants()
    .then((info) =>
      res.status(200).json(success("RESTAURANT_LIST", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const myRestaurantDetails = (req, res, next) => {
  new RestaurantService()
    .myRestaurantDetails(req.restaurant)
    .then((info) =>
      res.status(200).json(success("RESTAURANT_DETAILS", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const resetPassword = (req, res, next) => {
  new RestaurantService()
    .resetPassword(req.params)
    .then((info) =>
      res.status(200).json(success("RESET_PASSWORD", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const changePassword = (req, res, next) => {
  new RestaurantService()
    .changePassword(req.body, req.restaurant)
    .then((info) =>
      res.status(200).json(success("CHANGE_PASSWORD", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const profile = (req, res, next) => {
  res.status(200).json(success("PROFILE", req.restaurant, res.statusCode));
};
const restaurantSearch = (req, res, next) => {
  new RestaurantService()
    .restaurantSearch(req.query)
    .then((info) =>
      res.status(200).json(success("RESTAURANT_SEARCH", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const getRestaurantListByType = (req, res, next) => {
  new RestaurantService()
    .getRestaurantListByType(req.user, req.params, req.query)
    .then((info) =>
      res.status(200).json(success("RESTAURANT_BY_TYPE", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const getRestaurantListWithPagination = (req, res, next) => {
  const { page, size } = req.query;
  const { limit, offset } = getPagination(page, size);
  new RestaurantService()
    .getRestaurantWithPagination(limit, offset)
    .then((info) =>
      res.status(200).json(success("RESTAURANT_LIST", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const restaurantInHomePage = (req, res, next) => {
  new RestaurantService()
    .getRestaurantsInHomePage(req.query)
    .then((info) =>
      res
        .status(200)
        .json(success("RESTAURANT_HOME_PAGE", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const restaurantNews = (req, res, next) => {
  new RestaurantService()
    .getRestaurantNews()
    .then((info) =>
      res
        .status(200)
        .json(success("RESTAURANT_HOME_PAGE", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const restaurantSpecialities = (req, res, next) => {
  new RestaurantService()
    .getRestaurantSpecialities()
    .then((info) =>
      res
        .status(200)
        .json(success("SPECIALITIES_RESTAURANT", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const restaurantDetails = (req, res, next) => {
  new RestaurantService()
    .restaurantDetails(req.user, req.params)
    .then((info) =>
      res.status(200).json(success("RESTAURANT_DETAILS", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const GetRestaurantNotifs = (req, res, next) => {
  new RestaurantService()
    .GetRestaurantNotifs(req.restaurant._id)
    .then((info) =>
      res.status(200).json(success("ALL_NOTIFS", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const updateCordinates = (req, res, next) => {
  new RestaurantService()
    .updateCordinates(req.body, req.restaurant._id)
    .then((info) =>
      res
        .status(200)
        .json(success("UPDATE_RESTAURANT_CORDINATES", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};

module.exports = {
  add,
  getRestaurantList,
  getRestaurantListWithPagination,
  getRestaurantListByType,
  update,
  changePassword,
  restaurantSearch,
  restaurantInHomePage,
  updateCordinates,
  updateRestaurantPresentation,
  updateRestaurantBill,
  passAbonnement,
  passNotif,
  uploadImage,
  GetRestaurantNotifs,
  restaurantDetails,
  profile,
  restaurantSpecialities,
  restaurantNews,
  resetPassword,
  myRestaurantDetails,
};
