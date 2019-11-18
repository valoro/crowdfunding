const createError = require('http-errors');
const cors = require('cors');
const bodyParser = require('body-parser');
const logger = require('morgan');
const config = require('../config');
const routes = require('../api');

module.exports = (app) => {

    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(cors());

    app.use(config.api.prefix, routes());

    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        next(createError(404));
    });

    // error handler
    app.use(function (err, req, res, next) {
      // set locals, only providing error in development
      res.locals.message = err.message;
      res.locals.error = req.app.get('env') === 'development' ? err : {};

      // send the error page
      res.status(err.status || 500);
      res.send('error');
    });

};