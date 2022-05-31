const Order = require("../models/OrderModel");
const Product = require("../models/ProductModel");
const productOrderSchema = require("../models/ProductOrderSchema");
const userModel = require("../models/UserModel");
const PlatModel = require("../models/PlatModel");
const serviceModel = require("../models/ServiceModel");
const promoCode = require("../models/PromoCodeModel");
const StripeService = require("./StripeService");
const nodemailer = require("nodemailer");
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
      let html = `<!DOCTYPE html>
      <html lang="en" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml"><head><title></title><meta content="text/html; charset=utf-8" http-equiv="Content-Type"/><meta content="width=device-width,initial-scale=1" name="viewport"/><!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]--><!--[if !mso]><!--><link href="https://fonts.googleapis.com/css?family=Chivo" rel="stylesheet" type="text/css"/><link href="https://fonts.googleapis.com/css?family=Lato" rel="stylesheet" type="text/css"/><!--<![endif]--><style>
      *{box-sizing:border-box}body{margin:0;padding:0}a[x-apple-data-detectors]{color:inherit!important;text-decoration:inherit!important}#MessageViewBody a{color:inherit;text-decoration:none}p{line-height:inherit}.desktop_hide,.desktop_hide table{mso-hide:all;display:none;max-height:0;overflow:hidden}@media (max-width:720px){.desktop_hide table.icons-inner{display:inline-block!important}.icons-inner{text-align:center}.icons-inner td{margin:0 auto}.row-content{width:100%!important}.column .border,.mobile_hide{display:none}table{table-layout:fixed!important}.stack .column{width:100%;display:block}.mobile_hide{min-height:0;max-height:0;max-width:0;overflow:hidden;font-size:0}.desktop_hide,.desktop_hide table{display:table!important;max-height:none!important}}
      </style></head><body style="background-color:#fff;margin:0;padding:0;-webkit-text-size-adjust:none;text-size-adjust:none"><table border="0" cellpadding="0" cellspacing="0" class="nl-container" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;background-color:#fff" width="100%"><tbody><tr><td><table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-1" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;background-image:url(images/bg_hero_illo.jpg);background-repeat:repeat" width="100%"><tbody><tr><td><table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;color:#000;width:700px" width="700"><tbody><tr><td class="column column-1" style="mso-table-lspace:0;mso-table-rspace:0;font-weight:400;text-align:left;vertical-align:top;padding-top:60px;padding-bottom:0;border-top:0;border-right:0;border-bottom:0;border-left:0" width="100%"><table border="0" cellpadding="0" cellspacing="0" class="image_block" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tr><td style="width:100%;padding-right:0;padding-left:0"><div align="center" style="line-height:10px"><img alt="Image" src="cid:logo@logo" style="display:block;height:auto;border:0;width:140px;max-width:100%" title="Image" width="140"/></div></td></tr></table><table border="0" cellpadding="0" cellspacing="0" class="text_block" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;word-break:break-word" width="100%"><tr><td style="padding-bottom:35px;padding-left:10px;padding-right:10px;padding-top:10px"><div style="font-family:Arial,sans-serif"><div class="txtTinyMce-wrapper" style="font-family:Chivo,Arial,Helvetica,sans-serif;font-size:12px;mso-line-height-alt:14.399999999999999px;color:#5beda6;line-height:1.2"><p style="margin:0;text-align:center;font-size:12px"><span style="font-size:12px;"><span style="font-size:88px;"><strong>My dish </strong></span></span></p></div></div></td></tr></table><table border="0" cellpadding="0" cellspacing="0" class="image_block" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tr><td style="width:100%;padding-right:0;padding-left:0"><div align="center" style="line-height:10px"><img alt="Image" src="cid:illo_hero_transparent" style="display:block;height:auto;border:0;width:587px;max-width:100%" title="Image" width="587"/></div></td></tr></table></td></tr></tbody></table></td></tr></tbody></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-2" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tbody><tr><td><table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;color:#000;width:700px" width="700"><tbody><tr><td class="column column-1" style="mso-table-lspace:0;mso-table-rspace:0;font-weight:400;text-align:left;vertical-align:top;padding-left:25px;padding-right:25px;padding-top:25px;padding-bottom:25px;border-top:0;border-right:0;border-bottom:0;border-left:0" width="100%"><table border="0" cellpadding="0" cellspacing="0" class="text_block" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;word-break:break-word" width="100%"><tr><td style="padding-bottom:10px;padding-left:40px;padding-right:40px;padding-top:10px"><div style="font-family:Tahoma,Verdana,sans-serif"><div class="txtTinyMce-wrapper" style="font-size:12px;font-family:Lato,Tahoma,Verdana,Segoe,sans-serif;mso-line-height-alt:18px;color:#555;line-height:1.5"><p style="margin:0;font-size:14px;text-align:center;mso-line-height-alt:27px"><span style="font-size:18px;">Merci d'uiliser le service du my dish</span></p></div></div></td></tr></table></td></tr></tbody></table></td></tr></tbody></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-3" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;background-color:#9ef2c3" width="100%"><tbody><tr><td><table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;color:#333;width:700px" width="700"><tbody><tr><td class="column column-1" style="mso-table-lspace:0;mso-table-rspace:0;font-weight:400;text-align:left;vertical-align:top;border-top:0;border-right:0;border-bottom:0;border-left:0" width="50%"><table border="0" cellpadding="0" cellspacing="0" class="image_block" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tr><td style="padding-right:20px;width:100%;padding-left:0;padding-top:5px;padding-bottom:45px"><div align="right" style="line-height:10px"><img alt="Image" src="cid:gplay" style="display:block;height:auto;border:0;width:122px;max-width:100%" title="Image" width="122"/></div></td></tr></table></td><td class="column column-2" style="mso-table-lspace:0;mso-table-rspace:0;font-weight:400;text-align:left;vertical-align:top;border-top:0;border-right:0;border-bottom:0;border-left:0" width="50%"><table border="0" cellpadding="0" cellspacing="0" class="image_block" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tr><td style="padding-left:20px;width:100%;padding-right:0;padding-top:5px;padding-bottom:5px"><div style="line-height:10px"><img alt="Image" src="cid:appstore" style="display:block;height:auto;border:0;width:122px;max-width:100%" title="Image" width="122"/></div></td></tr></table></td></tr></tbody></table></td></tr></tbody></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-4" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;background-color:#fff" width="100%"><tbody><tr><td><table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;color:#000;width:700px" width="700"><tbody><tr><td class="column column-1" style="mso-table-lspace:0;mso-table-rspace:0;font-weight:400;text-align:left;vertical-align:top;padding-top:40px;padding-bottom:40px;border-top:0;border-right:0;border-bottom:0;border-left:0" width="100%"><table border="0" cellpadding="0" cellspacing="0" class="image_block" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tr><td style="padding-bottom:15px;width:100%;padding-right:0;padding-left:0"><div align="center" style="line-height:10px"><img alt="Image" src="cid:logox" style="display:block;height:auto;border:0;width:148px;max-width:100%" title="Image" width="148"/></div></td></tr></table><table border="0" cellpadding="10" cellspacing="0" class="text_block" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;word-break:break-word" width="100%"><tr><td><div style="font-family:sans-serif"><div class="txtTinyMce-wrapper" style="font-size:12px;mso-line-height-alt:14.399999999999999px;color:#5beda6;line-height:1.2;font-family:Lato,Tahoma,Verdana,Segoe,sans-serif"><p style="margin:0;font-size:14px;text-align:center"><span style="font-size:16px;"><strong>Votre commande à été passé avec succèes</strong></span></p><p style="margin:0;font-size:14px;text-align:center"><span style="color:#333333;font-size:16px;">Best My dish support team</span></p></div></div></td></tr></table><table border="0" cellpadding="10" cellspacing="0" class="social_block" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tr><td><table align="center" border="0" cellpadding="0" cellspacing="0" class="social-table" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="148px"><tr><td style="padding:0 5px 0 0"><a href="https://twitter.com/" target="_blank"><img alt="Twitter" height="32" src="cid:twitter2x" style="display:block;height:auto;border:0" title="Twitter" width="32"/></a></td><td style="padding:0 5px 0 0"><a href="https://plus.google.com/" target="_blank"><img alt="Google+" height="32" src="cid:googleplus2x" style="display:block;height:auto;border:0" title="Google+" width="32"/></a></td><td style="padding:0 5px 0 0"><a href="https://www.youtube.com/" target="_blank"><img alt="YouTube" height="32" src="cid:youtube2x" style="display:block;height:auto;border:0" title="YouTube" width="32"/></a></td><td style="padding:0 5px 0 0"><a href="https://www.facebook.com/" target="_blank"><img alt="Facebook" height="32" src="cid:facebook2x" style="display:block;height:auto;border:0" title="Facebook" width="32"/>
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
        subject: "Order passé avec succées", // Subject line
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

      let html = `<!DOCTYPE html>
      <html lang="en" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml"><head><title></title><meta content="text/html; charset=utf-8" http-equiv="Content-Type"/><meta content="width=device-width,initial-scale=1" name="viewport"/><!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]--><!--[if !mso]><!--><link href="https://fonts.googleapis.com/css?family=Chivo" rel="stylesheet" type="text/css"/><link href="https://fonts.googleapis.com/css?family=Lato" rel="stylesheet" type="text/css"/><!--<![endif]--><style>
      *{box-sizing:border-box}body{margin:0;padding:0}a[x-apple-data-detectors]{color:inherit!important;text-decoration:inherit!important}#MessageViewBody a{color:inherit;text-decoration:none}p{line-height:inherit}.desktop_hide,.desktop_hide table{mso-hide:all;display:none;max-height:0;overflow:hidden}@media (max-width:720px){.desktop_hide table.icons-inner{display:inline-block!important}.icons-inner{text-align:center}.icons-inner td{margin:0 auto}.row-content{width:100%!important}.column .border,.mobile_hide{display:none}table{table-layout:fixed!important}.stack .column{width:100%;display:block}.mobile_hide{min-height:0;max-height:0;max-width:0;overflow:hidden;font-size:0}.desktop_hide,.desktop_hide table{display:table!important;max-height:none!important}}
      </style></head><body style="background-color:#fff;margin:0;padding:0;-webkit-text-size-adjust:none;text-size-adjust:none"><table border="0" cellpadding="0" cellspacing="0" class="nl-container" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;background-color:#fff" width="100%"><tbody><tr><td><table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-1" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;background-image:url(images/bg_hero_illo.jpg);background-repeat:repeat" width="100%"><tbody><tr><td><table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;color:#000;width:700px" width="700"><tbody><tr><td class="column column-1" style="mso-table-lspace:0;mso-table-rspace:0;font-weight:400;text-align:left;vertical-align:top;padding-top:60px;padding-bottom:0;border-top:0;border-right:0;border-bottom:0;border-left:0" width="100%"><table border="0" cellpadding="0" cellspacing="0" class="image_block" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tr><td style="width:100%;padding-right:0;padding-left:0"><div align="center" style="line-height:10px"><img alt="Image" src="cid:logo@logo" style="display:block;height:auto;border:0;width:140px;max-width:100%" title="Image" width="140"/></div></td></tr></table><table border="0" cellpadding="0" cellspacing="0" class="text_block" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;word-break:break-word" width="100%"><tr><td style="padding-bottom:35px;padding-left:10px;padding-right:10px;padding-top:10px"><div style="font-family:Arial,sans-serif"><div class="txtTinyMce-wrapper" style="font-family:Chivo,Arial,Helvetica,sans-serif;font-size:12px;mso-line-height-alt:14.399999999999999px;color:#5beda6;line-height:1.2"><p style="margin:0;text-align:center;font-size:12px"><span style="font-size:12px;"><span style="font-size:88px;"><strong>My dish </strong></span></span></p></div></div></td></tr></table><table border="0" cellpadding="0" cellspacing="0" class="image_block" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tr><td style="width:100%;padding-right:0;padding-left:0"><div align="center" style="line-height:10px"><img alt="Image" src="cid:illo_hero_transparent" style="display:block;height:auto;border:0;width:587px;max-width:100%" title="Image" width="587"/></div></td></tr></table></td></tr></tbody></table></td></tr></tbody></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-2" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tbody><tr><td><table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;color:#000;width:700px" width="700"><tbody><tr><td class="column column-1" style="mso-table-lspace:0;mso-table-rspace:0;font-weight:400;text-align:left;vertical-align:top;padding-left:25px;padding-right:25px;padding-top:25px;padding-bottom:25px;border-top:0;border-right:0;border-bottom:0;border-left:0" width="100%"><table border="0" cellpadding="0" cellspacing="0" class="text_block" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;word-break:break-word" width="100%"><tr><td style="padding-bottom:10px;padding-left:40px;padding-right:40px;padding-top:10px"><div style="font-family:Tahoma,Verdana,sans-serif"><div class="txtTinyMce-wrapper" style="font-size:12px;font-family:Lato,Tahoma,Verdana,Segoe,sans-serif;mso-line-height-alt:18px;color:#555;line-height:1.5"><p style="margin:0;font-size:14px;text-align:center;mso-line-height-alt:27px"><span style="font-size:18px;">Merci d'uiliser le service du my dish</span></p></div></div></td></tr></table></td></tr></tbody></table></td></tr></tbody></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-3" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;background-color:#9ef2c3" width="100%"><tbody><tr><td><table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;color:#333;width:700px" width="700"><tbody><tr><td class="column column-1" style="mso-table-lspace:0;mso-table-rspace:0;font-weight:400;text-align:left;vertical-align:top;border-top:0;border-right:0;border-bottom:0;border-left:0" width="50%"><table border="0" cellpadding="0" cellspacing="0" class="image_block" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tr><td style="padding-right:20px;width:100%;padding-left:0;padding-top:5px;padding-bottom:45px"><div align="right" style="line-height:10px"><img alt="Image" src="cid:gplay" style="display:block;height:auto;border:0;width:122px;max-width:100%" title="Image" width="122"/></div></td></tr></table></td><td class="column column-2" style="mso-table-lspace:0;mso-table-rspace:0;font-weight:400;text-align:left;vertical-align:top;border-top:0;border-right:0;border-bottom:0;border-left:0" width="50%"><table border="0" cellpadding="0" cellspacing="0" class="image_block" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tr><td style="padding-left:20px;width:100%;padding-right:0;padding-top:5px;padding-bottom:5px"><div style="line-height:10px"><img alt="Image" src="cid:appstore" style="display:block;height:auto;border:0;width:122px;max-width:100%" title="Image" width="122"/></div></td></tr></table></td></tr></tbody></table></td></tr></tbody></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-4" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;background-color:#fff" width="100%"><tbody><tr><td><table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;color:#000;width:700px" width="700"><tbody><tr><td class="column column-1" style="mso-table-lspace:0;mso-table-rspace:0;font-weight:400;text-align:left;vertical-align:top;padding-top:40px;padding-bottom:40px;border-top:0;border-right:0;border-bottom:0;border-left:0" width="100%"><table border="0" cellpadding="0" cellspacing="0" class="image_block" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tr><td style="padding-bottom:15px;width:100%;padding-right:0;padding-left:0"><div align="center" style="line-height:10px"><img alt="Image" src="cid:logox" style="display:block;height:auto;border:0;width:148px;max-width:100%" title="Image" width="148"/></div></td></tr></table><table border="0" cellpadding="10" cellspacing="0" class="text_block" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0;word-break:break-word" width="100%"><tr><td><div style="font-family:sans-serif"><div class="txtTinyMce-wrapper" style="font-size:12px;mso-line-height-alt:14.399999999999999px;color:#5beda6;line-height:1.2;font-family:Lato,Tahoma,Verdana,Segoe,sans-serif"><p style="margin:0;font-size:14px;text-align:center"><span style="font-size:16px;"><strong>Votre commande à été passé avec succèes</strong></span></p><p style="margin:0;font-size:14px;text-align:center"><span style="color:#333333;font-size:16px;">Best My dish support team</span></p></div></div></td></tr></table><table border="0" cellpadding="10" cellspacing="0" class="social_block" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="100%"><tr><td><table align="center" border="0" cellpadding="0" cellspacing="0" class="social-table" role="presentation" style="mso-table-lspace:0;mso-table-rspace:0" width="148px"><tr><td style="padding:0 5px 0 0"><a href="https://twitter.com/" target="_blank"><img alt="Twitter" height="32" src="cid:twitter2x" style="display:block;height:auto;border:0" title="Twitter" width="32"/></a></td><td style="padding:0 5px 0 0"><a href="https://plus.google.com/" target="_blank"><img alt="Google+" height="32" src="cid:googleplus2x" style="display:block;height:auto;border:0" title="Google+" width="32"/></a></td><td style="padding:0 5px 0 0"><a href="https://www.youtube.com/" target="_blank"><img alt="YouTube" height="32" src="cid:youtube2x" style="display:block;height:auto;border:0" title="YouTube" width="32"/></a></td><td style="padding:0 5px 0 0"><a href="https://www.facebook.com/" target="_blank"><img alt="Facebook" height="32" src="cid:facebook2x" style="display:block;height:auto;border:0" title="Facebook" width="32"/>
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
        subject: "Order passé avec succées", // Subject line
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
