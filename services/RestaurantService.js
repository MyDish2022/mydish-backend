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
const ServiceModel = require("../models/ServiceModel");
const SectionModel = require("../models/SectionModel");
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
      if (!checkIfPasswordMatch) throw new BadRequestError("wrong password");
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
  async restaurantPaymentMethods({restaurantId}) {
    try {
      let restaurants = await RestaurantModel.find({_id: restaurantId}, {moreInfos: 1}).lean();
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
      let html = `<!DOCTYPE html>
      <html lang="en" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml"><head><title></title><meta content="text/html; charset=utf-8" http-equiv="Content-Type"/><meta content="width=device-width,initial-scale=1" name="viewport"/><!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]--><!--[if !mso]><!--><link href="https://fonts.googleapis.com/css?family=Chivo" rel="stylesheet" type="text/css"/><link href="https://fonts.googleapis.com/css?family=Lato" rel="stylesheet" type="text/css"/><!--<![endif]--><style>
      *{box-sizing:border-box}body{margin:0;padding:0}a[x-apple-data-detectors]{color:inherit!important;text-decoration:inherit!important}#MessageViewBody a{color:inherit;text-decoration:none}p{line-height:inherit}.desktop_hide,.desktop_hide table{mso-hide:all;display:none;max-height:0;overflow:hidden}@media (max-width:720px){.desktop_hide table.icons-inner{display:inline-block!important}.icons-inner{text-align:center}.icons-inner td{margin:0 auto}.row-content{width:100%!important}.column .border,.mobile_hide{display:none}table{table-layout:fixed!important}.stack .column{width:100%;display:block}.mobile_hide{min-height:0;max-height:0;max-width:0;overflow:hidden;font-size:0}.desktop_hide,.desktop_hide table{display:table!important;max-height:none!important}}
      </style></head><body style="background-color:#fff;margin:0;padding:0;-webkit-text-size-adjust:none;text-size-adjust:none"><table border="0" cellpadding="0" cellspacing="0" class="nl-container" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;background-color:#fff" width="100%"><tbody><tr><td><table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-1" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;background-image:url(images/bg_hero_illo.jpg);background-repeat:repeat" width="100%"><tbody><tr><td><table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;color:#000;width:700px" width="700"><tbody><tr><td class="column column-1" style="mso-table-lspace:0;mso-table-rspace:0;font-weight:400;text-align:left;vertical-align:top;padding-top:60px;padding-bottom:0;border-top:0;border-right:0;border-bottom:0;border-left:0" width="100%"><table border="0" cellpadding="0" cellspacing="0" class="image_block" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tr><td style="width:100%;padding-right:0;padding-left:0"><div align="center" style="line-height:10px"><img alt="Image" src="cid:logo@logo" style="display:block;height:auto;border:0;width:140px;max-width:100%" title="Image" width="140"/></div></td></tr></table><table border="0" cellpadding="0" cellspacing="0" class="text_block" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;word-break:break-word" width="100%"><tr><td style="padding-bottom:35px;padding-left:10px;padding-right:10px;padding-top:10px"><div style="font-family:Arial,sans-serif"><div class="txtTinyMce-wrapper" style="font-family:Chivo,Arial,Helvetica,sans-serif;font-size:12px;mso-line-height-alt:14.399999999999999px;color:#5beda6;line-height:1.2"><p style="margin:0;text-align:center;font-size:12px"><span style="font-size:12px;"><span style="font-size:88px;"><strong>My dish </strong></span></span></p></div></div></td></tr></table><table border="0" cellpadding="0" cellspacing="0" class="image_block" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tr><td style="width:100%;padding-right:0;padding-left:0"><div align="center" style="line-height:10px"><img alt="Image" src="cid:illo_hero_transparent" style="display:block;height:auto;border:0;width:587px;max-width:100%" title="Image" width="587"/></div></td></tr></table></td></tr></tbody></table></td></tr></tbody></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-2" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tbody><tr><td><table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;color:#000;width:700px" width="700"><tbody><tr><td class="column column-1" style="mso-table-lspace:0;mso-table-rspace:0;font-weight:400;text-align:left;vertical-align:top;padding-left:25px;padding-right:25px;padding-top:25px;padding-bottom:25px;border-top:0;border-right:0;border-bottom:0;border-left:0" width="100%"><table border="0" cellpadding="0" cellspacing="0" class="text_block" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;word-break:break-word" width="100%"><tr><td style="padding-bottom:10px;padding-left:40px;padding-right:40px;padding-top:10px"><div style="font-family:Tahoma,Verdana,sans-serif"><div class="txtTinyMce-wrapper" style="font-size:12px;font-family:Lato,Tahoma,Verdana,Segoe,sans-serif;mso-line-height-alt:18px;color:#555;line-height:1.5"><p style="margin:0;font-size:14px;text-align:center;mso-line-height-alt:27px"><span style="font-size:18px;">Merci d'uiliser le service du my dish</span></p></div></div></td></tr></table></td></tr></tbody></table></td></tr></tbody></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-3" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;background-color:#9ef2c3" width="100%"><tbody><tr><td><table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;color:#333;width:700px" width="700"><tbody><tr><td class="column column-1" style="mso-table-lspace:0;mso-table-rspace:0;font-weight:400;text-align:left;vertical-align:top;border-top:0;border-right:0;border-bottom:0;border-left:0" width="50%"><table border="0" cellpadding="0" cellspacing="0" class="image_block" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tr><td style="padding-right:20px;width:100%;padding-left:0;padding-top:5px;padding-bottom:45px"><div align="right" style="line-height:10px"><img alt="Image" src="cid:gplay" style="display:block;height:auto;border:0;width:122px;max-width:100%" title="Image" width="122"/></div></td></tr></table></td><td class="column column-2" style="mso-table-lspace:0;mso-table-rspace:0;font-weight:400;text-align:left;vertical-align:top;border-top:0;border-right:0;border-bottom:0;border-left:0" width="50%"><table border="0" cellpadding="0" cellspacing="0" class="image_block" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tr><td style="padding-left:20px;width:100%;padding-right:0;padding-top:5px;padding-bottom:5px"><div style="line-height:10px"><img alt="Image" src="cid:appstore" style="display:block;height:auto;border:0;width:122px;max-width:100%" title="Image" width="122"/></div></td></tr></table></td></tr></tbody></table></td></tr></tbody></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-4" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;background-color:#fff" width="100%"><tbody><tr><td><table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;color:#000;width:700px" width="700"><tbody><tr><td class="column column-1" style="mso-table-lspace:0;mso-table-rspace:0;font-weight:400;text-align:left;vertical-align:top;padding-top:40px;padding-bottom:40px;border-top:0;border-right:0;border-bottom:0;border-left:0" width="100%"><table border="0" cellpadding="0" cellspacing="0" class="image_block" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tr><td style="padding-bottom:15px;width:100%;padding-right:0;padding-left:0"><div align="center" style="line-height:10px"><img alt="Image" src="cid:logox" style="display:block;height:auto;border:0;width:148px;max-width:100%" title="Image" width="148"/></div></td></tr></table><table border="0" cellpadding="10" cellspacing="0" class="text_block" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;word-break:break-word" width="100%"><tr><td><div style="font-family:sans-serif"><div class="txtTinyMce-wrapper" style="font-size:12px;mso-line-height-alt:14.399999999999999px;color:#5beda6;line-height:1.2;font-family:Lato,Tahoma,Verdana,Segoe,sans-serif"><p style="margin:0;font-size:14px;text-align:center"><span style="font-size:16px;"><strong>My dish <a href=${process.env.APP_REACT}/ForgetPassword?email=${email}>reset password link</a></strong></span></p><p style="margin:0;font-size:14px;text-align:center"><span style="color:#333333;font-size:16px;">Best My dish support team</span></p></div></div></td></tr></table><table border="0" cellpadding="10" cellspacing="0" class="social_block" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tr><td><table align="center" border="0" cellpadding="0" cellspacing="0" class="social-table" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="148px"><tr><td style="padding:0 5px 0 0"><a href="https://twitter.com/" target="_blank"><img alt="Twitter" height="32" src="cid:twitter2x" style="display:block;height:auto;border:0" title="Twitter" width="32"/></a></td><td style="padding:0 5px 0 0"><a href="https://plus.google.com/" target="_blank"><img alt="Google+" height="32" src="cid:googleplus2x" style="display:block;height:auto;border:0" title="Google+" width="32"/></a></td><td style="padding:0 5px 0 0"><a href="https://www.youtube.com/" target="_blank"><img alt="YouTube" height="32" src="cid:youtube2x" style="display:block;height:auto;border:0" title="YouTube" width="32"/></a></td><td style="padding:0 5px 0 0"><a href="https://www.facebook.com/" target="_blank"><img alt="Facebook" height="32" src="cid:facebook2x" style="display:block;height:auto;border:0" title="Facebook" width="32"/>
      </a></td></tr></table></td></tr></table></td></tr></tbody></table></td></tr></tbody></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-5" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;background-color:#f4f4f4" width="100%"><tbody><tr><td><table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;color:#000;width:700px" width="700"><tbody><tr><td class="column column-1" style="mso-table-lspace:0;mso-table-rspace:0;font-weight:400;text-align:left;vertical-align:top;padding-top:25px;padding-bottom:25px;border-top:0;border-right:0;border-bottom:0;border-left:0" width="100%"><table border="0" cellpadding="10" cellspacing="0" class="text_block" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;word-break:break-word" width="100%"><tr><td><div style="font-family:sans-serif"><div class="txtTinyMce-wrapper" style="font-size:12px;mso-line-height-alt:14.399999999999999px;color:#555;line-height:1.2;font-family:Lato,Tahoma,Verdana,Segoe,sans-serif"><p style="margin:0;font-size:12px;text-align:center">All rights reserved © 2018 /  The Team</p></div></div></td></tr></table></td></tr></tbody></table></td></tr></tbody></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-6" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tbody>
      <tr><td><table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;color:#000;width:700px" width="700"><tbody><tr><td class="column column-1" style="mso-table-lspace:0;mso-table-rspace:0;font-weight:400;text-align:left;vertical-align:top;padding-top:5px;padding-bottom:5px;border-top:0;border-right:0;border-bottom:0;border-left:0" width="100%"><table border="0" cellpadding="0" cellspacing="0" class="icons_block" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tr><td style="vertical-align:middle;color:#9d9d9d;font-family:inherit;font-size:15px;padding-bottom:5px;padding-top:5px;text-align:center"><table cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tr><td style="vertical-align:middle;text-align:center">
      <!--[if vml]><table align="left" cellpadding="0" cellspacing="0" role="presentation" style="display:inline-block;padding-left:0px;padding-right:0px;mso-table-lspace: 0pt;mso-table-rspace: 0pt;"><![endif]--><!--[if !vml]><!--><table cellpadding="0" cellspacing="0" class="icons-inner" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;display:inline-block;margin-right:-4px;padding-left:0;padding-right:0"><!--<![endif]--><tr><td style="vertical-align:middle;text-align:center;padding-top:5px;padding-bottom:5px;padding-left:5px;padding-right:6px"><a href="https://www.designedwithbee.com/" style="text-decoration: none;" target="_blank"><img align="center" alt="Designed with BEE" class="icon" height="32" src="cid:bee" style="display:block;height:auto;margin:0 auto;border:0" width="34"/></a></td><td style="font-family:Lato,Tahoma,Verdana,Segoe,sans-serif;font-size:15px;color:#9d9d9d;vertical-align:middle;letter-spacing:undefined;text-align:center"></td></tr></table></td></tr></table></td></tr></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table><!-- End --></body></html>`;
      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // true for 465, false for other ports
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
        html: html, // html body
        attachments: [
          {
            filename: "logo.png",
            path: `${__dirname}/../utils/mailTemplate/logo.png`,
            cid: "logo@logo",
          },
          {
            filename: "illo_hero_transparent.png",
            path: `${__dirname}/../utils/mailTemplate/illo_hero_transparent.png`,
            cid: "illo_hero_transparent",
          },
          {
            filename: "gplay.gif",
            path: `${__dirname}/../utils/mailTemplate/gplay.gif`,
            cid: "gplay",
          },
          {
            filename: "appstore.png",
            path: `${__dirname}/../utils/mailTemplate/appstore.png`,
            cid: "appstore",
          },
          {
            filename: "logo.png",
            path: `${__dirname}/../utils/mailTemplate/logo.png`,
            cid: "logox",
          },
          {
            filename: "twitter2x.png",
            path: `${__dirname}/../utils/mailTemplate/twitter2x.png`,
            cid: "twitter2x",
          },
          {
            filename: "googleplus2x.png",
            path: `${__dirname}/../utils/mailTemplate/googleplus2x.png`,
            cid: "googleplus2x",
          },
          {
            filename: "youtube2x.png",
            path: `${__dirname}/../utils/mailTemplate/youtube2x.png`,
            cid: "youtube2x",
          },
          {
            filename: "facebook2x.png",
            path: `${__dirname}/../utils/mailTemplate/facebook2x.png`,
            cid: "facebook2x",
          },
          {
            filename: "bee.png",
            path: `${__dirname}/../utils/mailTemplate/bee.png`,
            cid: "bee",
          },
        ],
      });
      return `Message sent: %s ${info.messageId}`;
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
      let projection = {
        generalInfos: 0,
        login: 0,
        password: 0,
        menus: 0,
        services: 0,
        access: 0,
        moreInfos: 0,
        facturation: 0,
        abonnement: 0,
        imagesPresentations:0
      }
      let restaurant = await RestaurantModel.findOne(
        { _id: restaurantId },
        projection
      )
        .populate(
          "menusJours",
          "name description ingredients diatetic discount price imageUrl calories category type orders globalRating"
        )
        .populate("services")
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
        let sections = await SectionModel.find({}).lean();
        let sectionNames = sections.map(el=>el.name)
        console.log(sectionNames);
        if(sectionNames){
          sectionNames.map(item => {
            restaurant = {
              ...restaurant,
              [item]: null,
            };
          }) 
        }
        restaurant = {
          ...restaurant,
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
          all: [],
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
          items["all"] = items["all"].concat(restaurantProducts[key]);
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
