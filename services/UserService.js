const UserModel = require("../models/UserModel");
const RatingModel = require("../models/RatingModel");
const bcrypt = require("bcryptjs");
const { distance } = require("../helpers/distance");
const {
  AuthorizationError,
  NotFoundError,
  LimitEssay,
  AlreadyExistError,
  InternalError,
  BadRequestError,
} = require("../errors/appError");
const { sign } = require("jsonwebtoken");
const RestaurantModel = require("../models/RestaurantModel");
const TwilioService = require("../services/TwilioService");
const StripeService = require("../services/StripeService");
const { AUTH_ROLES } = require("../middlewares/auth");
const nodemailer = require("nodemailer");
class UserService {
  constructor() {}
  async Register(body) {
    try {
      const user =
        (await UserModel.findOne({ email: body.email }).lean()) ||
        (await UserModel.findOne({ telephone: body.telephone }).lean());
      if (user) throw new AlreadyExistError();
      const { password } = body;
      let registredUser = new UserModel(body);
      registredUser.password = bcrypt.hashSync(password, 12);
      registredUser.passwordSalt = bcrypt.hashSync(password, 12);
      let customerIdInnvoice = await StripeService.createCustomerId(
        registredUser
      );
      registredUser.customerIdInnvoice = customerIdInnvoice.id;
      await registredUser.save();
      return registredUser;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  static async generateAuthToken(user) {
    const token = sign(
      { _id: user._id, role: AUTH_ROLES.USER },
      process.env.TOKEN_PASSWORD,
      {
        expiresIn: "7d",
      }
    );
    return token;
  }
  async changePassword(body, user) {
    const { password, newPassword } = body;

    try {
      let checkIfPasswordMatch = await bcrypt.compare(password, user.password);
      if (!checkIfPasswordMatch) throw new AuthorizationError();
      const updateQuery = {
        $set: {
          password: bcrypt.hashSync(newPassword, 12),
          passwordSalt: bcrypt.hashSync(newPassword, 12),
        },
      };
      let updated = await UserModel.findOneAndUpdate(
        { _id: user._id },
        updateQuery,
        {
          projection: {
            password: 0,
            passwordSalt: 0,
            "creditCardInfos.CCV": 0,
          },
        }
      );

      //new TwilioService().sendSms("test message", user.telephone);
      return updated;
    } catch (error) {
      throw error;
    }
  }
  async changePasswordByEmail({ email, newpassword }) {
    try {
      const updateQuery = {
        $set: {
          password: bcrypt.hashSync(newpassword, 12),
          passwordSalt: bcrypt.hashSync(newpassword, 12),
        },
      };
      return await UserModel.findOneAndUpdate({ email: email }, updateQuery);
    } catch (error) {
      throw new InternalError(error.errors);
    }
  }
  async changeTelephone(body, user) {
    const { newPhoneNumber } = body;
    try {
      const updateQuery = {
        $set: {
          telephone: newPhoneNumber,
        },
      };
      await UserModel.findOneAndUpdate({ _id: user._id }, updateQuery);
      return "phone number updated successfully";
    } catch (error) {
      throw error;
    }
  }
  async updateInformation(body, user) {
    try {
      await UserModel.findOneAndUpdate(
        { _id: user._id },
        {
          $set: body,
        },
        { returnOriginal: false }
      ).lean();
      const newUser = await UserModel.findById(user._id, {
        password: 0,
        passwordSalt: 0,
        "creditCardInfos.CCV": 0,
      });
      return newUser;
    } catch (error) {
      throw error;
    }
  }
  async forgetPassword(body) {
    const { code, email } = body;
    try {
      const user = await UserModel.findOne({ email }).lean();
      let html = `<a href=${process.env.APP_REACT}/ForgetPassword?email=${email}> <h2>reset your password here </h2></a><br/> Best<br/> My dish support Team`;
      if (code === user.confirmOTP) {
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
          to: user.email, // list of receivers
          subject: "Lien reset password", // Subject line
          text: "Hello world?", // plain text body
          html: html, // html body
        });
        return { msg: `Message sent: %s ${info.messageId}` };
      }
      return "Wrong Code.";
    } catch (error) {
      throw new InternalError(error.errors);
    }
  }
  async creditCardAdd(body, user) {
    try {
      if (!user)
        throw new AuthorizationError("you must login to perform this request");
      await UserModel.findOneAndUpdate(
        { _id: user._id },
        {
          $addToSet: { creditCardInfos: body },
        }
      );
      let renderedUser = await UserModel.findOne(
        { _id: user._id },
        { "creditCardInfos.CCV": 0 }
      );
      return renderedUser;
    } catch (error) {
      throw error;
    }
  }
  async creditCardRemove(cardId, user) {
    try {
      if (!user)
        throw new AuthorizationError("you must login to perform this request");
      const checkingIfCardExist = (item) => item._id == cardId;
      if (!user.creditCardInfos.some(checkingIfCardExist))
        return new NotFoundError("card does not exist");
      await UserModel.findOneAndUpdate(
        { _id: user._id },
        {
          $pull: { creditCardInfos: { _id: cardId } },
        },
        { multi: true }
      );
      const renderedUser = await UserModel.findOne(
        { _id: user._id },
        { "creditCardInfos.CCV": 0 }
      );
      return renderedUser;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async creditCardAll(user) {
    try {
      user.creditCardInfos.map((cardItem) => {
        delete cardItem.CCV;
      });
      return user.creditCardInfos;
    } catch (error) {
      throw error;
    }
  }
  async getUserRates({ _id }) {
    try {
      let user = await UserModel.findOne(
        { _id },
        { password: 0, passwordSalt: 0, "creditCardInfos.CCV": 0 }
      ).populate("userRatings");
      return { MyRatings: user.userRatings };
    } catch (error) {
      throw new InternalError(error.errors);
    }
  }
  async verifyEmail({ email }) {
    let user = await UserModel.findOne({ email }).lean();
    if (user) return user;
    else throw new NotFoundError("mail does not exist");
  }
  async confirmSms({ phone }) {
    try {
      const generatedCode = Math.floor(1000 + Math.random() * 9000);
      new TwilioService().sendSms(
        `Votre code du confirmation: ${generatedCode}`,
        phone.replace("+33", "")
      );
      return generatedCode;
    } catch (error) {
      throw new error();
    }
  }
  async forgetPasswordSms({ email }) {
    try {
      const generatedCode = Math.floor(1000 + Math.random() * 9000);
      const findUser = await UserModel.findOne({ email }).lean();
      if (findUser && findUser.otpTries <= 10) {
        const user = await UserModel.findOneAndUpdate(
          { email },
          { confirmOTP: generatedCode, $inc: { otpTries: 1 } }
        ).lean();
        new TwilioService().sendSms(
          `Votre code du réinitialisation du mot de passe Mydish est: ${generatedCode}`,
          user.telephone
        );
        return `code ${generatedCode} envoyé avec success`;
      }
      throw new LimitEssay();
    } catch (error) {
      throw new error();
    }
  }
  async unbookmark({ restaurantId }, user) {
    try {
      const checkIfExist = (element) => element._id == restaurantId;
      if (user.favoriteRestaurants.some(checkIfExist) === false)
        throw new NotFoundError("restaurant does not exist in favourite");
      await UserModel.findOneAndUpdate(
        { _id: user._id },
        {
          $pull: { favoriteRestaurants: restaurantId },
        },
        { multi: false }
      );
      return "restaurant removed from wishlist successfully!";
    } catch (error) {
      throw error;
    }
  }
  async bookmark({ restaurantId }, user) {
    try {
      await UserModel.findOneAndUpdate(
        { _id: user._id },
        {
          $addToSet: { favoriteRestaurants: restaurantId },
        }
      );
      return "restaurant added to wishlist successfully!";
    } catch (error) {
      throw error;
    }
  }
  async unbookmarkPlat({ platId }, user) {
    try {
      const checkIfExist = (element) => element._id == platId;
      if (user.favoritePlats.some(checkIfExist) === false)
        throw new NotFoundError("restaurant does not exist in favourite");
      await UserModel.findOneAndUpdate(
        { _id: user._id },
        {
          $pull: { favoritePlats: platId },
        },
        { multi: false }
      );
      return "plat removed from wishlist successfully!";
    } catch (error) {
      throw error;
    }
  }
  async unbookmarkAllPlat(user) {
    try {
      await UserModel.findOneAndUpdate(
        { _id: user._id },
        {
          $set: { favoritePlats: [] },
        }
      );
      return "All plats removed from wishlist successfully!";
    } catch (error) {
      throw error;
    }
  }
  async unbookmarkAllRestaurants(user) {
    try {
      await UserModel.findOneAndUpdate(
        { _id: user._id },
        {
          $set: { favoriteRestaurants: [] },
        }
      );
      return "All Restaaurants removed from wishlist successfully!";
    } catch (error) {
      throw error;
    }
  }
  async getNearByRestaurants(user, { longitude, latitude }) {
    let maxDistance = 20;
    try {
      if (!longitude || !latitude)
        throw new BadRequestError("you must provide your current location");
      const NearByRestaurants = [];
      const restaurantsList = await RestaurantModel.find({}).lean();
      const promise = restaurantsList.map((restaurant) => {
        if (restaurant.location && restaurant.location.coordinates) {
          let distanceCalculated = distance(
            latitude,
            longitude,
            restaurant.location.coordinates[1],
            restaurant.location.coordinates[0]
          );
          distanceCalculated <= maxDistance &&
            NearByRestaurants.push(restaurant);
        }
      });
      await Promise.all(promise);
      return NearByRestaurants;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async bookmarkPlat({ platId }, user) {
    try {
      await UserModel.findOneAndUpdate(
        { _id: user._id },
        {
          $addToSet: { favoritePlats: platId },
        }
      );
      return "plat added to wishlist successfully!";
    } catch (error) {
      throw error;
    }
  }
}
module.exports = UserService;
