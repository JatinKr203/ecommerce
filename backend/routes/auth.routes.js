const router = require("express").Router();
const validate = require("../middleware/validate");
const rules = require("../validators/auth.validator");


const { register, login } = require("../controllers/auth.controller");

router.post("/register", rules.registerRules, validate, register);
router.post("/login", rules.loginRules, validate, login);

module.exports = router;
