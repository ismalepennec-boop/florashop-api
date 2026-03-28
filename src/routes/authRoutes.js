const router = require('express').Router();
const validate = require('../middlewares/validate');
const { isAuthenticated } = require('../middlewares/auth');
const { registerSchema, loginSchema } = require('../validators/authValidator');
const { register, login, getMe } = require('../controllers/authController');

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', isAuthenticated, getMe);

module.exports = router;
