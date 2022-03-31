import jwt from 'jsonwebtoken'

import logger from '../logger.js'

const tokenSign = async (user) => {
  return jwt.sign(
    {
      _id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "6h",
    }
  );
};

const verifyToken = async (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return null;
  }
};

const authJWT = async (req, res, next) => {
  try {
      if(!req.headers.authorization){
          res.json({ error: "NO posees un token"})
          return
      }
  
      const token = req.headers.authorization.split(" ").pop()

      const dataToken = await verifyToken(token)

      if(!dataToken._id){
          res.json({ error: "Token id invalido"})
      }

      req.user = {
        id: dataToken._id,
        rol: dataToken.role 
      }
      next()
  } catch (error) {
      logger.error(error)
  }
}

// Borrar
const decodeSign = (token) => {
  return jwt.decode(token, null);
};

export { tokenSign, decodeSign, verifyToken, authJWT };