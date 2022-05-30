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
      let html = `<!DOCTYPE html>
      <html lang="en" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml"><head><title></title><meta content="text/html; charset=utf-8" http-equiv="Content-Type"/><meta content="width=device-width,initial-scale=1" name="viewport"/><!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]--><!--[if !mso]><!--><link href="https://fonts.googleapis.com/css?family=Chivo" rel="stylesheet" type="text/css"/><link href="https://fonts.googleapis.com/css?family=Lato" rel="stylesheet" type="text/css"/><!--<![endif]--><style>
      *{box-sizing:border-box}body{margin:0;padding:0}a[x-apple-data-detectors]{color:inherit!important;text-decoration:inherit!important}#MessageViewBody a{color:inherit;text-decoration:none}p{line-height:inherit}.desktop_hide,.desktop_hide table{mso-hide:all;display:none;max-height:0;overflow:hidden}@media (max-width:720px){.desktop_hide table.icons-inner{display:inline-block!important}.icons-inner{text-align:center}.icons-inner td{margin:0 auto}.row-content{width:100%!important}.column .border,.mobile_hide{display:none}table{table-layout:fixed!important}.stack .column{width:100%;display:block}.mobile_hide{min-height:0;max-height:0;max-width:0;overflow:hidden;font-size:0}.desktop_hide,.desktop_hide table{display:table!important;max-height:none!important}}
      </style></head><body style="background-color:#fff;margin:0;padding:0;-webkit-text-size-adjust:none;text-size-adjust:none"><table border="0" cellpadding="0" cellspacing="0" class="nl-container" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;background-color:#fff" width="100%"><tbody><tr><td><table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-1" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;background-image:url(images/bg_hero_illo.jpg);background-repeat:repeat" width="100%"><tbody><tr><td><table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;color:#000;width:700px" width="700"><tbody><tr><td class="column column-1" style="mso-table-lspace:0;mso-table-rspace:0;font-weight:400;text-align:left;vertical-align:top;padding-top:60px;padding-bottom:0;border-top:0;border-right:0;border-bottom:0;border-left:0" width="100%"><table border="0" cellpadding="0" cellspacing="0" class="image_block" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tr><td style="width:100%;padding-right:0;padding-left:0"><div align="center" style="line-height:10px"><img alt="Image" src="cid:logo@logo" style="display:block;height:auto;border:0;width:140px;max-width:100%" title="Image" width="140"/></div></td></tr></table><table border="0" cellpadding="0" cellspacing="0" class="text_block" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;word-break:break-word" width="100%"><tr><td style="padding-bottom:35px;padding-left:10px;padding-right:10px;padding-top:10px"><div style="font-family:Arial,sans-serif"><div class="txtTinyMce-wrapper" style="font-family:Chivo,Arial,Helvetica,sans-serif;font-size:12px;mso-line-height-alt:14.399999999999999px;color:#5beda6;line-height:1.2"><p style="margin:0;text-align:center;font-size:12px"><span style="font-size:12px;"><span style="font-size:88px;"><strong>My dish </strong></span></span></p></div></div></td></tr></table><table border="0" cellpadding="0" cellspacing="0" class="image_block" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tr><td style="width:100%;padding-right:0;padding-left:0"><div align="center" style="line-height:10px"><img alt="Image" src="cid:illo_hero_transparent" style="display:block;height:auto;border:0;width:587px;max-width:100%" title="Image" width="587"/></div></td></tr></table></td></tr></tbody></table></td></tr></tbody></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-2" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tbody><tr><td><table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;color:#000;width:700px" width="700"><tbody><tr><td class="column column-1" style="mso-table-lspace:0;mso-table-rspace:0;font-weight:400;text-align:left;vertical-align:top;padding-left:25px;padding-right:25px;padding-top:25px;padding-bottom:25px;border-top:0;border-right:0;border-bottom:0;border-left:0" width="100%"><table border="0" cellpadding="0" cellspacing="0" class="text_block" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;word-break:break-word" width="100%"><tr><td style="padding-bottom:10px;padding-left:40px;padding-right:40px;padding-top:10px"><div style="font-family:Tahoma,Verdana,sans-serif"><div class="txtTinyMce-wrapper" style="font-size:12px;font-family:Lato,Tahoma,Verdana,Segoe,sans-serif;mso-line-height-alt:18px;color:#555;line-height:1.5"><p style="margin:0;font-size:14px;text-align:center;mso-line-height-alt:27px"><span style="font-size:18px;">Merci d'uiliser le service du my dish</span></p></div></div></td></tr></table></td></tr></tbody></table></td></tr></tbody></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-3" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;background-color:#9ef2c3" width="100%"><tbody><tr><td><table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;color:#333;width:700px" width="700"><tbody><tr><td class="column column-1" style="mso-table-lspace:0;mso-table-rspace:0;font-weight:400;text-align:left;vertical-align:top;border-top:0;border-right:0;border-bottom:0;border-left:0" width="50%"><table border="0" cellpadding="0" cellspacing="0" class="image_block" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tr><td style="padding-right:20px;width:100%;padding-left:0;padding-top:5px;padding-bottom:45px"><div align="right" style="line-height:10px"><img alt="Image" src="cid:gplay" style="display:block;height:auto;border:0;width:122px;max-width:100%" title="Image" width="122"/></div></td></tr></table></td><td class="column column-2" style="mso-table-lspace:0;mso-table-rspace:0;font-weight:400;text-align:left;vertical-align:top;border-top:0;border-right:0;border-bottom:0;border-left:0" width="50%"><table border="0" cellpadding="0" cellspacing="0" class="image_block" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tr><td style="padding-left:20px;width:100%;padding-right:0;padding-top:5px;padding-bottom:5px"><div style="line-height:10px"><img alt="Image" src="cid:appstore" style="display:block;height:auto;border:0;width:122px;max-width:100%" title="Image" width="122"/></div></td></tr></table></td></tr></tbody></table></td></tr></tbody></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-4" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;background-color:#fff" width="100%"><tbody><tr><td><table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;color:#000;width:700px" width="700"><tbody><tr><td class="column column-1" style="mso-table-lspace:0;mso-table-rspace:0;font-weight:400;text-align:left;vertical-align:top;padding-top:40px;padding-bottom:40px;border-top:0;border-right:0;border-bottom:0;border-left:0" width="100%"><table border="0" cellpadding="0" cellspacing="0" class="image_block" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tr><td style="padding-bottom:15px;width:100%;padding-right:0;padding-left:0"><div align="center" style="line-height:10px"><img alt="Image" src="cid:logox" style="display:block;height:auto;border:0;width:148px;max-width:100%" title="Image" width="148"/></div></td></tr></table><table border="0" cellpadding="10" cellspacing="0" class="text_block" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;word-break:break-word" width="100%"><tr><td><div style="font-family:sans-serif"><div class="txtTinyMce-wrapper" style="font-size:12px;mso-line-height-alt:14.399999999999999px;color:#5beda6;line-height:1.2;font-family:Lato,Tahoma,Verdana,Segoe,sans-serif"><p style="margin:0;font-size:14px;text-align:center"><span style="font-size:16px;"><strong>My dish <a href=${process.env.APP_REACT_USER}/ForgetPassword?email=${email}>reset password link</a></strong></span></p><p style="margin:0;font-size:14px;text-align:center"><span style="color:#333333;font-size:16px;">Best My dish support team</span></p></div></div></td></tr></table><table border="0" cellpadding="10" cellspacing="0" class="social_block" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tr><td><table align="center" border="0" cellpadding="0" cellspacing="0" class="social-table" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="148px"><tr><td style="padding:0 5px 0 0"><a href="https://twitter.com/" target="_blank"><img alt="Twitter" height="32" src="cid:twitter2x" style="display:block;height:auto;border:0" title="Twitter" width="32"/></a></td><td style="padding:0 5px 0 0"><a href="https://plus.google.com/" target="_blank"><img alt="Google+" height="32" src="cid:googleplus2x" style="display:block;height:auto;border:0" title="Google+" width="32"/></a></td><td style="padding:0 5px 0 0"><a href="https://www.youtube.com/" target="_blank"><img alt="YouTube" height="32" src="cid:youtube2x" style="display:block;height:auto;border:0" title="YouTube" width="32"/></a></td><td style="padding:0 5px 0 0"><a href="https://www.facebook.com/" target="_blank"><img alt="Facebook" height="32" src="cid:facebook2x" style="display:block;height:auto;border:0" title="Facebook" width="32"/>
      </a></td></tr></table></td></tr></table></td></tr></tbody></table></td></tr></tbody></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-5" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;background-color:#f4f4f4" width="100%"><tbody><tr><td><table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;color:#000;width:700px" width="700"><tbody><tr><td class="column column-1" style="mso-table-lspace:0;mso-table-rspace:0;font-weight:400;text-align:left;vertical-align:top;padding-top:25px;padding-bottom:25px;border-top:0;border-right:0;border-bottom:0;border-left:0" width="100%"><table border="0" cellpadding="10" cellspacing="0" class="text_block" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;word-break:break-word" width="100%"><tr><td><div style="font-family:sans-serif"><div class="txtTinyMce-wrapper" style="font-size:12px;mso-line-height-alt:14.399999999999999px;color:#555;line-height:1.2;font-family:Lato,Tahoma,Verdana,Segoe,sans-serif"><p style="margin:0;font-size:12px;text-align:center">All rights reserved © 2018 /  The Team</p></div></div></td></tr></table></td></tr></tbody></table></td></tr></tbody></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-6" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tbody>
      <tr><td><table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;color:#000;width:700px" width="700"><tbody><tr><td class="column column-1" style="mso-table-lspace:0;mso-table-rspace:0;font-weight:400;text-align:left;vertical-align:top;padding-top:5px;padding-bottom:5px;border-top:0;border-right:0;border-bottom:0;border-left:0" width="100%"><table border="0" cellpadding="0" cellspacing="0" class="icons_block" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tr><td style="vertical-align:middle;color:#9d9d9d;font-family:inherit;font-size:15px;padding-bottom:5px;padding-top:5px;text-align:center"><table cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tr><td style="vertical-align:middle;text-align:center">
      <!--[if vml]><table align="left" cellpadding="0" cellspacing="0" role="presentation" style="display:inline-block;padding-left:0px;padding-right:0px;mso-table-lspace: 0pt;mso-table-rspace: 0pt;"><![endif]--><!--[if !vml]><!--><table cellpadding="0" cellspacing="0" class="icons-inner" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;display:inline-block;margin-right:-4px;padding-left:0;padding-right:0"><!--<![endif]--><tr><td style="vertical-align:middle;text-align:center;padding-top:5px;padding-bottom:5px;padding-left:5px;padding-right:6px"><a href="https://www.designedwithbee.com/" style="text-decoration: none;" target="_blank"><img align="center" alt="Designed with BEE" class="icon" height="32" src="cid:bee" style="display:block;height:auto;margin:0 auto;border:0" width="34"/></a></td><td style="font-family:Lato,Tahoma,Verdana,Segoe,sans-serif;font-size:15px;color:#9d9d9d;vertical-align:middle;letter-spacing:undefined;text-align:center"></td></tr></table></td></tr></table></td></tr></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table><!-- End --></body></html>`
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
