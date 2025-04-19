const User = require('../models/User');

// แสดงหน้าลงทะเบียน
exports.showRegister = (req, res) => {
  res.render('auth/register', { title: 'ลงทะเบียน' });
};

// ประมวลผลการลงทะเบียนผู้ใช้
exports.register = async (req, res) => {
  try {
    const { name, email, password, password2 } = req.body;
    
    // ตรวจสอบความถูกต้องของข้อมูล
    let errors = [];
    
    if (!name || !email || !password || !password2) {
      errors.push({ msg: 'กรุณากรอกข้อมูลให้ครบทุกช่อง' });
    }
    
    if (password !== password2) {
      errors.push({ msg: 'รหัสผ่านไม่ตรงกัน' });
    }
    
    if (password.length < 6) {
      errors.push({ msg: 'รหัสผ่านควรมีอย่างน้อย 6 ตัวอักษร' });
    }
    
    // ถ้ามีข้อผิดพลาด ส่งกลับไปแสดงข้อความ
    if (errors.length > 0) {
      return res.render('auth/register', {
        title: 'ลงทะเบียน',
        errors,
        name,
        email
      });
    }
    
    // ตรวจสอบว่าอีเมลซ้ำหรือไม่
    const userExists = await User.findOne({ email });
    
    if (userExists) {
      errors.push({ msg: 'อีเมลนี้ถูกใช้งานแล้ว' });
      return res.render('auth/register', {
        title: 'ลงทะเบียน',
        errors,
        name,
        email
      });
    }
    
    // สร้างผู้ใช้รายใหม่
    const newUser = new User({
      name,
      email,
      password
    });
    
    // บันทึกผู้ใช้ลงฐานข้อมูล
    await newUser.save();
    
    req.session.message = {
      type: 'success',
      text: 'คุณลงทะเบียนสำเร็จแล้ว สามารถเข้าสู่ระบบได้ทันที'
    };
    
    res.redirect('/auth/login');
  } catch (err) {
    console.error('เกิดข้อผิดพลาดในการลงทะเบียน:', err);
    res.render('auth/register', {
      title: 'ลงทะเบียน',
      errors: [{ msg: 'เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง' }],
      name: req.body.name,
      email: req.body.email
    });
  }
};

// แสดงหน้าล็อกอิน
exports.showLogin = (req, res) => {
  res.render('auth/login', { title: 'เข้าสู่ระบบ' });
};

// ประมวลผลการล็อกอิน
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // ตรวจสอบข้อมูลผู้ใช้
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.render('auth/login', {
        title: 'เข้าสู่ระบบ',
        errors: [{ msg: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }],
        email
      });
    }
    
    // ตรวจสอบรหัสผ่าน
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
      return res.render('auth/login', {
        title: 'เข้าสู่ระบบ',
        errors: [{ msg: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }],
        email
      });
    }
    
    // สร้างข้อมูลเซสชัน
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    
    // ตรวจสอบว่ามีการเปลี่ยนเส้นทางหรือไม่
    const redirectTo = req.session.returnTo || '/';
    delete req.session.returnTo;
    
    res.redirect(redirectTo);
  } catch (err) {
    console.error('เกิดข้อผิดพลาดในการเข้าสู่ระบบ:', err);
    res.render('auth/login', {
      title: 'เข้าสู่ระบบ',
      errors: [{ msg: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง' }],
      email: req.body.email
    });
  }
};

// ออกจากระบบ
exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};