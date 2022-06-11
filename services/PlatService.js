const PlatModel = require("../models/PlatModel");
const {
  AuthorizationError,
  NotFoundError,
  LimitEssay,
  AlreadyExistError,
  InternalError,
} = require("../errors/appError");
const generatePDF = require("../utils/generatePDF");
class PlatService {
  constructor() { }
  async addPlat(body) {
    try {
      const checkIfPlatExist = await PlatModel.findOne(body).lean();
      if (checkIfPlatExist) throw new AlreadyExistError("Plat already exist!");
      const registeredPlat = new PlatModel(body);
      await registeredPlat.save();
      return { Plat: registeredPlat };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async addPlatRestaurant(body, restaurant) {
    console.log(body);
    try {
      let platData = {};
      platData.name = body.nom;
      platData.price = parseInt(body.prix);
      platData.options = [
        { name: body.option, price: parseInt(body.prix_option) },
      ];
      platData.description = body.description;
      platData.restaurantId = restaurant._id;
      platData.imageUrl = body.image[0].thumbUrl;
      platData.type = body.sectionName;
      const registeredPlat = new PlatModel(platData);
      await registeredPlat.save();
      return registeredPlat;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getAllPlats({ section }) {
    let filterQuery = {};
    if (section) filterQuery = { ...filterQuery, type: section };
    try {
      const Plats = await PlatModel.find(filterQuery)
        .populate("type", "name")
        .lean();
      Plats.map((element) => {
        console.log(element);
      });

      return Plats;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async makePdfOfMeals({ section }, restaurant) {
    let filterQuery = {};
    let platsStrings = "<tr>";
    if (section) filterQuery = { ...filterQuery, type: section, restaurantId : restaurant._id };
    try {

      const Plats = await PlatModel.find(filterQuery)
        .populate("type", "name")
        .lean();
      Plats&&Plats.map((element, index) => {
        if (index % 3 === 0) {
          platsStrings += `</tr><tr>`;
          
        }
        platsStrings += `
     
       <td class="column column-3" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; background-color: #f4a737; border-bottom: 0px solid #FFFFFF; border-left: 8px solid #FFFFFF; border-right: 8px solid #FFFFFF; border-top: 0px solid #FFFFFF;" width="33.333333333333336%">
         <table border="0" cellpadding="0" cellspacing="0" class="image_block" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
         <tr>
         <td style="width:100%;padding-right:0px;padding-left:0px;">
         <div align="center" style="line-height:10px"><img alt="Photo Menu " class="fullMobileWidth big" src="${element.imageUrl}" style="display: block; height: auto; border: 0; width: 211px; max-width: 100%;" title="Photo Menu " width="211"/></div>
         </td>
         </tr>
         </table>
         <table border="0" cellpadding="0" cellspacing="0" class="text_block" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
         <tr>
         <td style="padding-bottom:10px;">
         <div style="font-family: sans-serif">
         <div class="txtTinyMce-wrapper" style="font-size: 12px; mso-line-height-alt: 14.399999999999999px; color: #f9f9f9; line-height: 1.2; font-family: Helvetica Neue, Helvetica, Arial, sans-serif;">
         <p style="margin: 0; text-align: center;"><strong><span style="font-size:22px;"><span style="">${element.name}</span></span></strong></p>
         </div>
         </div>
         </td>
         </tr>
         </table>
         <table border="0" cellpadding="0" cellspacing="0" class="text_block" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
         <tr>
         <td style="padding-bottom:10px;">
         <div style="font-family: sans-serif">
         <div class="txtTinyMce-wrapper" style="font-size: 12px; mso-line-height-alt: 14.399999999999999px; color: #f9f9f9; line-height: 1.2; font-family: Helvetica Neue, Helvetica, Arial, sans-serif;">
         <p style="margin: 0; text-align: center;"><span style="font-size:20px;"><span style="">- ${element.price} € -</span></span></p>
         </div>
         </div>
         </td>
         </tr>
         </table>
         <table border="0" cellpadding="0" cellspacing="0" class="text_block" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
         <tr>
         <td style="padding-bottom:10px;padding-left:20px;padding-right:20px;padding-top:10px;">
         <div style="font-family: sans-serif">
         <div class="txtTinyMce-wrapper" style="font-size: 12px; mso-line-height-alt: 18px; color: #393d47; line-height: 1.5; font-family: Helvetica Neue, Helvetica, Arial, sans-serif;">
         <p style="margin: 0; text-align: center; mso-line-height-alt: 24px;"><span style="font-size:16px;">${element.description}</span></p>
         </div>
         </div>
         </td>
         </tr>
         </table>
         
         </td>
       
     `
      });
      let htmlTemplate = `<!DOCTYPE html>

      <html lang="en" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml">
      <head>
      </head>
      <body>
      <table border="0" cellpadding="0" cellspacing="0" class="nl-container" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #b8a890;" width="100%">
      <tbody>
      <tr>
      <td>
      <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-1" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #b8a890; background-image: url('images/Hero-background-1.png'); background-position: center top; background-repeat: no-repeat;" width="100%">
      <tbody>
      <tr>
      <td>
      <table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 680px;" width="680">
      <tbody>
      <tr>
      <td>
      <table border="0" cellpadding="0" cellspacing="0" class="text_block" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
      <tr>
      <td >
      <div style="font-family: Verdana, sans-serif">
      <div class="txtTinyMce-wrapper" style="font-size: 12px; font-family: Verdana, Geneva, sans-serif; mso-line-height-alt: 14.399999999999999px; color: #f4a737; line-height: 1.2;">
      <p style="margin: 0; font-size: 14px; text-align: center;"><span style="font-size:80px;"><strong>MY DISH</strong></span></p>
      </div>
      </div>
      </td>
      </tr>
      </table>
      </td>
      </tr>
      </tbody>
      </table>
      </td>
      </tr>
      </tbody>
      </table>
      <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-2" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
      <tbody>
      <tr>
      <td>
      <table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #1a1a1a; color: #000000; width: 680px;" width="680">
      <tbody>
      <tr>
      <td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 0px; padding-bottom: 0px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
      <table border="0" cellpadding="0" cellspacing="0" class="text_block" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
      <tr>
      <td style="padding-bottom:35px;padding-left:20px;padding-right:20px;padding-top:50px;">
      <div style="font-family: sans-serif">
      <div class="txtTinyMce-wrapper" style="font-size: 12px; mso-line-height-alt: 18px; color: #f9f9f9; line-height: 1.5; font-family: Helvetica Neue, Helvetica, Arial, sans-serif;">
      <p style="margin: 0; text-align: center; mso-line-height-alt: 24px;"><span style="font-size:16px;">Vous trouverez ci-joint la liste des plats</span></p>
      </div>
      </div>
      </td>
      </tr>
      </table>
      </td>
      </tr>
      </tbody>
      </table>
      </td>
      </tr>
      </tbody>
      </table>
      <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-3" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
      <tbody>
      <tr>
      <td>
      <table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff; color: #000000; width: 680px;" width="680">
      <tbody>
      <tr>
      <td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 0px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
      <table border="0" cellpadding="0" cellspacing="0" class="image_block" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
      <tr>
      <td style="width:100%;padding-right:0px;padding-left:0px;">
      <div align="center" style="line-height:10px"><img alt="Arrow" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAATCAYAAAGLjU8mAAAAAXNSR0IArs4c6QAAAVtJREFUSA3FlkFugzAURGNQD5AtCIll9iRHyLoH7aYHyS0QsGzX2SSM1UG2sc03kBQJOfbMf38gGKGapvkYhuF+cA8IRVE8cFoaBC4oV1VK/SqoFLDQdd2RFYeyLH840c5ggtHFam1klVlAA7VZIArmaAU0Bf7u+15NLXklFDHCgHEyYWIaacD67DCNFDXJvDIKKSPvhhUrFUoIG1swLi5BXQjrvDCKLjQEoV80Aiox4sn5Ho2fEnPMk+f5RV/mViBAbdvepnu2FkgQUk8wTFKBJmgGSwG6IC9MAvSBgrAYMASKwnzAGAj+xQN/yng+qqo6L5olhrquTxKffjT+9uDXWLB5J0iahjzY+1mWXa0NAPN/BTQDMbS1mbj4roC+QMzgDUbxVQFjgdg7GoymvQJKArGnKBjNawOmBGKvpGAskgZcE4g9VgVjcSjglkBk7zIiIN7E+Fzd6038BAf6w0maPonGAAAAAElFTkSuQmCC" style="display: block; height: auto; border: 0; width: 38px; max-width: 100%;" title="Arrow" width="38"/></div>
      </td>
      </tr>
      </table>
      </td>
      </tr>
      </tbody>
      </table>
      </td>
      </tr>
      </tbody>
      </table>
      <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-4" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
      <tbody>
      <tr>
      <td>
      <table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff; color: #000000; width: 680px;" width="680">
      <tbody>
      <tr>
      <td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
      <table border="0" cellpadding="0" cellspacing="0" class="text_block" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
      <tr>
      <td style="padding-bottom:10px;padding-left:10px;padding-right:10px;padding-top:50px;">
      <div style="font-family: sans-serif">
      <div class="txtTinyMce-wrapper" style="font-size: 12px; mso-line-height-alt: 18px; color: #393d47; line-height: 1.5; font-family: Helvetica Neue, Helvetica, Arial, sans-serif;">
      <p style="margin: 0; text-align: center; mso-line-height-alt: 36px;"><span style="font-size:24px;">Section "${section? section : ''}"</span></p>
      </div>
      </div>
      </td>
      </tr>
      </table>
      </td>
      </tr>
      </tbody>
      </table>
      </td>
      </tr>
      </tbody>
      </table>
      
      <table align="center" border="0" cellpadding="0" cellspacing="0" class="row row-6" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
      <tbody>
      <tr>
      <td>
      <table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff; color: #000000; width: 680px;" width="680">
      <tbody>
      
        
      ${platsStrings}
      </tr>
      </tbody>
      </table>
      </td>
      </tr>
      </tbody>
      </table>
      
      </table>
      </td>
      </tr>
      </tbody>
      </table><!-- End -->
      </body>
      </html>`


      const pdf = await generatePDF(htmlTemplate);
      return pdf;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getAllPlatsByRestaurant({ restaurantId }) {
    try {
      const Plats = await PlatModel.find({ restaurantId })
        .populate("type", "name")
        .lean();
      return Plats;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async removePlat({ platId }) {
    try {
      let Plat = await PlatModel.findOne({ _id: platId }).lean();
      if (!Plat) throw new NotFoundError();
      await PlatModel.findByIdAndRemove({ _id: platId }).lean();
      return { info: "Plat removed" };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async updatePlat(body, { platId }) {
    try {
      let Plat = await PlatModel.findOne({ _id: platId }).lean();
      if (!Plat) throw new NotFoundError();
      await PlatModel.findOneAndUpdate(
        { _id: platId },
        {
          $set: body,
        },
        { returnOriginal: false }
      ).lean();
      const newPlat = await PlatModel.findById(platId).lean();
      return newPlat;
    } catch (error) {
      throw error;
    }
  }
}
module.exports = PlatService;
