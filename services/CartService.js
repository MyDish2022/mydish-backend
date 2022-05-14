const { validateCartItems } = require("use-shopping-cart/src/serverUtil");
const ProductModel = require("../models/ProductModel");
const OrderService = require("../services/OrderService");
const { arraysEquals, sumArray } = require("../helpers/arraysEquals");
const PlatModel = require("../models/PlatModel");
const userModel = require("../models/UserModel");
const CartModel = require("../models/CartModel");
const boissonModel = require("../models/BoissonModel");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const {
  AuthorizationError,
  NotFoundError,
  BadRequestError,
  UniqueMealError,
} = require("../errors/appError");
class CartService {
  constructor() {}
  async getProductInCart(user) {
    try {
      const carts = await CartModel.findOne({ userSession: user._id })
        .populate("articles.article boisson.article")
        .lean();
      return carts;
    } catch (error) {
      throw error;
    }
  }
  async incrementProductInCart(user, { platId, boissonId }) {
    try {
      if (!platId && !boissonId)
        throw new BadRequestError("platId and boissonId not provided");
      const carts = await CartModel.findOne({ userSession: user._id })
        .populate("articles.article boisson.article")
        .lean();
      if (platId) {
        let platIndex = (element) => element.article?._id == platId;
        carts.articles.findIndex(platIndex) !== -1 &&
          carts.articles[carts.articles.findIndex(platIndex)].numbers++;
      }
      if (boissonId) {
        let boissonIndex = (element) => element.article?._id == boissonId;
        carts.boisson.findIndex(boissonIndex) !== -1 &&
          carts.boisson[carts.boisson.findIndex(boissonIndex)].numbers++;
      }
      await CartModel.findOneAndUpdate(
        { _id: carts._id },
        { $set: carts }
      ).lean();
      await this.getPricesFromCart(carts._id);
      return await CartModel.findOne({ userSession: user._id })
        .populate("articles.article boisson.article")
        .lean();
    } catch (error) {
      throw error;
    }
  }
  async decrementProductInCart(user, { platId, boissonId }) {
    try {
      if (!platId && !boissonId)
        throw new BadRequestError("platId and boissonId not provided");
      const carts = await CartModel.findOne({ userSession: user._id })
        .populate("articles.article boisson.article")
        .lean();
      if (platId) {
        let platIndex = (element) => element.article?._id == platId;
        if (carts.articles.findIndex(platIndex) !== -1) {
          if (carts.articles[carts.articles.findIndex(platIndex)].numbers === 1)
            carts.articles.splice(carts.articles.findIndex(platIndex), 1);
          else carts.articles[carts.articles.findIndex(platIndex)].numbers--;
        }
      }
      if (boissonId) {
        let boissonIndex = (element) => element.article?._id == boissonId;
        if (carts.boisson.findIndex(boissonIndex) !== -1) {
          if (
            carts.boisson[carts.boisson.findIndex(boissonIndex)].numbers === 1
          )
            carts.boisson.splice(carts.boisson.findIndex(boissonIndex), 1);
          else carts.boisson[carts.boisson.findIndex(boissonIndex)].numbers--;
        }
      }
      await CartModel.findOneAndUpdate(
        { _id: carts._id },
        { $set: carts }
      ).lean();
      await this.getPricesFromCart(carts._id);
      return await CartModel.findOne({ userSession: user._id })
        .populate("articles.article boisson.article")
        .lean();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async removeFromCart(user, { platId, boissonId }) {
    console.log(platId, boissonId);
    try {
      if (!platId && !boissonId)
        throw new BadRequestError("platId and boissonId not provided");
      const carts = await CartModel.findOne({ userSession: user._id })
        .populate("articles.article boisson.article")
        .lean();
      if (platId) {
        let platIndex = (element) => element.article?._id == platId;
        if (carts.articles.findIndex(platIndex) !== -1) {
          carts.articles.splice(carts.articles.findIndex(platIndex), 1);
        }
      }
      if (boissonId) {
        let boissonIndex = (element) => element.article?._id == boissonId;
        if (carts.boisson.findIndex(boissonIndex) !== -1) {
          carts.boisson.splice(carts.boisson.findIndex(boissonIndex), 1);
        }
      }
      await CartModel.findOneAndUpdate(
        { _id: carts._id },
        { $set: carts }
      ).lean();
      await this.getPricesFromCart(carts._id);
      return await CartModel.findOne({ userSession: user._id })
        .populate("articles.article boisson.article")
        .lean();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async clearMyCart(user) {
    try {
      const cart = await CartModel.findOne({ userSession: user._id }).lean();
      if (!cart) throw new NotFoundError("cart not found");
      await CartModel.findOneAndRemove({ userSession: user._id }).lean();
      return "cart cleared successfully!";
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getPricesFromCart(cartId) {
    const projection = {
      articles: 1,
      boisson: 1,
      promoCode: 1,
      deliveryCosts: 1,
    };
    let subTotalPrices = 0;
    let totalPrices = 0;
    const myCart = await CartModel.findOne({ _id: cartId }, projection)
      .populate("articles.article boisson.article promoCode")
      .lean();
    if (myCart) {
      if (myCart.articles) {
        myCart.articles.map((plat) => {
          if (plat.article && plat.article.price) {
            subTotalPrices += plat.article.price * plat.numbers;
          }
          if (plat.options && plat.options.length !== 0) {
            let pricesOptions = sumArray(plat.options) * plat.numbers;
            subTotalPrices += pricesOptions;
          }
        });
      }
      if (myCart.boisson) {
        myCart.boisson.map((plat) => {
          if (plat.article && plat.article.price) {
            subTotalPrices += plat.article.price * plat.numbers;
          }
        });
      }
      myCart.promoCode
        ? (totalPrices = subTotalPrices - (subTotalPrices * 5) / 100)
        : (totalPrices = subTotalPrices);
      if (myCart.deliveryCosts) totalPrices += myCart.deliveryCosts;
      await CartModel.updateOne(
        { _id: cartId },
        { $set: { subTotalPrice: subTotalPrices, totalPrice: totalPrices } }
      ).lean();
    }
  }
  async addToCart(user, body) {
    try {
      const {
        plat,
        boisson,
        description,
        deliveryCosts,
        promoCodeApplied,
        promoCode,
        options,
      } = body;
      let optionsArray = [];
      //check If user choose another meal from a restaurant
      if (plat) {
        let sameRestaurant = true;
        let mealToBeAdded = await PlatModel.findOne({ _id: plat }).lean();
        //make options Array with prices
        options.map((opt) => {
          const criteria = (element) => element.name == opt;
          let indexOpt = mealToBeAdded.options.findIndex(criteria);
          optionsArray.push({
            name: opt,
            price: mealToBeAdded.options[indexOpt].price,
          });
        });
        //end options prices
        const carts = await CartModel.findOne({ userSession: user._id })
          .populate("articles.article boisson.article")
          .lean();
        if (carts && carts.articles) {
          const promiseArticle = carts.articles.map((elem) => {
            sameRestaurant =
              elem.article.restaurantId.toString() ===
              mealToBeAdded.restaurantId.toString();
          });
          await Promise.all(promiseArticle);
        }
        if (sameRestaurant === false)
          throw new UniqueMealError(
            "you canot choose two meals from diffent restaurant"
          );
      }
      //end check
      const getUserCart = await CartModel.findOne({
        userSession: user._id,
      }).lean();
      if (getUserCart) {
        let platIndex = (element) =>
          element.article == plat &&
          arraysEquals(element.options, optionsArray);
        let boissonIndex = (element) => element.article == boisson;
        if (
          getUserCart.articles &&
          getUserCart.articles.findIndex(platIndex) === -1
        ) {
          let objPlat = {
            article: plat,
            numbers: 1,
            options: optionsArray,
            description,
          };
          if (plat) getUserCart.articles.push(objPlat);
        } else {
          getUserCart.articles[
            getUserCart.articles.findIndex(platIndex)
          ].numbers += 1;
        }
        if (
          getUserCart.boisson &&
          getUserCart.boisson.findIndex(boissonIndex) === -1
        ) {
          let objBoisson = {
            article: boisson,
            description,
            numbers: 1,
          };
          if (boisson) getUserCart.boisson.push(objBoisson);
        } else {
          getUserCart.boisson[
            getUserCart.boisson.findIndex(boissonIndex)
          ].numbers += 1;
        }
        getUserCart.deliveryCosts += deliveryCosts ? deliveryCosts : 0;
        (getUserCart.promoCodeApplied = promoCodeApplied),
          (getUserCart.promoCode = promoCode),
          (getUserCart.payedBy = "CB"),
          (getUserCart.orderType = "Livraison");
        getUserCart.description = "panier";
        await CartModel.findOneAndUpdate(
          { _id: getUserCart._id },
          { $set: getUserCart }
        ).lean();
        await this.getPricesFromCart(getUserCart._id);
        const fullSchemaCart = await CartModel.findOne({
          _id: getUserCart._id,
        }).lean();
        return fullSchemaCart;
      }
      let cartObject = new CartModel({
        userSession: user._id,
        description: description,
        deliveryCosts: deliveryCosts ? deliveryCosts : 0,
        promoCodeApplied: promoCodeApplied,
        promoCode: promoCode,
        payedBy: "CB",
        orderType: "Livraison",
      });
      if (plat) {
        cartObject.articles = [
          {
            article: plat,
            numbers: 1,
            description,
            options: optionsArray,
          },
        ];
      }
      if (boisson) {
        cartObject.boisson = [{ article: boisson, numbers: 1, description }];
      }
      const savedCart = await cartObject.save();
      await this.getPricesFromCart(savedCart._id);
      const fullSchemaCart = await CartModel.findOne({
        _id: savedCart._id,
      }).lean();
      return fullSchemaCart;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
module.exports = CartService;
