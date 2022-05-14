const Order = require("../models/OrderModel");
const Product = require("../models/ProductModel");
const productOrderSchema = require("../models/ProductOrderSchema");
const userModel = require("../models/UserModel");
const PlatModel = require("../models/PlatModel");
const serviceModel = require("../models/ServiceModel");
const promoCode = require("../models/PromoCodeModel");
const StripeService = require("./StripeService");
const cartSchema = require("../models/CartModel");
const BoissonModel = require("../models/BoissonModel");
const bcrypt = require("bcryptjs");
const {
  AuthorizationError,
  NotFoundError,
  InternalError,
} = require("../errors/appError");
const { sign } = require("jsonwebtoken");
const moment = require("moment");
const format = "HH:mm:ss";
class OrderService {
  constructor() {}
  async passOrder(user, body) {
    const { panierId, status, restaurantId, paymentMethod } = body;
    try {
      const cartItems = await cartSchema
        .findOne({ _id: panierId })
        .populate("promoCode", "code")
        .lean();
      let ProductItem = new Product({
        name: `order By user ${user?.firstName} ${user?.lastName}`,
        restaurantId,
        description: cartItems?.description,
        discount: cartItems?.promoCode?.discountAmount || 0,
        price: cartItems?.totalPrice,
        type: status,
        plats: cartItems?.articles,
        boissons: cartItems?.boisson,
      });
      let savedProduct = await ProductItem.save();
      body = {
        ...body,
        orderDetails: savedProduct._id,
        orderCreator: user._id,
        paymentType: cartItems?.payedBy,
        totalPrice: cartItems?.totalPrice,
        consigne: `consigne: ${cartItems?.description}`,
        discountCode: cartItems?.promoCode?._id,
        discount: cartItems?.promoCode?.discountAmount || 0,
      };
      let orderModel = new Order(body);
      orderModel.save();
      let pay = await StripeService.createPaymentIntent(
        user.customerIdInnvoice,
        orderModel
      );
      return { order: orderModel, paymentIntent: pay };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  parsePlats = async (items) => {
    let arr = [];
    if (items) {
      const promise = items.map(async (it) => {
        let plt = await PlatModel.findOne({ name: it.nom });
        arr.push(plt);
      });
      await Promise.all(promise);
      return arr;
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
      return arr;
    }
  };
  async passOrderByRestaurant(connectedRestaurant, body) {
    try {
      const { date, heure } = body;
      console.log(date, heure);
      let orderedForDate = new Date(`${date}T${heure}`);
      //orderedForDate.setHours(orderedForDate.getHours()+2)
      let savedUser = null;
      let user = null;
      let articles = [],
        boissons = [];
      let promoCodeInformations = null;
      const {
        promotion,
        plat,
        dessert,
        boisson,
        entree_plat,
        options_plat,
        orderType,
      } = body;
      let checkIfUserExist = await userModel
        .findOne({ email: body.email })
        .lean();
      if (!checkIfUserExist) {
        user = new userModel({
          firstName: body.nom,
          lastName: body.prenom,
          address: body.address_livraison,
          email: body.email,
          password: "mydish",
          telephone: body.numero_tlp,
        });
        /* stripeID */
        const customerId = await StripeService.createCustomerId(user);
        user.customerIdInnvoice = customerId.id;
        savedUser = await user.save();
      } else {
        savedUser = checkIfUserExist;
      }
      if (promotion) {
        promoCodeInformations = await promoCode
          .findOne({ _id: promotion })
          .lean();
      }
      articles.concat(
        await this.parsePlats(plat),
        await this.parsePlats(dessert),
        await this.parsePlats(entree_plat)
      );
      await Promise.all(articles);
      boissons = await this.parseBoissons(boisson);
      await Promise.all([boissons]);
      let ProductItem = new Product({
        name: `order for user ${savedUser?.firstName} ${savedUser?.lastName}`,
        restaurantId: connectedRestaurant._id,
        description: "order passed successfully",
        discount: promoCodeInformations
          ? promoCodeInformations.discountAmount
          : 0,
        price: 500,
        plats: articles,
        boissons: boissons,
      });
      let savedProduct = await ProductItem.save();

      let orderSchemaToPass = {
        orderCreator: savedUser._id,
        orderDetails: savedProduct._id,
        paymentType: "Restaurant",
        totalPrice: 500,
        consigne: "order Passed By Restaurant",
        discountCode: promotion,
        orderType: orderType,
        orderedForDate,
        discount: promoCodeInformations
          ? promoCodeInformations.discountAmount
          : 0,
        restaurant: connectedRestaurant._id,
      };

      let orderModel = new Order(orderSchemaToPass);
      let pay = await StripeService.createPaymentIntent(
        savedUser?.customerIdInnvoice,
        orderModel
      );
      let savedOrder = await orderModel.save();
      let renderedSchema = savedOrder._doc;
      renderedSchema = {
        ...renderedSchema,
        orderCreator: savedUser,
        orderDetails: savedProduct,
      };
      //console.log(renderedSchema);
      return renderedSchema;
    } catch (err) {
      // throw err;
      console.log(err);
    }
  }
  async notifOrder(connectedRestaurant) {
    const projection = {
      orderCreator: 1,
      createdAt: 1,
      peopleNumber: 1,
      orderType: 1,
      notification: 1,
    };
    let filterQuery = {
      notification: true,
    };
    if (connectedRestaurant)
      filterQuery = { ...filterQuery, restaurant: connectedRestaurant._id };
    const reservation = [];
    const livraison = [];
    try {
      const notifs = await Order.find(filterQuery, projection)
        .populate("orderCreator", "firstName lastName")
        .lean();
      const promise = notifs.map(async (e1) => {
        if (e1.orderType == "RESERVATION") reservation.push(e1);
        else if (e1.orderType == "LIVRAISON") livraison.push(e1);
      });
      await Promise.all(promise);
      return {
        reservationsNotifs: reservation,
        livraisonsNotifs: livraison,
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  async removeNotif({ orderId }) {
    try {
      const order = await Order.findOneAndUpdate(
        { _id: orderId },
        { notification: false },
        { returnOriginal: false }
      );
      return order;
    } catch (err) {
      throw err;
    }
  }
  async orderList() {
    try {
      const orderList = await Order.find({})
        .populate("restaurant")
        .populate("orderDetails")
        .lean();
      if (!orderList) return new NotFoundError();
      return orderList;
    } catch (error) {
      throw error;
    }
  }
  async neededInformations(restaurant) {
    let options = [];
    try {
      let [
        promoCodesList,
        cartsList,
        boissonsList,
        dessertList,
        entreeList,
        servicesList,
      ] = await Promise.all([
        promoCode.find({ restaurantId: restaurant._id }).lean(),
        PlatModel.find({ restaurantId: restaurant._id }).lean(),
        BoissonModel.find({}).lean(),
        PlatModel.find({
          restaurantId: restaurant._id,
          type: "deserts",
        }).lean(),
        PlatModel.find({
          restaurantId: restaurant._id,
          type: "entrée",
        }).lean(),
        serviceModel.find({}).lean(),
      ]);
      cartsList.map((plt) => {
        plt &&
          plt.options.map((opt) => {
            options.push(opt.name);
          });
      });
      options = [...new Set(options)];
      return {
        promoCodesList,
        cartsList,
        boissonsList,
        dessertList,
        entreeList,
        servicesList,
        options,
      };
    } catch (err) {
      throw err;
    }
  }
  checkSession = (dateOrder) => {
    let extractedTime = moment.utc(dateOrder).format(format);
    let timeNight = moment(extractedTime, format),
      beforeTimeNight = moment("19:30:00", format),
      afterTimeNight = moment("23:59:59", format);
    let timeMorning = moment(extractedTime, format),
      beforeTimeMorning = moment("11:30:00", format),
      afterTimeMorning = moment("15:30:00", format);
    if (timeNight.isBetween(beforeTimeNight, afterTimeNight)) return "night";
    else if (timeMorning.isBetween(beforeTimeMorning, afterTimeMorning))
      return "morning";
    return null;
  };
  async weeklyOrders(user, { dateOrder }) {
    const weeklyOrders = [];
    try {
      const orderList = await Order.aggregate([
        { $match: { orderCreator: user._id } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$orderedForDate" },
            },
            list: { $push: "$$ROOT" },
          },
        },
        { $project: { _id: 0, dateCreation: "$_id", orders: "$list" } },
      ]);
      const promises = orderList.map(async (item) => {
        if (new Date().getTime() < new Date(item.dateCreation).getTime()) {
          let orderToRender = { OrderOnDate: item.dateCreation };
          orderToRender = {
            ...orderToRender,
            morningOrder: null,
            nightOrder: null,
          };
          item.orders.map((element) => {
            let isoDateParser = new Date(element.orderedForDate);
            console.log(this.checkSession(isoDateParser));
            if (this.checkSession(isoDateParser) == "morning")
              orderToRender = { ...orderToRender, morningOrder: element };
            else if (this.checkSession(isoDateParser) == "night")
              orderToRender = { ...orderToRender, nightOrder: element };
          });
          weeklyOrders.push(orderToRender);
        }
      });
      await Promise.all(promises);
      return dateOrder
        ? weeklyOrders.filter(
            (weeklyOrder) => weeklyOrder.OrderOnDate == dateOrder
          )
        : weeklyOrders;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async deliveryOrders({ status }, restaurant) {
    let filterQuery = {
      orderType: "LIVRAISON",
      restaurant: restaurant._id,
    };
    // if (status) filterQuery = { ...filterQuery, status: status };
    try {
      const orderList = await Order.find(filterQuery)
        .populate({
          path: "orderDetails",
          populate: {
            path: "plats",
            model: "Plat",
          },
        })
        .populate("orderCreator", "firstName lastName")
        .lean();
      if (!orderList) throw new NotFoundError();
      return orderList;
    } catch (error) {
      throw error;
    }
  }
  async odersByPaidBy() {
    try {
      const orderList = await Order.aggregate([
        {
          $group: {
            _id: "$isPaid",
            list: { $push: "$$ROOT" },
          },
        },
        { $project: { _id: 0, payedBy: "$_id", orders: "$list" } },
      ]);
      if (!orderList) return new NotFoundError();
      return orderList;
    } catch (error) {
      throw error;
    }
  }
  async getAllReservations(
    { status, time, startBetweenStart, startBetweenEnd },
    restaurant
  ) {
    let filteredOrders = [];
    let filterQuery = {
      orderType: "RESERVATION",
      restaurant: restaurant._id,
    };
    if (status)
      filterQuery = {
        ...filterQuery,
        status: status,
      };
    if (startBetweenStart && startBetweenEnd)
      filterQuery = {
        ...filterQuery,
        orderedForDate: {
          $gte: new Date(startBetweenStart),
          $lt: new Date(startBetweenEnd),
        },
      };
    try {
      const orderList = await Order.find(filterQuery)
        .populate({
          path: "orderDetails",
          populate: {
            path: "plats",
            model: "Plat",
          },
        })
        .populate("orderCreator", "firstName lastName")
        .lean();
      const promise = orderList.map(async (ord) => {
        let hour = ord.orderedForDate.getUTCHours() + 2;
        if (time === "morning" && hour >= 12 && hour <= 16) {
          filteredOrders.push(ord);
        }
        if (time === "night" && hour >= 18 && hour <= 24) {
          filteredOrders.push(ord);
        }
      });
      Promise.all(promise);
      if (!orderList) throw new NotFoundError();
      return filteredOrders;
    } catch (error) {
      console.log(error);
      // throw error;
    }
  }
  async getReservationList(user, { orderType }) {
    var todayDate = moment().toDate();
    let ordersObject = {
      oldOrders: [],
      newOrders: [],
    };
    if (!user) throw new AuthorizationError("unauthorized");
    let filterQuery = {
      orderCreator: user._id,
    };
    if (orderType) {
      filterQuery = { ...filterQuery, orderType: orderType };
    }
    try {
      const orderList = await Order.find(filterQuery).populate(
        "restaurant orderDetails"
      );
      if (!orderList) throw new NotFoundError();
      const promise = orderList.map(async (accumulater) => {
        accumulater.orderedForDate > todayDate
          ? ordersObject.newOrders.push(accumulater)
          : ordersObject.oldOrders.push(accumulater);
      });
      await Promise.all(promise);
      return ordersObject;
    } catch (error) {
      throw error;
    }
  }
  async orderDetails(orderId) {
    try {
      const orderDetails = await Order.findOne({ _id: orderId })
        .populate("restaurant")
        .populate({
          path: "orderDetails",
          populate: {
            path: "menu",
            model: "Product",
          },
        });
      if (!orderDetails) throw new NotFoundError();
      return { orderDetails };
    } catch (error) {
      throw error;
    }
  }
  async cancelOrder(orderId) {
    try {
      const orderCheck = await Order.findOne({ _id: orderId });
      if (!orderCheck) throw new NotFoundError("order does not exist!");
      await Order.findOneAndUpdate({ _id: orderId }, { status: "Cancelled" });
      return { canceled: "order canceled successfully" };
    } catch (error) {
      throw error;
    }
  }
  async validateOrder(orderId, user) {
    const userId = user._id;
    try {
      const orderCheck = await Order.findOne({ _id: orderId });
      if (!orderCheck) throw new NotFoundError("order does not exist!");
      await Order.findOneAndUpdate(
        { _id: orderId, orderCreator: userId },
        { status: "validated" }
      );
      return { validation: "order validated successfully" };
    } catch (error) {
      throw error;
    }
  }
  async validateOrderByAdmin(orderId) {
    try {
      const orderCheck = await Order.findOne({ _id: orderId });
      if (!orderCheck) throw new NotFoundError("order does not exist!");
      const updatedOrder = await Order.findOneAndUpdate(
        { _id: orderId },
        { status: "InProgress" },
        { returnOriginal: false }
      )
        .populate({
          path: "orderDetails",
          populate: {
            path: "plats",
            model: "Plat",
          },
        })
        .populate("orderCreator", "firstName lastName")
        .lean();
      return updatedOrder;
    } catch (error) {
      throw error;
    }
  }
  async readyToDeliver(orderId) {
    try {
      const orderCheck = await Order.findOne({ _id: orderId });
      if (!orderCheck) throw new NotFoundError("order does not exist!");
      const updatedOrder = await Order.findOneAndUpdate(
        { _id: orderId },
        { status: "Finished" },
        { returnOriginal: false }
      )
        .populate({
          path: "orderDetails",
          populate: {
            path: "plats",
            model: "Plat",
          },
        })
        .populate("orderCreator", "firstName lastName")
        .lean();
      return updatedOrder;
    } catch (error) {
      throw error;
    }
  }
  async deleteOrder(orderId) {
    try {
      const orderCheck = await Order.findOne({ _id: orderId });
      if (!orderCheck) throw new NotFoundError("order does not exist!");
      await Order.findByIdAndRemove({ _id: orderId });
      return { removed: "order removed successfully" };
    } catch (error) {
      throw error;
    }
  }
}
module.exports = OrderService;
