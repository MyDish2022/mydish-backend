const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { NotFoundError } = require("../errors/appError");
const orderModel = require("../models/OrderModel");
const cartModel = require("../models/CartModel");
class StripeService {
  constructor() {}
  static async createPaymentIntent(customerId, order) {
    let key = await this.MakeEphemeralKeyForInnvoice(customerId, order);
    try {
      let orderId = order._id.toString();
      const paymentIntent = await stripe.paymentIntents.create({
        amount: order?.totalPrice * 100,
        currency: "eur",
        "automatic_payment_methods[enabled]": true,
        customer: customerId,
        metadata: {
          order_id: orderId,
        },
      });
      //return paymentIntent
      return {
        publishableKey: paymentIntent.client_secret,
        paymentIntent: paymentIntent.id,
        customer: paymentIntent.customer,
        ephemeralKey: key.secret,
      };
    } catch (error) {
      throw error;
    }
  }
  static async createCustomerId(user) {
    try {
      const customer = await stripe.customers.create({
        description: `this is customer id for user ${user.firstName} ${user.lastName}`,
        email: user.email,
      });
      return customer;
    } catch (error) {
      throw error;
    }
  }
  static async MakeEphemeralKeyForInnvoice(customerId) {
    try {
      let key = await stripe.ephemeralKeys.create(
        { customer: customerId },
        { apiVersion: "2020-08-27" }
      );
      return key;
    } catch (error) {
      throw error;
    }
  }
  async checkoutPayment(user, { intentId }) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(intentId);
      if (!paymentIntent) return new NotFoundError();
      let payed =
        paymentIntent["charges"]["data"] &&
        paymentIntent["charges"]["data"][0] &&
        paymentIntent["charges"]["data"][0]["paid"];
      if (payed === true) {
        if (paymentIntent.metadata.order_id) {
          await orderModel
            .updateOne(
              { _id: paymentIntent.metadata.order_id },
              { $set: { isPaid: true, status: "Paid" } }
            )
            .lean();
          await cartModel.findOneAndRemove({ userSession: user._id }).lean();
        }

        return {
          message: "order Payed successfully",
          paid: true,
          metadata: paymentIntent,
        };
      }
      return { message: "order is not payed", paid: false };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
module.exports = StripeService;
