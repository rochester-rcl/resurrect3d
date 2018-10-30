const config = {
  mongoURL: process.env.MONGO_URL || 'mongodb://localhost:27017/mydb',
  port: process.env.PORT || 3001
};

module.exports = config;
