const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const ROUTES = require('./config/ROUTES');
const fileUpload = require('express-fileupload');
const fs = require('fs');

const app = express();

app.use(fileUpload());

function setRoutes(app) {
    app.use(ROUTES.index.path, require(ROUTES.index.handler));
    app.use(ROUTES.users.path, require(ROUTES.users.handler));
    app.use(ROUTES.request.path, require(ROUTES.request.handler));
    app.use(ROUTES.result.path, require(ROUTES.result.handler));
    app.use(ROUTES.readerRequest.path, require(ROUTES.readerRequest.handler));
    app.use(ROUTES.resultReader.path, require(ROUTES.resultReader.handler));
    // app.use('/excelReader', require(ROUTES.resultReader.handler));
}

// view engine setup
function viewEngineSetup(app) {
    const directoryName = 'views';
    app.set(directoryName, path.join(__dirname, directoryName));
    app.set('view engine', 'ejs');
}

// view engine setup
viewEngineSetup(app);

app.use(logger('dev'));
// app.use(logger('common', {stream: fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'})}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

setRoutes(app);

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
  res.render(ROUTES.error.template);
});

module.exports = app;
