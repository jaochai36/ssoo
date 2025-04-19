// Middleware สำหรับตรวจสอบการล็อกอินและสิทธิ์การเข้าถึง

// ตรวจสอบว่าผู้ใช้งานเข้าสู่ระบบแล้วหรือไม่
exports.isLoggedIn = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  req.session.returnTo = req.originalUrl;
  res.redirect('/auth/login');
};

// ตรวจสอบว่าผู้ใช้งานยังไม่ได้เข้าสู่ระบบ
exports.isNotLoggedIn = (req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  res.redirect('/');
};

// ตรวจสอบว่าผู้ใช้งานมีสิทธิ์แอดมิน
exports.isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  res.status(403).render('error', { 
    title: 'ไม่มีสิทธิ์เข้าถึง', 
    message: 'คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้' 
  });
};