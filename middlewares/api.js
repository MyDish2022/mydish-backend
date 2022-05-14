const catchMiddleware = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((e) => {
    if (process.env.NODE_ENV !== "production") console.log(e);
    next(e);
  });
};
module.exports = catchMiddleware;
