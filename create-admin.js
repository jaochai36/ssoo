const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// โหลดตัวแปรสภาพแวดล้อมจากไฟล์ .env
dotenv.config();

// นำเข้าโมเดล User
const User = require('./models/User');

// เชื่อมต่อกับฐานข้อมูล MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('เชื่อมต่อกับ MongoDB สำเร็จ'))
  .catch(err => {
    console.error('เกิดข้อผิดพลาดในการเชื่อมต่อกับ MongoDB:', err);
    process.exit(1);
  });

// รายละเอียดบัญชีแอดมิน
const adminDetails = {
  name: 'Sorawit Admin',
  email: 'sorawit@seamtong.ac.th',
  password: 'admin123456',
  role: 'admin'
};

// ฟังก์ชันสร้างบัญชีแอดมิน
async function createAdmin() {
  try {
    // ตรวจสอบว่ามีอีเมลนี้ในระบบแล้วหรือไม่
    const existingAdmin = await User.findOne({ email: adminDetails.email });
    
    if (existingAdmin) {
      console.log('บัญชีนี้มีอยู่ในระบบแล้ว อัปเดตเป็นสิทธิ์แอดมิน');
      
      // อัปเดตเป็นแอดมิน
      await User.updateOne(
        { email: adminDetails.email },
        { $set: { role: 'admin' } }
      );
      
      console.log('อัปเดตสิทธิ์เป็นแอดมินเรียบร้อยแล้ว');
    } else {
      // สร้างบัญชีแอดมินใหม่
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminDetails.password, salt);
      
      const newAdmin = new User({
        name: adminDetails.name,
        email: adminDetails.email,
        password: hashedPassword,
        role: adminDetails.role
      });
      
      await newAdmin.save();
      
      console.log('สร้างบัญชีแอดมินเรียบร้อยแล้ว');
      console.log('อีเมล:', adminDetails.email);
      console.log('รหัสผ่าน:', adminDetails.password);
    }
    
    // ปิดการเชื่อมต่อ MongoDB
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('เกิดข้อผิดพลาด:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}

// เรียกใช้ฟังก์ชันสร้างบัญชีแอดมิน
createAdmin();