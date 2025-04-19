const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const blogController = require('../controllers/blogController');

// middleware ตรวจสอบการล็อกอิน
const isLoggedIn = authController.isLoggedIn;

// หน้าหลัก
router.get('/', (req, res) => {
  res.render('index', { title: 'หน้าหลัก' });
});

// API routes สำหรับบทความ
router.get('/api/blogs', blogController.getAllBlogs);
router.get('/api/blogs/:slug', blogController.getBlog);
router.post('/api/blogs', isLoggedIn, blogController.uploadImage, blogController.createBlog);
router.put('/api/blogs/:slug', isLoggedIn, blogController.uploadImage, blogController.updateBlog);
router.delete('/api/blogs/:slug', isLoggedIn, blogController.deleteBlog);
router.post('/api/upload-image', isLoggedIn, blogController.uploadImage, blogController.uploadEditorImage);

// หน้าแสดงบทความทั้งหมด
router.get('/blogs', (req, res) => {
  res.render('blogs/show', { title: 'บทความทั้งหมด' });
});

// หน้าแสดงบทความเดียว
router.get('/blogs/:slug', (req, res) => {
  res.render('blogs/show', { title: 'บทความ', slug: req.params.slug });
});

// หน้าสร้างบทความ (ต้องล็อกอิน)
router.get('/blogs/new', isLoggedIn, (req, res) => {
  res.render('blogs/new', { title: 'เขียนบทความใหม่' });
});

// หน้าแก้ไขบทความ (ต้องล็อกอิน)
router.get('/blogs/:slug/edit', isLoggedIn, (req, res) => {
  res.render('blogs/edit', { title: 'แก้ไขบทความ', slug: req.params.slug });
});

// หน้าโปรไฟล์ (ต้องล็อกอิน)
router.get('/profile', isLoggedIn, (req, res) => {
  res.render('profile', { title: 'โปรไฟล์ของฉัน' });
});

// ส่งออกเราเตอร์
module.exports = router;