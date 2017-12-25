const mongoose = require('mongoose');
const db = require('./../config/mongoUri');

mongoose.Promise = global.Promise;
mongoose.connect(db, { useMongoClient: true });

module.exports = mongoose.connection;