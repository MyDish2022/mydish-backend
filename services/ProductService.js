const ProductModel = require("../models/ProductModel");
const BoissonModel = require("../models/BoissonModel");
const PlatModel = require("../models/PlatModel");
const {
  AuthorizationError,
  NotFoundError,
  LimitEssay,
  AlreadyExistError,
  InternalError,
} = require("../errors/appError");
const UserModel = require("../models/UserModel");
const MenuModel = require("../models/MenuModel");
class ProductService {
  constructor() {}
  async addMenu(body, restaurantId) {
    try {
      console.log(restaurantId);
      let data = {};
      if (body.nom) data.name = body.nom;
      if (body.prix) data.price = parseInt(body.prix);

      if (body.boissons) {
        data.boissons = await this.parseBoissons(body.boissons);
      }
      if (body.plats) {
        data.plats = await this.parsePlats(body.plats);
      }
      if (body.type) data.type = body.type;
      if (body.categorie) data.category = body.categorie;
      if (restaurantId) data.restaurantId = restaurantId;
      await Promise.allSettled([data]);
      if (body.service) data.service = body.service;
      if (body.disponibilite) data.disponibilite = body.disponibilite;
      if (body.jours) data.jours = body.jours;
      const addedProduct = new MenuModel(data);
      const registeredMenu = await addedProduct.save();
      return { Menu: registeredMenu };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getMenuList({ type }) {
    let filterQuery = {};
    if (type) filterQuery = { ...filterQuery, type: type };
    const projection = {
      name: true,
      restaurantId: true,
      description: true,
      price: true,
      imageUrl: true,
      calories: true,
      category: true,
      plats: true,
      boissons: true,
      type: true,
    };
    try {
      const Menu = await ProductModel.find(filterQuery, projection)
        .populate("plats boissons restaurantId")
        .lean();
      return Menu;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async searchRecord({ keyword }) {
    let query = {};
    query.$or = [{ category: { $regex: `^${keyword.trim()}`, $options: "i" } }];
    const products = await ProductModel.find(query)
      .populate("restaurantId")
      .lean();
    if (!products) throw new NotFoundError("products not found");
    return products;
  }
  parsePlats = async (items) => {
    let arr = [];
    if (items) {
      const promise = items.map(async (it) => {
        let plt = await PlatModel.findOne({ name: it.nom });
        arr.push(plt);
      });
      await Promise.all(promise);
      return arr.map((item) => item._id);
    }
  };
  parseBoissons = async (items) => {
    let arr = [];
    if (items) {
      const promise = items.map(async (it) => {
        let plt = await BoissonModel.findOne({ name: it.nom });
        arr.push(plt);
      });
      await Promise.all(promise);
      return arr.map((item) => item._id);
    }
  };
  async getRestaurantMenuList(restaurantId, { type }) {
    let sort = {};
    let filterQuery = { restaurantId };
    if (type) sort = { ...sort, status: type };
    const projection = {
      name: true,
      restaurantId: true,
      description: true,
      price: true,
      imageUrl: true,
      calories: true,
      category: true,
      plats: true,
      boissons: true,
      type: true,
      status: true,
    };
    try {
      let product = await MenuModel.find(filterQuery, projection)
        .sort()
        .populate("plats boissons restaurantId")
        .lean();
      if (sort && sort.status) {
        product.sort();
        if (sort.status != "desc") {
          console.log("asba");
          product.reverse();
        }
      }
      return product;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getMenuListByRestaurant({ restaurantId }) {
    const projection = {
      name: true,
      restaurantId: true,
      description: true,
      price: true,
      imageUrl: true,
      calories: true,
      category: true,
      plats: true,
      boissons: true,
      type: true,
    };
    try {
      const product = await ProductModel.find({ restaurantId }, projection)
        .populate("plats boissons restaurantId")
        .lean();
      return product;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async removeMenu({ menuId }) {
    let checkIfExist = await MenuModel.findOne({ _id: menuId }).lean();
    if (!checkIfExist) throw new NotFoundError("Menu not found!");
    try {
      await MenuModel.findByIdAndRemove({ _id: menuId });
      return { message: "Menu Removed successfully" };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async updateMenu(body, { menuId }) {
    try {
      let Menu = await ProductModel.findOne({ _id: menuId }).lean();
      if (!Menu) throw new NotFoundError();
      await ProductModel.findOneAndUpdate(
        { _id: menuId },
        {
          $set: body,
        },
        { returnOriginal: false }
      ).lean();
      const newMenu = await ProductModel.findById(menuId).lean();
      return newMenu;
    } catch (error) {
      throw error;
    }
  }
  async addToFavorite(req) {
    const us = UserModel.updateOne(
      { _id: req.params.id },
      { $push: { favoriteRestaurants: [req.params.Rid] } },
      function (err, us) {
        if (err) {
          res.send(err);
        } else {
          res.send(us);
        }
      }
    );
  }
}
module.exports = ProductService;
