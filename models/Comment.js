const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'กรุณาระบุข้อความแสดงความคิดเห็น'],
      trim: true,
      maxlength: [1000, 'ความคิดเห็นต้องมีความยาวไม่เกิน 1000 ตัวอักษร'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'ความคิดเห็นต้องระบุผู้เขียน'],
    },
    blog: {
      type: mongoose.Schema.ObjectId,
      ref: 'Blog',
      required: [true, 'ความคิดเห็นต้องเชื่อมโยงกับบทความ'],
    },
    // สำหรับการตอบกลับความคิดเห็น (nested comments)
    parent: {
      type: mongoose.Schema.ObjectId,
      ref: 'Comment',
      default: null,
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// สร้าง virtual field สำหรับการตอบกลับความคิดเห็น
commentSchema.virtual('replies', {
  ref: 'Comment',
  foreignField: 'parent',
  localField: '_id'
});

// การลบความคิดเห็นจะเป็นการ soft delete
commentSchema.pre(/^find/, function(next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

// เมื่อมีการตอบกลับความคิดเห็น ให้อัปเดตข้อมูลความคิดเห็นหลัก
commentSchema.post('save', async function() {
  if (this.parent) {
    await this.constructor.findByIdAndUpdate(
      this.parent,
      { $inc: { replyCount: 1 } }
    );
  }
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;