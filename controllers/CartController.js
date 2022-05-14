const CartService = require("../services/CartService");
const { success, error } = require("../middlewares/response");
const getProductInCart = (req, res, next) => {
  new CartService()
    .getProductInCart(req.user)
    .then((info) =>
      res.status(200).json(success("PRODUCT_IN_CART", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const addToCart = (req, res, next) => {
  new CartService()
    .addToCart(req.user, req.body)
    .then((info) =>
      res.status(200).json(success("ADD_PRODUCT_TO_CART", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const incrementProductInCart = (req, res, next) => {
  new CartService()
    .incrementProductInCart(req.user, req.query)
    .then((info) =>
      res
        .status(200)
        .json(success("INCREMENT_PRODUCT_TO_CART", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const decrementProductInCart = (req, res, next) => {
  new CartService()
    .decrementProductInCart(req.user, req.query)
    .then((info) =>
      res
        .status(200)
        .json(success("DECREMENT_PRODUCT_TO_CART", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const removeFromCart = (req, res, next) => {
  new CartService()
    .removeFromCart(req.user, req.body)
    .then((info) =>
      res.status(200).json(success("REMOVE_FROM_CART", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const clearMyCart = (req, res, next) => {
  new CartService()
    .clearMyCart(req.user)
    .then((info) =>
      res.status(200).json(success("REMOVE_MY_CART", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const getProducts = (req, res, next) => {
  new CartService()
    .getProducts()
    .then((info) =>
      res.status(200).json(success("GET_PRODUCTS", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
module.exports = {
  getProductInCart,
  getProducts,
  removeFromCart,
  addToCart,
  decrementProductInCart,
  incrementProductInCart,
  clearMyCart,
};
