const { verifyAccessToken } = require('../utils/jwt');

const authenticateToken = (req, res, next) => {
  const token = req.cookies.accessToken;
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const decoded = verifyAccessToken(token);
  
  if (!decoded) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
  
  req.userId = decoded.userId;
  next();
};

module.exports = { authenticateToken };