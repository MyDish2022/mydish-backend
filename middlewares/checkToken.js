const { AuthorizationError, NotFoundError } = require("../errors/appError");
const UserModel = require("../models/UserModel");

exports.auth = async (req, res, next) => {
  let token = req.headers["x-access-token"] || req.headers.authorization;
  if (token && token.startsWith("Bearer ")) {
    console.log(token);
    token = token.slice(7, token.length);
  }
  if (!token) {
    next(new AuthorizationError());
  }
  try {
    const data = jwt.verify(token, process.env.TOKEN_PASSWORD);
    const user = await UserModel.findOne({ _id: data._id });
    if (!user) {
      throw new NotFoundError("Utilisateur introuvable");
    }
    req.user = user;
    next();
  } catch (error) {
    next(new AuthorizationError(error.message));
  }
};
