const { User } = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


async function register(req, res, next) {
  try {
    const { name, email, password,role } = req.body;
    
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false, 
        message: "Email already registered"
      });
    }
    
    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name, 
      email, 
      password: hash,
      role : role || 'user'
    });
    
    res.status(201).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email ,role: user.role }
    });
  } catch (err) { 
    next(err); 
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false, 
        message: "Invalid credentials"
      });
    }
    
    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
      return res.status(401).json({
        success: false, 
        message: "Invalid credentials"
      });
    }
    
    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.cookie("token", token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, role: user.role }
    });
  } catch (err) { 
    next(err); 
  }
}


module.exports = { 
  register, 
  login 
};


