const http = require("http");
var createError = require('http-errors')
require("dotenv").config();
var express = require('express');
var path = require('path');
const cors = require('cors');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require("./config/database").connect();
var indexRouter = require('./routes/index');
var app = express();
const server = http.createServer(app);
const jsonErrorHandler = async (err, req, res, next) => {
  res.status(500).json({ error: err });
}
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
  next();
});
 
const corsOptions = {
  exposedHeaders: 'Content-Disposition',
};
app.use(cors(corsOptions))

app.use(jsonErrorHandler)
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'jade');
app.use('/', indexRouter);
app.use('/image', express.static(path.join(__dirname, 'uploads')))
// catch 404 and forward to error handler

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  //res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  //res.status(err.status || 500);
  res.render('error');
});
server.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${5000}`);
});
