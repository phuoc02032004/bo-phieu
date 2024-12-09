const  express = require('express')
const userController  = require('../controllers/userController');
const router = express.Router();
const authMiddleware = require('../middleware/AuthMiddleware')

router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/verify", userController.verifyEmail);
router.use(authMiddleware);

module.exports = router;