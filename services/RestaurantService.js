const {
  NotFoundError,
  InternalError,
  AuthorizationError,
  BadRequestError,
} = require("../errors/appError");
const RestaurantModel = require("../models/RestaurantModel");
const PlatModel = require("../models/PlatModel");
const CartModel = require("../models/CartModel");
const Notifier = require("../models/NotifModel");
const RatingModel = require("../models/RatingModel");
const { sign } = require("jsonwebtoken");
const BoissonModel = require("../models/BoissonModel");
const { AUTH_ROLES } = require("../middlewares/auth");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
class RestaurantService {
  constructor() {}

  async Add(body) {
    try {
      const addedRestaurant = new RestaurantModel(body);
      addedRestaurant.name = body.name;
      addedRestaurant.owner = body.owner;
      addedRestaurant.description = body.description;
      addedRestaurant.imageUrl = body.imageUrl;
      addedRestaurant.category = body.category;
      addedRestaurant.address = body.address;
      addedRestaurant.password = bcrypt.hashSync(body.password, 12);
      console.log(addedRestaurant);
      await addedRestaurant.save();
      return addedRestaurant;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getAllRestaurants() {
    try {
      const restaurant = await RestaurantModel.find({}).lean();
      console.log(restaurant);
      return restaurant;
    } catch (error) {
      throw error;
    }
  }
  async changePassword(
    { password, newPassword, newPasswordConfirmation },
    restaurant
  ) {
    try {
      if (newPassword !== newPasswordConfirmation)
        throw new BadRequestError("passwords does not match!");
      let checkIfPasswordMatch = await bcrypt.compare(
        password,
        restaurant.password
      );
      if (!checkIfPasswordMatch) throw new AuthorizationError("wrong password");
      const updateQuery = {
        $set: {
          password: bcrypt.hashSync(newPassword, 12),
        },
      };
      const newRestaurantInformations = await RestaurantModel.findOneAndUpdate(
        { _id: restaurant._id },
        updateQuery
      );

      // new TwilioService().sendSms("Mot de passe changed Successfully!", admin.telephone);
      return newRestaurantInformations;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  static async generateAuthToken(restaurant) {
    const token = sign(
      { _id: restaurant._id, role: AUTH_ROLES.RESTAURANT },
      process.env.TOKEN_PASSWORD
    );
    return token;
  }
  async getRestaurantsInHomePage({ diatetic, price, search }) {
    const projection = {
      restaurantId: "$_id",
      name: "$name",
      description: "$description",
      image: "$imageUrl",
      type: "$type",
      budget: "$budget",
      nbrrating: "$globalRating",
      diatetic: "$diatetic",
    };
    let filterQuery = {};
    if (search)
      filterQuery = {
        ...filterQuery,
        $or: [
          { name: { $regex: search } },
          { description: { $regex: search } },
          { category: { $regex: search } },
          { services: { $regex: search } },
          { address: { $regex: search } },
          { type: { $regex: search } },
        ],
      };
    if (diatetic && price) {
      if (parseInt(price) === 1)
        filterQuery = {
          ...filterQuery,
          diatetic: { $in: [diatetic] },
          budget: { $gt: 0, $lt: 10 },
        };
      else if (parseInt(price) === 2)
        filterQuery = {
          ...filterQuery,
          diatetic: { $in: [diatetic] },
          budget: { $gt: 0, $lt: 100 },
        };
      else
        filterQuery = {
          ...filterQuery,
          diatetic: { $in: [diatetic] },
          budget: { $gt: 0, $lt: 1000 },
        };
    } else filterQuery = { ...filterQuery, null: null };
    try {
      const restaurant = await RestaurantModel.aggregate([
        { $match: filterQuery },
        {
          $group: {
            _id: "$type",
            list: { $push: projection },
            //list: { $push: "$$ROOT" }
          },
        },
        {
          $project: {
            _id: 0,
            restaurantType: "$_id",
            list: { $slice: ["$list", 5] }, //limited By 5 restaurants
            totalRestaurants: { $size: "$list" },
          },
        },
        { $sort: { restaurantType: -1 } },
      ]);
      return restaurant;
    } catch (error) {
      throw error;
    }
  }
  async getRestaurantListByType(user, { type }, { price, diatetic }) {
    let matchQuery = { type: type.toUpperCase() };
    if (diatetic) matchQuery = { ...matchQuery, diatetic: { $in: [diatetic] } };
    if (price) {
      if (parseInt(price) === 1)
        matchQuery = { ...matchQuery, avgPrice: { $gt: 0, $lt: 10 } };
      else if (parseInt(price) === 2)
        matchQuery = { ...matchQuery, avgPrice: { $gt: 10, $lt: 100 } };
      else matchQuery = { ...matchQuery, avgPrice: { $gt: 100, $lt: 1000 } };
    }
    try {
      console.log(matchQuery);
      let restaurants = await RestaurantModel.find(matchQuery).lean();
      const promise = restaurants.map(async (item) => {
        let isFounded = user.favoriteRestaurants.some(
          (element) => element._id.toString() === item._id.toString()
        );
        item.bookmarked = isFounded;
      });
      await Promise.all(promise);
      return restaurants;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getRestaurantSpecialities() {
    let specialities = [];
    try {
      let restaurants = await RestaurantModel.find({}).lean();
      const promise = restaurants.map(async (item) => {
        item.specialty.map((spec) => {
          if (!specialities.find(({ name }) => name == spec))
            specialities.push({ name: spec, img: item.imageUrl });
        });
      });
      await Promise.all(promise);
      return specialities;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getRestaurantNews() {
    try {
      let restaurants = await RestaurantModel.find({
        createdAt: {
          $gte: new Date(new Date() - 7 * 60 * 60 * 24 * 1000),
        },
      }).lean();
      return restaurants;
    } catch (error) {
      throw error;
    }
  }
  async getRestaurantWithPagination(offset, limit) {
    try {
      const restaurant = await RestaurantModel.paginate({ offset, limit });
      return {
        totalItems: restaurant.totalDocs,
        tutorials: restaurant.docs,
        totalPages: restaurant.totalPages,
        currentPage: restaurant.page - 1,
      };
    } catch (error) {
      throw error;
    }
  }
  async restaurantSearch({ search, price, diatetic }) {
    let searchQuery = {};
    if (diatetic)
      searchQuery = { ...searchQuery, diatetic: { $in: [diatetic] } };
    if (price) {
      if (parseInt(price) === 1)
        searchQuery = { ...searchQuery, avgPrice: { $gt: 0, $lt: 10 } };
      else if (parseInt(price) === 2)
        searchQuery = { ...searchQuery, avgPrice: { $gt: 10, $lt: 100 } };
      else searchQuery = { ...searchQuery, avgPrice: { $gt: 100, $lt: 1000 } };
    }
    if (search) {
      searchQuery = {
        ...searchQuery,
        $or: [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search } },
          { category: { $regex: search } },
          { services: { $regex: search } },
          { address: { $regex: search } },
          { type: { $regex: search } },
        ],
      };
    }
    try {
      const restaurant = await RestaurantModel.find(searchQuery).lean();
      const promise = restaurant.map(async (rest) => {
        rest.rating = await RatingModel.find(
          { restaurant: rest._id },
          { restaurant: 0 }
        )
          .populate("user", "firstName lastName country telephone")
          .lean();
      });
      await Promise.all(promise);
      return restaurant;
    } catch (error) {
      throw error;
    }
  }
  async updateRestaurant(body, id) {
    try {
      await RestaurantModel.findByIdAndUpdate({ _id: id }, body);
      return await RestaurantModel.findById(id);
    } catch (error) {
      throw error;
    }
  }
  async resetPassword({ email }) {
    try {
      const restaurant = await RestaurantModel.findOne({ email }).lean();
      let html = `<a href=${process.env.APP_REACT}/ForgetPassword?email=${email}> <h2>reset your password here </h2></a><br/> Best<br/> My dish support Team`;
      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.MAIL_GMAIL, // generated ethereal user
          pass: process.env.MDP_GMAIL, // generated ethereal password
        },
      });

      // send mail with defined transport object
      let info = await transporter.sendMail({
        from: process.env.MAIL_GMAIL, // sender address
        to: "mohamed.derbali@esprit.tn", // list of receivers
        subject: "Lien reset password", // Subject line
        text: "Hello world?", // plain text body
        html: html, // html body
      });
      return { msg: `Message sent: %s ${info.messageId}` };
    } catch (error) {
      console.log(error);
    }
  }
  async updateRestaurantPresentation(body, restaurantId) {
    try {
      await RestaurantModel.findByIdAndUpdate({ _id: restaurantId }, body);
      return RestaurantModel.findById(restaurantId);
    } catch (error) {
      throw error;
    }
  }
  async passNotif(body) {
    try {
      const notification = new Notifier(body);
      return await notification.save();
    } catch (error) {
      throw error;
    }
  }
  async GetRestaurantNotifs(restaurantId) {
    try {
      return await Notifier.find({ restaurantId });
    } catch (error) {
      throw error;
    }
  }
  /*async restaurantDetails(user, { restaurantId }) {
    try {
      let restaurant = await RestaurantModel.findOne({ _id: restaurantId }).populate({
        path: "menus",
        populate: [
          { path: 'plats' },
          { path: 'boissons' }
        ]
      }).populate({
        path: "menusJours",
        populate: [
          { path: 'plats'},
          { path: 'boissons' }
        ]
      }).lean()
      let isFounded = user.favoriteRestaurants.some((element) => element._id.toString() === restaurant._id.toString());
      if (restaurant) {
        restaurant.bookmarked = isFounded
        restaurant.menus && restaurant.menus.map((rest) => {
          if (rest && rest.plats) {
            let result = rest.plats.reduce(function (r, a) {
              r[a.type] = r[a.type] || [];
              r[a.type].push(a);
              return r;
            }, Object.create(null));
            rest.plats = result;
          }
        })
        restaurant.menus.map(menuItem => {
          for (const key in menuItem.plats) {
            menuItem.plats[key].map(element => {
              delete element.type;
            })
          }
        })
        if (restaurant && restaurant.menusJours && restaurant.menusJours.plats) {
          let platInMenuDay = restaurant.menusJours.plats.reduce(function (r, a) {
            r[a.type] = r[a.type] || [];
            r[a.type].push(a);
            return r;
          }, Object.create(null));
          if (platInMenuDay) {
            for (const key in platInMenuDay) {
              platInMenuDay[key].map(platItem => {
                delete platItem.type;
              })
            }
            restaurant.menusJours.plats = platInMenuDay;
          }
        }
      }
      return restaurant
    } catch (error) {
      console.log(error);
      throw error;
    }
  }*/
  async restaurantDetails(user, { restaurantId }) {
    try {
      let restaurant = await RestaurantModel.findOne(
        { _id: restaurantId },
        { menus: 0 }
      )
        .populate(
          "menusJours",
          "name description ingredients diatetic discount price imageUrl calories category type orders globalRating"
        )
        .lean();
      let isFounded = user.favoriteRestaurants.some(
        (element) => element._id.toString() === restaurant._id.toString()
      );
      if (restaurant) {
        restaurant.bookmarked = isFounded;
        let plats = await PlatModel.find({
          restaurantId: restaurant._id,
        }).lean();
        let boissons = await BoissonModel.find({}).lean();
        restaurant = {
          ...restaurant,
          entrée: null,
          deserts: null,
          plats: null,
          boissons: boissons || null,
        };
        //plats numbers in cart
        let myCart = await CartModel.findOne({ userSession: user._id }).lean();
        const promises =
          plats &&
          plats.map(async (countedPlat) => {
            countedPlat.numbersInCart = 0;
            if (myCart && myCart.articles && myCart.articles.length !== 0) {
              if (
                myCart.articles
                  .map(function (e) {
                    return e.article.toString();
                  })
                  .indexOf(countedPlat._id.toString()) !== -1
              )
                countedPlat.numbersInCart =
                  myCart.articles[
                    myCart.articles
                      .map(function (e) {
                        return e.article.toString();
                      })
                      .indexOf(countedPlat._id.toString())
                  ].numbers;
            }
          });
        await Promise.all(promises);
        //end plat numbers
        let restaurantProducts = plats.reduce(function (r, a) {
          r[a.type] = r[a.type] || [];
          r[a.type].push(a);
          return r;
        }, Object.create(null));
        for (const key in restaurantProducts) {
          restaurant[key] = restaurantProducts[key];
        }
      }
      restaurant.nbrrating = restaurant.globalRating;
      restaurant.rating = await RatingModel.find(
        { restaurant: restaurantId },
        { restaurant: 0 }
      )
        .populate("user", "firstName lastName country telephone")
        .lean();
      return restaurant;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async myRestaurantDetails(connectedRestaurant) {
    try {
      let items = {};
      if (connectedRestaurant) {
        let plats = await PlatModel.find({
          restaurantId: connectedRestaurant._id,
        }).lean();
        let boissons = await BoissonModel.find({}).lean();
        items = {
          ...items,
          entrée: null,
          deserts: null,
          plats: null,
          boissons: boissons || null,
        };
        let restaurantProducts = plats.reduce(function (r, a) {
          r[a.type] = r[a.type] || [];
          r[a.type].push(a);
          return r;
        }, Object.create(null));
        for (const key in restaurantProducts) {
          items[key] = restaurantProducts[key];
        }
      }
      return items;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async updateRestaurantBill(body, restaurantId) {
    try {
      await RestaurantModel.findByIdAndUpdate({ _id: restaurantId }, body);
      return RestaurantModel.findById(restaurantId);
    } catch (error) {
      throw error;
    }
  }
  async passAbonnement(body, restaurantId) {
    try {
      await RestaurantModel.findByIdAndUpdate({ _id: restaurantId }, body);
      return RestaurantModel.findById(restaurantId);
    } catch (error) {
      throw error;
    }
  }
  async uploadImage({ filename }, restaurantId) {
    try {
      await RestaurantModel.findByIdAndUpdate(
        { _id: restaurantId },
        { $addToSet: { imagesPresentations: filename } }
      );
      return filename;
    } catch (error) {
      console.log(error);
    }
  }
  async updateCordinates({ longitude, latitude }, restaurantId) {
    try {
      await RestaurantModel.updateOne(
        { _id: restaurantId },
        {
          $set: {
            location: { type: "Point", coordinates: [longitude, latitude] },
          },
        }
      );
      return RestaurantModel.findById(restaurantId);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
module.exports = RestaurantService;
