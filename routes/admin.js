const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isLoggedIn, isAdmin } = require('../config/auth');

// ตรวจสอบการเข้าถึงส่วนของแอดมินทั้งหมด
router.use(isLoggedIn, isAdmin);

// หน้าแดชบอร์ดแอดมิน
router.get('/', adminController.dashboard);

// จัดการผู้ใช้
router.get('/users', adminController.listUsers);
router.get('/users/edit/:id', adminController.editUserForm);
router.post('/users/edit/:id', adminController.updateUser);
router.get('/users/delete/:id', adminController.deleteUser);

module.exports = router;