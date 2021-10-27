const jwt= require('jsonwebtoken');
const dotenv = require('dotenv');
const {
    errorMessage, status,
  }=require('../helpers/status');

const env = require('../../env');

dotenv.config();


const verifyToken = async (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    const bearer = bearerHeader.split(' ');
    const token = bearer[1];
    if (!token) {
      errorMessage.error = 'Token not provided';
      return res.status(status.bad).send(errorMessage);
    }
    try {
      const decoded =  jwt.verify(token, process.env.SECRET);
      req.user = {
        email: decoded.email,
        user_id: decoded.user_id,
        is_admin: decoded.is_admin,
        phone_no: decoded.phone_no,
        name : decoded.name
      };
      next();
    } catch (error) {
      errorMessage.error = 'Authentication Failed';
      return res.status(status.unauthorized).send(errorMessage);
    }
  };
  
module.exports = verifyToken;