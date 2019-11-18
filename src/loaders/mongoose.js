const mongoose = require('mongoose');
const config = require('../config');

module.exports = async () => {
    mongoose.connect(`mongodb+srv://${config.dbUserName}:${config.dbPassword}@${config.dbName}-fe03b.mongodb.net/${config.dbUserName}`, { useNewUrlParser: true , useUnifiedTopology: true , useFindAndModify: false})
    .then(() => {
        return true;
    })
    .catch(err => {
        throw err;
    })
};