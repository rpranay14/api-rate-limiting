var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose=require("mongoose");
const imageRouter=require('./routes/image')
require('dotenv').config();
const cors = require("cors");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const subscriptionRouter = require('./routes/subscription');
const paymentRouter = require('./routes/payment');
const corsOptions = require('./config/corsOptions');
const rateLimiter = require('./routes/middleware/rateLimiter');

var app = express();

mongoose.connect(process.env.MONGODB_URL, {useNewUrlParser: true,

  useUnifiedTopology: true})
.then(()=>{
console.log("Database Connection Successful")
})
.catch((error)=>{
  console.log(error,"Some error occured in database connection")
})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(rateLimiter);
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/uploadimage',imageRouter);
app.use("/subscription",subscriptionRouter);
app.use('/payment',paymentRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
