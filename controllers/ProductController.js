const ProductService = require("../services/ProductService");
const { success, error } = require("../middlewares/response");
const ProductModel = require("../models/ProductModel");

const getMenuList = (req, res, next) => {
  new ProductService()
    .getMenuList(req.query)
    .then((info) =>
      res.status(200).json(success("MENU_LIST", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const addMenu = (req, res, next) => {
  new ProductService()
    .addMenu(req.body, req.restaurant._id)
    .then((info) =>
      res.status(200).json(success("ADD_MENU", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const getRestaurantMenuList = (req, res, next) => {
  new ProductService()
    .getRestaurantMenuList(req.restaurant._id, req.query)
    .then((info) =>
      res
        .status(200)
        .json(success("RESTAURANT_MENU_LIST", info, res.statusCode))
    )
    .catch((err) => console.log(err));
};
const getMenuListByRestaurant = (req, res, next) => {
  new ProductService()
    .getMenuListByRestaurant(req.params)
    .then((info) =>
      res
        .status(200)
        .json(success("RESTAURANT_MENU_LIST", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const removeMenu = (req, res, next) => {
  console.log(req.params);
  new ProductService()
    .removeMenu(req.params)
    .then((info) =>
      res.status(200).json(success("REMOVE_MENU", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const updateMenu = (req, res, next) => {
  new ProductService()
    .updateMenu(req.body, req.params)
    .then((info) =>
      res.status(200).json(success("UPDATE_MENU", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
searchRecord = (req, res, next) => {
  new ProductService()
    .searchRecord(req.params)
    .then((info) =>
      res
        .status(200)
        .json(success("RESTAURANT_MENU_LIST", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};

search = async (req, res, next) => {
  let query = [
    {
      $lookup: {
        from: "Restaurant",
        localField: "restaurantId",
        foreignField: "_id",
        as: "restaurant",
      },
    },
    { $unwind: "$restaurant" },
  ];
  if (req.query.keyword && req.query.keyword != "") {
    query.push({
      $match: {
        $or: [
          {
            category: { $regex: `^${req.query.keyword.trim()}`, $options: "i" },
          },
          {
            "restaurant.name": {
              $regex: `^${req.query.keyword.trim()}`,
              $options: "i",
            },
          },
          {
            "restaurant.speciality": {
              $regex: `^${req.query.keyword.trim()}`,
              $options: "i",
            },
          },
          {
            "restaurant.name": {
              $regex: `^${req.query.keyword.trim()}`,
              $options: "i",
            },
          },
          {
            description: {
              $regex: `^${req.query.keyword.trim()}`,
              $options: "i",
            },
          },
          {
            name: { $regex: `^${req.query.keyword.trim()}`, $options: "i" },
          },
        ],
      },
    });
  }

  let total = await ProductModel.countDocuments(query);
  let page = req.query.page ? parseInt(req.query.page) : 1;
  let perPage = req.query.perPage ? parseInt(req.query.perPage) : 10;
  let skip = (page - 1) * perPage;
  query.push({
    $skip: skip,
  });
  query.push({
    $limit: perPage,
  });

  let products = await ProductModel.aggregate(query);

  return res.send({
    data: {
      products: products,
      meta: {
        total: total,
        currentPage: page,
        perPage: perPage,
        totalPages: Math.ceil(total / perPage),
      },
    },
  });
};

const favorites = (req, res, next) => {
  new ProductService()
    .addToFavorite(req)
    .then((info) => res.json(info))
    .catch((err) => next(err));
};

module.exports = {
  getMenuList,
  addMenu,
  getRestaurantMenuList,
  removeMenu,
  updateMenu,
  searchRecord,
  getMenuListByRestaurant,
  /*    search,
    favorites,
    */
};
