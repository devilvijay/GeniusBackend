const dotenv= require('dotenv');

dotenv.config();

module.exports= {
  database_url: process.env.DATABASE_URL,
  secret: process.env.SECRET,
  port: process.env.PORT || 3000,
  accountSid: process.env.accountSid,
  authToken: process.env.authToken
};