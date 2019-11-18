const passport = require('passport');
const auth = require('../api/middlewares/auth');

module.exports = app => {
    app.use(passport.initialize());
    app.use(passport.session());
    auth(passport);
};