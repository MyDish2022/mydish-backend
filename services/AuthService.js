const UserModel = require("../models/UserModel");
const AdminModel = require("../models/AdminModel");
const RestaurantModel = require("../models/RestaurantModel");
const bcrypt = require("bcryptjs");
const UserService = require("../services/UserService");
const AdminService = require("../services/AdminService");
const StripeService = require("../services/StripeService");
const RestaurantService = require("../services/RestaurantService");
const fetch = require("node-fetch");
const { OAuth2Client } = require("google-auth-library");
const { sign } = require("jsonwebtoken");
const { AuthorizationError, NotFoundError } = require("../errors/appError");
const { AUTH_ROLES } = require("../middlewares/auth");
const client = new OAuth2Client();
class AuthService {
  constructor() {}
  async LoginUser(body) {
    const { email, password } = body;
    try {
      const user = await UserModel.findOne({ email })
        .populate("favoriteRestaurants")
        .lean();
      if (!user) throw new NotFoundError("utilisateur introuvable");
      let checkPassword = await bcrypt.compare(password, user.password);
      if (!checkPassword) throw new AuthorizationError("unauthorized user");
      const token = await UserService.generateAuthToken(user);
      delete user.password;
      delete user.passwordSalt;
      return { user, token };
    } catch (error) {
      throw error;
    }
  }
  async loginAdmin(body) {
    const { email, password } = body;
    try {
      const admin = await AdminModel.findOne({ email }).lean();
      if (!admin) throw new NotFoundError("Admin introuvable");
      let checkPassword = await bcrypt.compare(password, admin.password);
      if (!checkPassword) throw new AuthorizationError("unauthorized Admin");
      const token = await AdminService.generateAuthToken(admin);
      delete admin.password;
      delete admin.passwordSalt;
      return { admin, token };
    } catch (error) {
      throw error;
    }
  }
  async loginWithGoogle(body) {
    const { idToken } = body;
    try {
      if (!idToken) throw new NotFoundError("Missing Google login infos!");
      let response = await client.verifyIdToken({
        idToken,
      });
      const { email_verified, email } = response.payload;
      if (email_verified) {
        let user = await UserModel.findOne({ email });
        if (user) {
          const token = sign(
            { _id: user._id, role: AUTH_ROLES.USER },
            process.env.TOKEN_PASSWORD,
            {
              expiresIn: "7d",
            }
          );
          return {
            user,
            token,
          };
        } else {
          let password = bcrypt.hashSync(email, 12);
          user = new UserModel({
            lastName: "mydish-LastnameUser",
            firstName: "mydish-FirstnameUser",
            email,
            password,
            country: "mydish-countryUser",
          });
          let customerIdInnvoice = await StripeService.createCustomerId(user);
          user.customerIdInnvoice = customerIdInnvoice.id;
          let facebookUser = await user.save();
          const token = sign(
            { _id: facebookUser._id, role: AUTH_ROLES.USER },
            process.env.TOKEN_PASSWORD,
            {
              expiresIn: "7d",
            }
          );
          return {
            user,
            token,
          };
        }
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async loginWithFacebook(body) {
    const { userID, accessToken } = body;
    try {
      if (!userID || !accessToken)
        throw new NotFoundError("Missing Facebook login infos!");
      const url = `https://graph.facebook.com/v2.11/${userID}/?fields=id,last_name,first_name,picture,email,birthday,hometown&access_token=${accessToken}`;
      let response = await fetch(url, {
        method: "GET",
      }).then((response) => response.json());
      const { email, last_name, first_name, hometown } = response;
      let user = await UserModel.findOne({ email });
      if (user) {
        const token = sign(
          { _id: user._id, role: AUTH_ROLES.USER },
          process.env.TOKEN_PASSWORD,
          {
            expiresIn: "7d",
          }
        );
        return {
          user,
          token,
        };
      } else {
        let password = bcrypt.hashSync(email, 12);
        user = new UserModel({
          lastName: last_name,
          firstName: first_name,
          email,
          password,
          country: hometown?.name,
        });
        let customerIdInnvoice = await StripeService.createCustomerId(user);
        user.customerIdInnvoice = customerIdInnvoice.id;
        let facebookUser = await user.save();
        const token = sign(
          { _id: facebookUser._id, role: AUTH_ROLES.USER },
          process.env.TOKEN_PASSWORD,
          {
            expiresIn: "7d",
          }
        );
        return {
          user,
          token,
        };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async loginRestaurant(body) {
    const { login, password } = body;
    try {
      const restaurant = await RestaurantModel.findOne({ login }).lean();
      if (!restaurant) throw new NotFoundError("Restaurant introuvable");
      let checkPassword = await bcrypt.compare(password, restaurant.password);

      if (!checkPassword)
        throw new AuthorizationError("unauthorized Restaurant");
      const token = await RestaurantService.generateAuthToken(restaurant);
      delete restaurant.password;
      return { restaurant, token };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
module.exports = AuthService;
