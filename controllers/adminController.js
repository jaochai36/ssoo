const User = require('../models/User');

// แสดงหน้าแดชบอร์ดแอดมิน
exports.dashboard = async (req, res) => {
  try {
    // นับจำนวนผู้ใช้ในระบบ
    const userCount = await User.countDocuments();
    
    res.render('admin/dashboard', {
      title: 'แดชบอร์ดแอดมิน',
      userCount
    });
  } catch (err) {
    console.error('เกิดข้อผิดพลาดในการโหลดแดชบอร์ดแอดมิน:', err);
    res.status(500).render('error', {
      title: 'เกิดข้อผิดพลาด',
      message: 'ไม่สามารถโหลดแดชบอร์ดแอดมิน กรุณาลองใหม่อีกครั้ง'
    });
  }
};

// แสดงรายการผู้ใช้ทั้งหมด
exports.listUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    res.render('admin/users', {
      title: 'จัดการผู้ใช้งาน',
      users
    });
  } catch (err) {
    console.error('เกิดข้อผิดพลาดในการโหลดรายการผู้ใช้:', err);
    res.status(500).render('error', {
      title: 'เกิดข้อผิดพลาด',
      message: 'ไม่สามารถโหลดรายการผู้ใช้งาน กรุณาลองใหม่อีกครั้ง'
    });
  }
};

// แสดงฟอร์มแก้ไขข้อมูลผู้ใช้
exports.editUserForm = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).render('error', {
        title: 'ไม่พบผู้ใช้',
        message: 'ไม่พบข้อมูลผู้ใช้ที่ต้องการแก้ไข'
      });
    }
    
    res.render('admin/edit-user', {
      title: 'แก้ไขข้อมูลผู้ใช้',
      user
    });
  } catch (err) {
    console.error('เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้:', err);
    res.status(500).render('error', {
      title: 'เกิดข้อผิดพลาด',
      message: 'ไม่สามารถโหลดข้อมูลผู้ใช้ กรุณาลองใหม่อีกครั้ง'
    });
  }
};

// อัปเดตข้อมูลผู้ใช้
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    
    // ตรวจสอบว่ามีผู้ใช้อื่นใช้อีเมลนี้หรือไม่
    const existingUser = await User.findOne({ email, _id: { $ne: req.params.id } });
    
    if (existingUser) {
      return res.render('admin/edit-user', {
        title: 'แก้ไขข้อมูลผู้ใช้',
        user: {
          _id: req.params.id,
          name,
          email,
          role
        },
        errors: [{ msg: 'อีเมลนี้ถูกใช้งานโดยผู้ใช้คนอื่นแล้ว' }]
      });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role },
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      return res.status(404).render('error', {
        title: 'ไม่พบผู้ใช้',
        message: 'ไม่พบข้อมูลผู้ใช้ที่ต้องการแก้ไข'
      });
    }
    
    req.session.message = {
      type: 'success',
      text: 'อัปเดตข้อมูลผู้ใช้สำเร็จแล้ว'
    };
    
    res.redirect('/admin/users');
  } catch (err) {
    console.error('เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้:', err);
    res.status(500).render('error', {
      title: 'เกิดข้อผิดพลาด',
      message: 'ไม่สามารถอัปเดตข้อมูลผู้ใช้ กรุณาลองใหม่อีกครั้ง'
    });
  }
};

// ลบผู้ใช้
exports.deleteUser = async (req, res) => {
  try {
    // ป้องกันไม่ให้แอดมินลบตัวเอง
    if (req.session.user.id === req.params.id) {
      req.session.message = {
        type: 'error',
        text: 'ไม่สามารถลบบัญชีของตัวเองได้'
      };
      return res.redirect('/admin/users');
    }
    
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    
    if (!deletedUser) {
      return res.status(404).render('error', {
        title: 'ไม่พบผู้ใช้',
        message: 'ไม่พบข้อมูลผู้ใช้ที่ต้องการลบ'
      });
    }
    
    req.session.message = {
      type: 'success',
      text: 'ลบผู้ใช้สำเร็จแล้ว'
    };
    
    res.redirect('/admin/users');
  } catch (err) {
    console.error('เกิดข้อผิดพลาดในการลบผู้ใช้:', err);
    res.status(500).render('error', {
      title: 'เกิดข้อผิดพลาด',
      message: 'ไม่สามารถลบผู้ใช้ กรุณาลองใหม่อีกครั้ง'
    });
  }
};