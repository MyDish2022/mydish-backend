const OrderService = require("../services/OrderService");
const { success, error } = require("../middlewares/response");
const StripeService = require("../services/StripeService");
const orderList = (req, res, next) => {
  new OrderService()
    .orderList()
    .then((info) =>
      res.status(200).json(success("ORDER_LIST", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const deliveryOrders = (req, res, next) => {
  new OrderService()
    .deliveryOrders(req.query, req.restaurant)
    .then((info) =>
      res.status(200).json(success("ORDER_DELIVERY", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const odersByPaidBy = (req, res, next) => {
  new OrderService()
    .odersByPaidBy(req.query)
    .then((info) =>
      res.status(200).json(success("PAID_ORDERS", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const getReservationList = (req, res, next) => {
  new OrderService()
    .getReservationList(req.user, req.body)
    .then((info) =>
      res.status(200).json(success("RESERVATION_LIST", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const weeklyOrders = (req, res, next) => {
  new OrderService()
    .weeklyOrders(req.user, req.query)
    .then((info) =>
      res.status(200).json(success("WEEKLY_ORDERS", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const getAllReservations = (req, res, next) => {
  new OrderService()
    .getAllReservations(req.query, req.restaurant)
    .then((info) =>
      res.status(200).json(success("RESERVATION_LIST", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const checkoutPayment = (req, res, next) => {
  new StripeService()
    .checkoutPayment(req.user, req.params)
    .then((info) =>
      res.status(200).json(success("INTENT", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const orderDetails = (req, res, next) => {
  new OrderService()
    .orderDetails(req.params.orderId)
    .then((info) =>
      res.status(200).json(success("ORDER_DETAILS", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const deleteOrder = (req, res, next) => {
  new OrderService()
    .deleteOrder(req.params.orderId)
    .then((info) =>
      res.status(200).json(success("ORDER_REMOVED", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const validateOrder = (req, res, next) => {
  new OrderService()
    .validateOrder(req.params.orderId, req.user)
    .then((info) =>
      res.status(200).json(success("VALIDATE_ORDER", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const validateOrderByAdmin = (req, res, next) => {
  new OrderService()
    .validateOrderByAdmin(req.params.orderId)
    .then((info) =>
      res.status(200).json(success("ORDER_VALIDATED", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const readyToDeliver = (req, res, next) => {
  new OrderService()
    .readyToDeliver(req.params.orderId)
    .then((info) =>
      res.status(200).json(success("ORDER_VALIDATED", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const cancelOrder = (req, res, next) => {
  new OrderService()
    .cancelOrder(req.params.orderId)
    .then((info) =>
      res.status(200).json(success("ORDER_CANCELED", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const passOrder = (req, res, next) => {
  new OrderService()
    .passOrder(req.user, req.body)
    .then((info) =>
      res.status(200).json(success("ORDER_CREATE", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const passOrderByRestaurant = (req, res, next) => {
  new OrderService()
    .passOrderByRestaurant(req.restaurant, req.body)
    .then((info) =>
      res.status(200).json(success("ORDER_CREATE", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const neededInformations = (req, res, next) => {
  new OrderService()
    .neededInformations(req.restaurant)
    .then((info) =>
      res.status(200).json(success("ORDER_INFOS", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const notifOrder = (req, res, next) => {
  new OrderService()
    .notifOrder(req.restaurant)
    .then((info) =>
      res.status(200).json(success("ORDER_NOTIFS", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
const removeNotif = (req, res, next) => {
  new OrderService()
    .removeNotif(req.params)
    .then((info) =>
      res.status(200).json(success("REMOVE_NOTIF", info, res.statusCode))
    )
    .catch((err) =>
      res
        .status(err.code || 500)
        .json(error(err.status, err.code) || "internal error")
    );
};
module.exports = {
  orderList,
  passOrder,
  orderDetails,
  deleteOrder,
  validateOrder,
  cancelOrder,
  validateOrderByAdmin,
  getReservationList,
  deliveryOrders,
  odersByPaidBy,
  getAllReservations,
  weeklyOrders,
  checkoutPayment,
  passOrderByRestaurant,
  neededInformations,
  removeNotif,
  notifOrder,
  readyToDeliver,
};
