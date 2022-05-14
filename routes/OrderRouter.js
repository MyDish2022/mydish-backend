var express = require("express");
const catchMiddleware = require("../middlewares/api");
var router = express.Router();
const {
  passOrder,
  orderList,
  orderDetails,
  deleteOrder,
  validateOrder,
  cancelOrder,
  passOrderByRestaurant,
  getReservationList,
  validateOrderByAdmin,
  checkoutPayment,
  deliveryOrders,
  odersByPaidBy,
  getAllReservations,
  weeklyOrders,
  notifOrder,
  neededInformations,
  readyToDeliver,
  removeNotif,
} = require("../controllers/OrderController");
const { authorize, AUTH_ROLES } = require("../middlewares/auth");
const { USER, ADMIN, RESTAURANT, NO_TOKEN } = AUTH_ROLES;
router.post("/passOrder", authorize(USER), catchMiddleware(passOrder));
router.post(
  "/passOrderByRestaurant",
  authorize(RESTAURANT),
  catchMiddleware(passOrderByRestaurant)
);
router.get("/orderList", authorize(USER, ADMIN), catchMiddleware(orderList));
router.get(
  "/deliveryOrders",
  authorize(RESTAURANT),
  catchMiddleware(deliveryOrders)
);
router.get("/odersByPaidBy", authorize(ADMIN), catchMiddleware(odersByPaidBy));
router.get(
  "/getReservationList",
  authorize(USER),
  catchMiddleware(getReservationList)
);
router.get(
  "/getAllReservations",
  authorize(RESTAURANT),
  catchMiddleware(getAllReservations)
);
router.get(
  "/orderDetails/:orderId",
  authorize(USER, ADMIN),
  catchMiddleware(orderDetails)
);
router.get("/weeklyOrders", authorize(USER), catchMiddleware(weeklyOrders));
router.delete(
  "/deleteOrder/:orderId",
  authorize(USER, ADMIN),
  catchMiddleware(deleteOrder)
);
router.put(
  "/validateOrder/:orderId",
  authorize(USER),
  catchMiddleware(validateOrder)
);
router.put(
  "/validateOrderByAdmin/:orderId",
  authorize(RESTAURANT),
  catchMiddleware(validateOrderByAdmin)
);
router.put(
  "/readyToDeliver/:orderId",
  authorize(RESTAURANT),
  catchMiddleware(readyToDeliver)
);
router.put(
  "/cancelOrder/:orderId",
  authorize(USER, ADMIN, RESTAURANT),
  catchMiddleware(cancelOrder)
);
router.get(
  "/checkIfOrderPayed/:intentId",
  authorize(USER),
  catchMiddleware(checkoutPayment)
);
router.get(
  "/notifOrder",
  authorize(RESTAURANT, NO_TOKEN),
  catchMiddleware(notifOrder)
);
router.delete(
  "/removeNotif/:orderId",
  authorize(RESTAURANT, NO_TOKEN),
  catchMiddleware(removeNotif)
);
router.get(
  "/informations",
  authorize(RESTAURANT),
  catchMiddleware(neededInformations)
);
module.exports = router;
