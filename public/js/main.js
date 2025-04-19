// เมื่อเอกสาร HTML โหลดเสร็จสมบูรณ์
document.addEventListener('DOMContentLoaded', function() {
  // ทำให้ข้อความแจ้งเตือน (alert) หายไปอัตโนมัติหลังจาก 5 วินาที
  setTimeout(() => {
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
      const bsAlert = new bootstrap.Alert(alert);
      bsAlert.close();
    });
  }, 5000);

  // เพิ่ม active class ให้กับ nav-link ที่ตรงกับหน้าปัจจุบัน
  const currentLocation = window.location.pathname;
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  navLinks.forEach(link => {
    if (link.getAttribute('href') === currentLocation) {
      link.classList.add('active');
    }
  });

  // ยืนยันการลบข้อมูลก่อนดำเนินการ
  const deleteButtons = document.querySelectorAll('.delete-confirm');
  deleteButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?')) {
        e.preventDefault();
      }
    });
  });
  
  // จัดการเมนูโมบาย์
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  
  if (mobileMenuToggle && mobileMenu) {
    mobileMenuToggle.addEventListener('click', function() {
      document.body.classList.toggle('mobile-nav-active');
      mobileMenu.style.display = document.body.classList.contains('mobile-nav-active') ? 'block' : 'none';
    });
  }
});

/**
 * SSOO - Custom JavaScript
 * แอนิเมชันและอินเตอร์แอคชันสำหรับการนำเสนอแบรนด์ SSOO
 */

document.addEventListener('DOMContentLoaded', () => {
  // เอฟเฟกต์ Parallax บนหน้า Hero
  createParallaxEffect();
  
  // ทำให้การเลื่อนไปยังส่วนต่างๆ ในหน้าเรียบลื่น
  setupSmoothScrolling();
  
  // เอฟเฟกต์เมื่อ Scroll
  setupScrollEffects();
  
  // เอฟเฟกต์ Ripple สำหรับปุ่ม
  setupRippleEffect();
});

/**
 * สร้างเอฟเฟกต์ Parallax บนหน้า Hero
 */
function createParallaxEffect() {
  const heroSection = document.querySelector('.ssoo-hero');
  if (!heroSection) return;
  
  window.addEventListener('mousemove', (e) => {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    
    const moveX = (x - 0.5) * 20;
    const moveY = (y - 0.5) * 20;
    
    heroSection.style.backgroundPosition = `${50 + moveX * 0.1}% ${50 + moveY * 0.1}%`;
    
    const rippleEffect = document.querySelector('.ripple-effect');
    if (rippleEffect) {
      rippleEffect.style.transform = `translate(${moveX * 0.5}px, ${moveY * 0.5}px)`;
    }
  });
}

/**
 * ตั้งค่าการเลื่อนแบบ Smooth
 */
function setupSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      
      window.scrollTo({
        top: target.offsetTop - 60,
        behavior: 'smooth'
      });
    });
  });
}

/**
 * ตั้งค่าเอฟเฟกต์เมื่อ Scroll
 */
function setupScrollEffects() {
  const elements = document.querySelectorAll('.ssoo-intro, .ssoo-features, .visual-divider, .ssoo-quote, .ssoo-cta');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1
  });
  
  elements.forEach(element => {
    element.classList.add('fade-element');
    observer.observe(element);
  });
  
  // เพิ่ม CSS สำหรับ fade animation
  const style = document.createElement('style');
  style.textContent = `
    .fade-element {
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .fade-in {
      opacity: 1;
      transform: translateY(0);
    }
  `;
  document.head.appendChild(style);
}

/**
 * ตั้งค่าเอฟเฟกต์ Ripple สำหรับปุ่ม
 */
function setupRippleEffect() {
  const buttons = document.querySelectorAll('.btn');
  
  buttons.forEach(button => {
    button.addEventListener('mousedown', function(e) {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      
      this.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });
  
  // เพิ่ม CSS สำหรับ ripple effect
  const style = document.createElement('style');
  style.textContent = `
    .btn {
      position: relative;
      overflow: hidden;
    }
    
    .ripple {
      position: absolute;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.4);
      transform: scale(0);
      animation: ripple 0.6s linear;
      pointer-events: none;
    }
    
    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}