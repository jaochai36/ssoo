const Blog = require('../models/Blog');
const Comment = require('../models/Comment');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sanitizeHtml = require('sanitize-html');
const { v4: uuidv4 } = require('uuid');

// กำหนดพื้นที่เก็บรูปภาพและชื่อไฟล์
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../public/uploads');
    // สร้างโฟลเดอร์ถ้ายังไม่มี
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueName = uuidv4();
    const extension = path.extname(file.originalname);
    cb(null, uniqueName + extension);
  }
});

// ฟิลเตอร์ไฟล์ให้รับเฉพาะรูปภาพ
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('ไฟล์ที่อัปโหลดต้องเป็นรูปภาพเท่านั้น!'), false);
  }
};

// กำหนดค่า multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // จำกัดขนาด 5MB
});

// Middleware สำหรับการอัปโหลดรูปภาพ
exports.uploadImage = upload.single('image');

// ดึงรายการบทความทั้งหมด (สำหรับหน้าแสดงบทความทั้งหมด)
exports.getAllBlogs = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  let query = Blog.find().sort({ createdAt: -1 });
  
  // กรองตาม tag ถ้ามีการระบุ
  if (req.query.tag) {
    query = query.find({ tags: req.query.tag });
  }
  
  // กรองตามคำค้นหา
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    query = query.find({
      $or: [
        { title: searchRegex },
        { content: searchRegex },
        { tags: searchRegex }
      ]
    });
  }
  
  // นับจำนวนบทความทั้งหมด
  const total = await Blog.countDocuments(query._conditions);
  
  // ดึงข้อมูลบทความพร้อม populate ข้อมูลผู้เขียน
  const blogs = await query
    .skip(skip)
    .limit(limit)
    .populate('author', 'name avatar');
  
  res.status(200).json({
    status: 'success',
    results: blogs.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: blogs
  });
});

// ดึงข้อมูลบทความจาก slug
exports.getBlogBySlug = catchAsync(async (req, res, next) => {
  const blog = await Blog.findOne({ slug: req.params.slug })
    .populate('author', 'name avatar bio')
    .populate({
      path: 'comments',
      match: { parent: null, isDeleted: false },
      options: { sort: { createdAt: -1 } },
      populate: {
        path: 'replies',
        match: { isDeleted: false },
        options: { sort: { createdAt: 1 } }
      }
    });
  
  if (!blog) {
    return next(new AppError('ไม่พบบทความที่ต้องการ', 404));
  }
  
  // เพิ่มจำนวนการเข้าชม
  blog.viewCount += 1;
  await blog.save({ validateBeforeSave: false });
  
  // ดึงบทความที่เกี่ยวข้อง
  const relatedBlogs = await Blog.find({
    _id: { $ne: blog._id },
    tags: { $in: blog.tags }
  })
    .sort({ createdAt: -1 })
    .limit(3)
    .populate('author', 'name avatar');
  
  res.status(200).json({
    status: 'success',
    data: blog,
    related: relatedBlogs
  });
});

// สร้างบทความใหม่
exports.createBlog = catchAsync(async (req, res, next) => {
  // ตรวจสอบว่าผู้ใช้ได้เข้าสู่ระบบหรือไม่
  if (!req.user) {
    return next(new AppError('คุณต้องเข้าสู่ระบบก่อนเขียนบทความ', 401));
  }
  
  const newBlog = await Blog.create({
    ...req.body,
    author: req.user._id
  });
  
  res.status(201).json({
    status: 'success',
    data: newBlog
  });
});

// อัปเดตบทความ
exports.updateBlog = catchAsync(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);
  
  if (!blog) {
    return next(new AppError('ไม่พบบทความที่ต้องการแก้ไข', 404));
  }
  
  // ตรวจสอบสิทธิ์ (ต้องเป็นเจ้าของบทความหรือ admin)
  if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('คุณไม่มีสิทธิ์แก้ไขบทความนี้', 403));
  }
  
  const updatedBlog = await Blog.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );
  
  res.status(200).json({
    status: 'success',
    data: updatedBlog
  });
});

// ลบบทความ
exports.deleteBlog = catchAsync(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);
  
  if (!blog) {
    return next(new AppError('ไม่พบบทความที่ต้องการลบ', 404));
  }
  
  // ตรวจสอบสิทธิ์ (ต้องเป็นเจ้าของบทความหรือ admin)
  if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('คุณไม่มีสิทธิ์ลบบทความนี้', 403));
  }
  
  await Blog.findByIdAndDelete(req.params.id);
  
  // ลบความคิดเห็นที่เกี่ยวข้อง
  await Comment.deleteMany({ blog: req.params.id });
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

// ดึงบทความของผู้ใช้
exports.getUserBlogs = catchAsync(async (req, res, next) => {
  const userId = req.params.userId || req.user._id;
  
  const blogs = await Blog.find({ author: userId })
    .sort({ createdAt: -1 });
  
  res.status(200).json({
    status: 'success',
    results: blogs.length,
    data: blogs
  });
});

// เพิ่มหรือลบ Like จากบทความ
exports.toggleLikeBlog = catchAsync(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);
  
  if (!blog) {
    return next(new AppError('ไม่พบบทความที่ต้องการ', 404));
  }
  
  const user = await User.findById(req.user._id);
  
  // ตรวจสอบว่าผู้ใช้เคยกด Like บทความนี้หรือไม่
  const hasLiked = user.likedBlogs.includes(blog._id);
  
  if (hasLiked) {
    // ถ้าเคยกด Like แล้ว ให้ยกเลิก Like
    user.likedBlogs = user.likedBlogs.filter(
      blogId => blogId.toString() !== blog._id.toString()
    );
    blog.likeCount = Math.max(0, blog.likeCount - 1);
  } else {
    // ถ้ายังไม่เคยกด Like ให้เพิ่ม
    user.likedBlogs.push(blog._id);
    blog.likeCount += 1;
  }
  
  await user.save({ validateBeforeSave: false });
  await blog.save({ validateBeforeSave: false });
  
  res.status(200).json({
    status: 'success',
    isLiked: !hasLiked,
    likeCount: blog.likeCount
  });
});

// อัปโหลดรูปภาพสำหรับ TinyMCE
exports.uploadEditorImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'ไม่พบไฟล์รูปภาพ'
      });
    }

    res.status(200).json({
      status: 'success',
      location: `/uploads/${req.file.filename}`
    });
  } catch (error) {
    console.error('Error uploading editor image:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ'
    });
  }
};

// ดึงข้อมูลบทความเดียว
exports.getBlog = async (req, res) => {
  try {
    const slug = req.params.slug;
    const blog = await Blog.findOne({ slug }).populate('author', 'name');

    if (!blog) {
      return res.status(404).json({
        status: 'error',
        message: 'ไม่พบบทความที่ต้องการ'
      });
    }

    // ถ้าเป็น draft ให้เจ้าของหรือ admin ดูได้เท่านั้น
    if (blog.status === 'draft') {
      if (!req.session.user || 
          (req.session.user._id.toString() !== blog.author._id.toString() && 
           req.session.user.role !== 'admin')) {
        return res.status(403).json({
          status: 'error',
          message: 'คุณไม่มีสิทธิ์เข้าถึงบทความนี้'
        });
      }
    }

    // เพิ่มจำนวนการเข้าชม
    blog.viewCount += 1;
    await blog.save();

    res.status(200).json({
      status: 'success',
      data: blog
    });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลบทความ'
    });
  }
};

// แก้ไขบทความ
exports.updateBlog = async (req, res) => {
  try {
    const slug = req.params.slug;
    const blog = await Blog.findOne({ slug });

    if (!blog) {
      return res.status(404).json({
        status: 'error',
        message: 'ไม่พบบทความที่ต้องการแก้ไข'
      });
    }

    // ตรวจสอบสิทธิ์
    if (req.session.user._id.toString() !== blog.author.toString() && 
        req.session.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'คุณไม่มีสิทธิ์แก้ไขบทความนี้'
      });
    }

    // แปลงแท็ก
    let tags = [];
    if (req.body.tags) {
      tags = req.body.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');
    }

    // ทำความสะอาด HTML
    const sanitizedContent = sanitizeHtml(req.body.content, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        img: ['src', 'alt', 'width', 'height', 'style']
      }
    });

    // อัปเดตข้อมูล
    blog.title = req.body.title;
    blog.content = sanitizedContent;
    blog.tags = tags;
    blog.status = req.body.status || blog.status;

    // อัปเดตรูปภาพถ้ามี
    if (req.file) {
      // ลบรูปเก่าถ้ามี
      if (blog.coverImage && fs.existsSync(path.join(__dirname, '../public', blog.coverImage))) {
        fs.unlinkSync(path.join(__dirname, '../public', blog.coverImage));
      }
      blog.coverImage = `/uploads/${req.file.filename}`;
    }

    await blog.save();
    
    const updatedBlog = await Blog.findById(blog._id).populate('author', 'name');

    res.status(200).json({
      status: 'success',
      data: updatedBlog
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'เกิดข้อผิดพลาดในการแก้ไขบทความ'
    });
  }
};

// ลบบทความ
exports.deleteBlog = async (req, res) => {
  try {
    const slug = req.params.slug;
    const blog = await Blog.findOne({ slug });

    if (!blog) {
      return res.status(404).json({
        status: 'error',
        message: 'ไม่พบบทความที่ต้องการลบ'
      });
    }

    // ตรวจสอบสิทธิ์
    if (req.session.user._id.toString() !== blog.author.toString() && 
        req.session.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'คุณไม่มีสิทธิ์ลบบทความนี้'
      });
    }

    // ลบรูปภาพปกถ้ามี
    if (blog.coverImage && fs.existsSync(path.join(__dirname, '../public', blog.coverImage))) {
      fs.unlinkSync(path.join(__dirname, '../public', blog.coverImage));
    }

    await Blog.findByIdAndDelete(blog._id);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'เกิดข้อผิดพลาดในการลบบทความ'
    });
  }
};