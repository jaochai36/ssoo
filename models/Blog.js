const mongoose = require('mongoose');
const slugify = require('slugify');

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'กรุณาระบุชื่อบทความ'],
      trim: true,
      maxlength: [200, 'ชื่อบทความต้องไม่เกิน 200 ตัวอักษร'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: [true, 'กรุณาระบุเนื้อหาบทความ'],
    },
    coverImage: {
      type: String,
      default: 'default-blog-cover.jpg'
    },
    author: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'บทความต้องระบุผู้เขียน'],
    },
    tags: [String],
    category: {
      type: String,
      default: 'ทั่วไป',
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    readTime: {
      type: Number,
      default: 5, // เวลาในการอ่านโดยประมาณ (นาที)
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// สร้าง virtual field สำหรับความคิดเห็นในบทความ
blogSchema.virtual('comments', {
  ref: 'Comment',
  foreignField: 'blog',
  localField: '_id'
});

// สร้าง slug ก่อนบันทึกลงฐานข้อมูล
blogSchema.pre('save', function(next) {
  if (!this.isModified('title')) return next();
  
  // สร้าง slug จากชื่อบทความ แปลงเป็นภาษาไทย
  this.slug = slugify(this.title, {
    lower: true,
    locale: 'th',
    strict: true
  });
  
  // เพิ่มเลขสุ่มไว้ท้าย slug เพื่อป้องกันการซ้ำกัน
  this.slug += `-${Date.now().toString().slice(-6)}`;
  
  next();
});

// คำนวณเวลาในการอ่านโดยประมาณ
blogSchema.pre('save', function(next) {
  if (!this.isModified('content')) return next();
  
  const wordsPerMinute = 200; // คนอ่านเฉลี่ยประมาณ 200 คำต่อนาที
  const contentLength = this.content.split(' ').length;
  
  this.readTime = Math.ceil(contentLength / wordsPerMinute);
  
  // เวลาอ่านขั้นต่ำ 1 นาที
  if (this.readTime < 1) this.readTime = 1;
  
  next();
});

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;