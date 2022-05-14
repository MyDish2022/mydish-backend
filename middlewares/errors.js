const appError = require("../errors/appError");

/**
 * Error handler.
 */

function handler(err, req, res, next) {
  const errors = [];
  if (err instanceof appError) {
    errors.push(err.toJson());
    return res.status(err.status).json({ errors });
  }

  // default to 500 server error
  res.status(500).json({
    errors: [
      {
        code: "internal_server_error",
        message: err.message,
      },
    ],
  });

  next();
  return false;
}
module.exports = handler;
