const router = require("express").Router();

// 1. Fixed Middleware Import (Destructured named import matching our architecture)
const { authenticate } = require("../middleware/auth");

// 2. Fixed Controller Import (Destructured named import matching user.controller.js)
const { getProfile, updateProfile } = require("../controllers/user.controller");

// 3. Fixed Routes using the destructured function variables directly
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);

module.exports = router;
