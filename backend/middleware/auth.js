const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // We configured the frontend Axios to send credentials (cookies)
    // The cookie parser middleware in server.js makes this available
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token found. Please log in.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info (like id) to request object
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = authMiddleware;
