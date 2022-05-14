const UserModel = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const { sign } = require("jsonwebtoken");
const { AuthorizationError, NotFoundError } = require("../errors/appError");
const client = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
class TwilioService {
  constructor() {}
  async sendSms(message, telephone) {
    const handleMessage = await client.messages.create({
      body: message,
      from: `${process.env.SMS_FROM}`,
      to: `+33${telephone}`,
    });
    console.log(handleMessage);
  }
}
module.exports = TwilioService;
