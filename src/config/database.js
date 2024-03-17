const mongoose = require('mongoose');

const logger = require('../utils/logger')('DATABASE');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://cs-server-db:27017/cs-server', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.res({msg: 'MongoDB Connected'});
  } catch (err) {
    logger.res({msg: 'MongoDB connection error:', error: err.message});
    process.exit(1);
  }
};

module.exports = connectDB;