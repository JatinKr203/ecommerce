const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
  try {
    // 1. Read the token directly from the browser's request cookies
    const token = req.cookies?.token;

    // 2. If the cookie is missing or empty, block access immediately
    if (!token || token === "none") {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication token required. Access Denied." 
      });
    }

    // 3. Verify the cookie token using your secret key
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    
    next();
  } catch (err) {
    return res.status(401).json({
      success: false, 
      message: "Invalid or expired authorization token"
    });
  }
}

module.exports = { authenticate };
