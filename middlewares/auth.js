const jwt = require("jsonwebtoken");
const UserModel = require("../models/UserModel");
const AdminModel = require("../models/AdminModel");
const RestaurantModel = require("../models/RestaurantModel");
const { AuthorizationError, NotFoundError } = require("../errors/appError");
const config = process.env;

exports.AUTH_ROLES = {
  NO_TOKEN: "no token",
  USER: "user",
  ADMIN: "admin",
  RESTAURANT: "restaurant",
};
exports.authorize =
  (...roles) =>
  async (req, res, next) => {
    let token = req.headers["x-access-token"] || req.headers.authorization;
    if (token && token.startsWith("Bearer ")) {
      token = token.slice(7, token.length);
    }
    if (!token) {
      if (roles.length === 0 || roles.includes("no token")) {
        return next();
      }
      res.status(401).json({ message: "you are not authorized to do this!" });
    }
    try {
      const data = jwt.verify(token, process.env.TOKEN_PASSWORD);
      if ("role" in data) {
        if (data.role == "user") {
          const user = await UserModel.findOne({ _id: data._id })
            .populate("favoriteRestaurants favoritePlats")
            .lean();
          req.user = user;
          req.role = "user";
        } else if (data.role == "admin") {
          const admin = await AdminModel.findOne({ _id: data._id }).lean();
          req.admin = admin;
          req.role = "admin";
        } else if (data.role == "restaurant") {
          const restaurant = await RestaurantModel.findOne({
            _id: data._id,
          }).lean();
          req.restaurant = restaurant;
          req.role = "restaurant";
        } else throw new NotFoundError("No user found!");
      } else {
        const [user, admin, restaurant] = await Promise.all([
          UserModel.findById(data.id || data._id),
          AdminModel.findById(data.id || data._id),
          RestaurantModel.findById(data.id || data._id),
        ]);
        if (user) {
          req.user = user;
          req.role = "user";
        } else if (admin) {
          req.admin = admin;
          req.role = "admin";
        } else if (restaurant) {
          req.restaurant = restaurant;
          req.role = "restaurant";
        } else throw new NotFoundError("No user found!");
      }
      next();
    } catch (error) {
      res.status(401).json({ message: "you are not authorized to do this!" });
    }
  };
