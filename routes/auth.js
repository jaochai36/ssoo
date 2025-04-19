const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isNotLoggedIn } = require('../config/auth');

// เส้นทางสำหรับลงทะเบียน
router.get('/register', isNotLoggedIn, authController.showRegister);
router.post('/register', isNotLoggedIn, authController.register);

// เส้นทางสำหรับเข้าสู่ระบบ
router.get('/login', isNotLoggedIn, authController.showLogin);
router.post('/login', isNotLoggedIn, authController.login);

// เส้นทางสำหรับออกจากระบบ
router.get('/logout', authController.logout);

module.exports = router;