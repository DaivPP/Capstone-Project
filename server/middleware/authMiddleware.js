const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Ensure the object has userId
    req.user = { userId: decoded.userId };
    console.log("Decoded JWT in middleware:", req.user);
    next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    res.status(401).json({ error: 'Invalid token' });
  }
};
