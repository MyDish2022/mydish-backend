const AdminModel = require("../models/AdminModel");
const RatingModel = require("../models/RatingModel");
const UserModel = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const {
  AuthorizationError,
  NotFoundError,
  LimitEssay,
  AlreadyExistError,
  InternalError,
} = require("../errors/appError");
const { sign } = require("jsonwebtoken");
const TwilioService = require("../services/TwilioService");
const { AUTH_ROLES } = require("../middlewares/auth");
const nodemailer = require("nodemailer");
class AdminService {
  constructor() {}
  async createAdminAccount(body) {
    try {
      const admin =
        (await AdminModel.findOne({ email: body.email }).lean()) ||
        (await AdminModel.findOne({ firstName: body.firstName }).lean()) ||
        (await AdminModel.findOne({ lastName: body.lastName }).lean());
      if (admin) throw new AlreadyExistError("Admin already exist!");
      const { password } = body;
      const registeredAdmin = new AdminModel(body);
      registeredAdmin.password = bcrypt.hashSync(password, 12);
      registeredAdmin.passwordSalt = bcrypt.hashSync(password, 12);

      await registeredAdmin.save();
      return { admin: registeredAdmin };
    } catch (error) {
      throw error;
    }
  }
  static async generateAuthToken(admin) {
    const token = sign(
      { _id: admin._id, role: AUTH_ROLES.ADMIN },
      process.env.TOKEN_PASSWORD,
      {
        expiresIn: "7d",
      }
    );
    return token;
  }
  async getAllusers() {
    const projection = {
      firstName: true,
      lastName: true,
      address: true,
      postalCode: true,
      country: true,
      email: true,
    };
    try {
      const users = await UserModel.find({}, projection);
      return users;
    } catch (error) {
      throw error;
    }
  }
  async addUser(body) {
    try {
      let user =
        (await UserModel.findOne({ email: body.email }).lean()) ||
        (await UserModel.findOne({ firstName: body.firstName }).lean()) ||
        (await UserModel.findOne({ lastName: body.lastName }).lean());
      if (user) throw new AlreadyExistError();
      const { password } = body;
      const registredUser = new UserModel(body);
      registredUser.password = bcrypt.hashSync(password, 12);
      registredUser.passwordSalt = bcrypt.hashSync(password, 12);
      await registredUser.save();
      return { user: registredUser };
    } catch (error) {
      throw error;
    }
  }
  async verifyEmail({ email }) {
    try {
      let admin = await AdminModel.findOne({ email }).lean();
      return { verification: admin ? true : false };
    } catch (error) {
      throw error;
    }
  }
  async changePassword(body, admin) {
    const { password, newPassword } = body;
    try {
      let checkIfPasswordMatch = await bcrypt.compare(password, admin.password);
      if (!checkIfPasswordMatch) throw new AuthorizationError("wrong password");
      const updateQuery = {
        $set: {
          password: bcrypt.hashSync(newPassword, 12),
          passwordSalt: bcrypt.hashSync(newPassword, 12),
        },
      };
      await AdminModel.findOneAndUpdate({ _id: admin._id }, updateQuery);

      // new TwilioService().sendSms("Mot de passe changed Successfully!", admin.telephone);
      return { updated: "password changed successfully" };
    } catch (error) {
      throw error;
    }
  }
  async updateInformation(body, admin) {
    try {
      await AdminModel.findOneAndUpdate(
        { _id: admin._id },
        {
          $set: body,
        },
        { returnOriginal: false }
      ).lean();
      const newAdmin = await AdminModel.findById(admin.id || admin._id).lean();
      return newAdmin;
    } catch (error) {
      throw error;
    }
  }
  async removeUser({ userId }) {
    try {
      await UserModel.findByIdAndRemove({ _id: userId });
      return "user Removed Successfully!";
    } catch (error) {
      throw new InternalError(error.errors);
    }
  }
  async updateUserInfos(body, { userId }) {
    try {
      await UserModel.findOneAndUpdate(
        { _id: userId },
        {
          $set: body,
        },
        { returnOriginal: false }
      );
      return await UserModel.findById(userId).lean();
    } catch (error) {
      throw error;
    }
  }
  async forgetPassword(body) {
    const { email } = body;
    try {
      const admin = await AdminModel.findOne({ email }).lean();
      if (!admin) throw new NotFoundError("Admin not found");
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
        to: admin.email, // list of receivers
        subject: "Lien reset password", // Subject line
        text: "Hello world?", // plain text body
        html: html, // html body
      });
      return { msg: `Message sent: %s ${info.messageId}` };
    } catch (error) {
      throw new InternalError(error.errors);
    }
  }
  /*
  async changePasswordByEmail({email, newpassword}) {
    try {
      const updateQuery = {
        "$set": {
          "password": bcrypt.hashSync(newpassword, 12),
          "passwordSalt": bcrypt.hashSync(newpassword, 12),
        }
      };  
      return await UserModel.findOneAndUpdate({email: email}, updateQuery)
    } catch (error) {
      throw error
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
      await UserModel.findOneAndUpdate({_id:user._id}, updateQuery);
      return { msg: "phone number updated successfully" };
    } catch (error) {
      throw error;
    }
  }
  
  async forgetPassword(body){
    const {code, email} = body
    try {
      const user = await UserModel.findOne({email}).lean();
      let html = `<a href=${process.env.APP_REACT}/ForgetPassword?email=${email}> <h2>reset your password here </h2></a><br/> Best<br/> My dish support Team`;
      if(code === user.confirmOTP){
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
        return {msg: `Message sent: %s ${info.messageId}`}
      }
      return 'Wrong Code.'
    } catch (error) {
      throw error
    }
  }
  async creditCardAdd(body, user){
    try {
      await UserModel.findOneAndUpdate({_id: user.id}, {
        $addToSet: { creditCardInfos: body  } 
      })
      const renderedUser = await UserModel.findById(user.id);
      return {user: renderedUser}
    } catch (error) {
      throw error
    }
  }
  async creditCardRemove(cardId, user){
    try {
      await UserModel.findOneAndUpdate({_id: user.id}, {
        $pull: { creditCardInfos: {_id: cardId}  },
      },{ multi: true })
      const renderedUser = await UserModel.findById(user.id);
      return {user: renderedUser}
    } catch (error) {
      throw error
    }  
  }
  async creditCardAll(user){
    try {
      return {MyCreditCards: user.creditCardInfos}
    } catch (error) {
      throw error
    }  
  }
  async getUserRates({_id}){
    try {
      let user = await UserModel.findOne({_id}).populate('userRatings')
      return {MyRatings: user.userRatings}
    } catch (error) {
      throw error
    }  
  }
  
  async confirmSms({phone}) {
    try{
      const generatedCode = Math.floor(1000 + Math.random() * 9000);
      new TwilioService().sendSms(`Votre code du confirmation: ${generatedCode}`, phone.replace('+33',''))
      return {code: generatedCode};
    } catch (error) {
      throw error
    }
  } 
 
  async unbookmark(restaurantId, user){
    try {
      await UserModel.findOneAndUpdate({_id: user.id}, {
        $pull: { favoriteRestaurants: restaurantId },
      },{ multi: false }).populate('favoriteRestaurants').lean()
      return 'restaurant removed successfully!'
    } catch (error) {
      throw error
    }  
  }
  async bookmark(restaurantId, user){
    try {
      await UserModel.findOneAndUpdate({_id: user.id}, {
        $addToSet: { favoriteRestaurants: restaurantId  } 
      })
      return 'restaurant added successfully!'
    } catch (error) {
      throw error
    }  
  }*/
}
module.exports = AdminService;
