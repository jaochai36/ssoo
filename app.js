const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const dotenv = require('dotenv');

// โหลดตัวแปรสภาพแวดล้อมจากไฟล์ .env
dotenv.config();

// กำหนดค่าการเชื่อมต่อ MongoDB ที่ปลอดภัยสำหรับ Cloudflare
const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('เชื่อมต่อกับ MongoDB สำเร็จ');
  } catch (err) {
    console.error('เกิดข้อผิดพลาดในการเชื่อมต่อกับ MongoDB:', err);
    // ถ้าอยู่ใน production ให้พยายามเชื่อมต่ออีกครั้ง
    if (process.env.NODE_ENV === 'production') {
      console.log('กำลังลองเชื่อมต่อใหม่ในอีก 5 วินาที...');
      setTimeout(connectMongoDB, 5000);
    }
  }
};

// เริ่มการเชื่อมต่อ MongoDB
connectMongoDB();

// สร้าง Express app
const app = express();

// กำหนดค่า view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ตั้งค่า Session ที่รองรับ Cloudflare
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ 
    mongoUrl: process.env.MONGODB_URI,
    touchAfter: 24 * 3600 // อัปเดตเซสชันทุก 24 ชั่วโมง
  }),
  cookie: { 
    maxAge: 1000 * 60 * 60 * 24, // 1 วัน
    secure: process.env.NODE_ENV === 'production', // ใช้ HTTPS ใน production
    sameSite: 'lax'
  }
}));

// Global Variables - ข้อมูลที่ใช้ร่วมกันในทุกหน้า
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  // เพิ่มตัวแปรสำหรับตรวจสอบสภาพแวดล้อม
  res.locals.isProduction = process.env.NODE_ENV === 'production';
  // เพิ่ม path ปัจจุบันเพื่อใช้ในการแสดง active state ในเมนู
  res.locals.path = req.path;
  next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/admin', require('./routes/admin'));

// 404 Page
app.use((req, res) => {
  res.status(404).render('404', { title: 'ไม่พบหน้าที่ค้นหา' });
});

// ตรวจสอบว่าอยู่บน Cloudflare หรือไม่
const isCloudflare = process.env.CLOUDFLARE_PAGES === 'true';

// Cloudflare Pages จะใช้ export module ในรูปแบบนี้
if (isCloudflare) {
  // สำหรับ Cloudflare Pages/Workers จะใช้การ export เป็น module
  module.exports = app;
} else {
  // สำหรับการรันใน local environment จะใช้ app.listen
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`เซิร์ฟเวอร์ทำงานที่พอร์ต ${PORT}`);
    console.log(`สภาพแวดล้อม: ${process.env.NODE_ENV || 'development'}`);
  });
}