/* =============================================
   La Bonita Spa – Script.js
   Features: Header scroll, Mobile nav, Scroll reveal,
   Active nav link, Gallery lightbox
   ============================================= */

document.addEventListener('DOMContentLoaded', async () => {

  // Fetch dynamic content from CMS API
  try {
    const res = await fetch('/api/content');
    if (res.ok) {
      const content = await res.json();
      if (document.getElementById('dyn_hero_title')) document.getElementById('dyn_hero_title').innerHTML = content.hero_title || '';
      if (document.getElementById('dyn_hero_desc')) document.getElementById('dyn_hero_desc').innerHTML = content.hero_desc || '';
      // New CEO/About content
      if (document.getElementById('dyn_ceo_subtitle')) document.getElementById('dyn_ceo_subtitle').innerHTML = content.ceo_subtitle || '';
      if (document.getElementById('dyn_ceo_title')) document.getElementById('dyn_ceo_title').innerHTML = content.ceo_title || '';
      if (document.getElementById('dyn_ceo_description')) document.getElementById('dyn_ceo_description').innerHTML = content.ceo_description || '';
      if (document.getElementById('dyn_ceo_bullet1')) document.getElementById('dyn_ceo_bullet1').innerHTML = content.ceo_bullet1 || '';
      if (document.getElementById('dyn_ceo_bullet2')) document.getElementById('dyn_ceo_bullet2').innerHTML = content.ceo_bullet2 || '';
      if (document.getElementById('dyn_ceo_bullet3')) document.getElementById('dyn_ceo_bullet3').innerHTML = content.ceo_bullet3 || '';
      if (document.getElementById('dyn_ceo_bullet4')) document.getElementById('dyn_ceo_bullet4').innerHTML = content.ceo_bullet4 || '';
      if (document.getElementById('dyn_ceo_quote')) document.getElementById('dyn_ceo_quote').innerHTML = content.ceo_quote || '';
      if (document.getElementById('dyn_ceo_quote_author')) document.getElementById('dyn_ceo_quote_author').innerHTML = content.ceo_quote_author || '';
    }

    const premiumServices = [
      { id: 'svc1', title: 'Cải Thiện Sắc Tố - Làm Sáng Da Tự Nhiên', price: '600.000đ', desc: 'Liệu trình làm sáng da an toàn, mờ thâm sạm và cải thiện sắc tố tự nhiên cho làn da rạng rỡ.', image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&q=80', detailImage: 'uploads/pigmentation_before_after.jpg', badge: 'Hot', steps: ['Tẩy trang', 'Rửa mặt', 'Tẩy tế bào chết', 'Xông hơi', 'Ủ mụn', 'Hút tuyến bã', 'Lấy nhân mụn', 'Massage tăng tuần hoàn bạch huyết', 'Chiết tách Malasma', 'Massage đầu vai cổ gáy', 'Làm sạch Malasma', 'Phun oxy tươi', 'Điện di Hyaluronic Axit', 'Điện di tinh chất làm trắng sáng', 'Thoa KCN tế bào gốc thực vật'] },
      { id: 'svc2', title: 'Điều Chỉnh Sắc Tố Da Chuyên Sâu', price: '750.000đ', desc: 'Phác đồ chuyên sâu tác động đa tầng, loại bỏ hắc sắc tố sậm màu, trả lại nền da đều màu.', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80', detailImage: 'uploads/sac_to_chuyen_sau_before_after.jpg', badge: 'Đặc Trị', steps: ['Tẩy trang', 'Rửa mặt', 'Tẩy tế bào chết', 'Xông hơi', 'Ủ mụn', 'Hút tuyến bã', 'Lấy nhân mụn', 'Massage tăng tuần hoàn bạch huyết', 'Chiết tách Malasma', 'Massage đầu vai cổ gáy', 'Làm sạch Malasma', 'Phun oxy tươi', 'Điện di Hyaluronic Axit', 'Điện di tinh chất làm trắng sáng', 'Thoa KCN tế bào gốc thực vật'] },
      { id: 'svc3', title: 'Tái Tạo Nền Da Sáng Khỏe Từ Bên Trong', price: '550.000đ', desc: 'Nuôi dưỡng và phục hồi cấu trúc da, tăng cường hàng rào bảo vệ, giúp da sáng khỏe tự nhiên.', image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&q=80', detailImage: 'uploads/tai_tao_nen_da_before_after.jpg', badge: '', steps: ['Tẩy trang, làm sạch da chuyên sâu', 'Xông hơi, hút bã nhờn, tẩy tế bào chết', 'Massage ấn huyệt lưu thông khí huyết', 'Đắp mặt nạ, điện di tinh chất', 'Thoa kem dưỡng và kem chống nắng bảo vệ da'] },
      { id: 'svc4', title: 'Cân Bằng Sắc Tố - Đều Màu Da', price: '850.000đ', desc: 'Khắc phục triệt để vùng da xỉn màu, ức chế melanin sản sinh, cân bằng và làm đều màu da toàn diện.', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80', detailImage: 'uploads/can_bang_sac_to_before_after.jpg', badge: 'VIP', steps: ['Tẩy trang, làm sạch da chuyên sâu', 'Xông hơi, hút bã nhờn, tẩy tế bào chết', 'Massage ấn huyệt lưu thông khí huyết', 'Đắp mặt nạ, điện di tinh chất', 'Thoa kem dưỡng và kem chống nắng bảo vệ da'] },
      { id: 'svc5', title: 'Thanh Lọc Da Chuyên Sâu', price: '450.000đ', desc: 'Đào thải độc tố, bụi mịn, cặn trang điểm tích tụ lâu ngày, trả lại sự thông thoáng cho lỗ chân lông.', image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80', detailImage: 'uploads/thanh_loc_da_before_after.jpg', badge: '', steps: ['Tẩy trang, làm sạch da chuyên sâu', 'Xông hơi, hút bã nhờn, tẩy tế bào chết', 'Massage ấn huyệt lưu thông khí huyết', 'Đắp mặt nạ, điện di tinh chất', 'Thoa kem dưỡng và kem chống nắng bảo vệ da'] },
      { id: 'svc6', title: 'Phục Hồi Nền Da Mụn', price: '500.000đ', desc: 'Làm dịu các nốt mụn sưng viêm, thúc đẩy tái tạo tế bào sau tổn thương do mụn.', image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&q=80', detailImage: 'uploads/phuc_hoi_da_mun_before_after.jpg', badge: '', steps: ['Tẩy trang, làm sạch da chuyên sâu', 'Xông hơi, hút bã nhờn, tẩy tế bào chết', 'Massage ấn huyệt lưu thông khí huyết', 'Đắp mặt nạ, điện di tinh chất', 'Thoa kem dưỡng và kem chống nắng bảo vệ da'] },
      { id: 'svc7', title: 'Cân Bằng Dầu Ngừa Mụn Tái Phát', price: '150.000đ', desc: 'Kiểm soát tuyến bã nhờn hiệu quả, giữ da luôn ráo mịn và ngăn chặn vi khuẩn gây mụn.', image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&q=80', detailImage: 'uploads/can_bang_dau_before_after.jpg', badge: '', steps: ['Tẩy trang, làm sạch da chuyên sâu', 'Xông hơi, hút bã nhờn, tẩy tế bào chết', 'Massage ấn huyệt lưu thông khí huyết', 'Đắp mặt nạ, điện di tinh chất', 'Thoa kem dưỡng và kem chống nắng bảo vệ da'] },
      { id: 'svc8', title: 'Giải Độc Da – Làm Sạch Tận Gốc Tuyến Bã', price: '300.000đ', desc: 'Làm sạch sâu từng nang lông, giảm bít tắc, rất phù hợp cho da dầu mụn nặng.', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80', detailImage: 'uploads/giai_doc_da_before_after.jpg', badge: '', steps: ['Tẩy trang, làm sạch da chuyên sâu', 'Xông hơi, hút bã nhờn, tẩy tế bào chết', 'Massage ấn huyệt lưu thông khí huyết', 'Đắp mặt nạ, điện di tinh chất', 'Thoa kem dưỡng và kem chống nắng bảo vệ da'] },
      { id: 'svc9', title: 'Cân Bằng Da Dầu - Ngừa Mụn Tái Phát', price: '650.000đ', desc: 'Phác đồ cao cấp kiềm dầu lâu dài, cân bằng độ ẩm - dầu tự nhiên, duy trì làn da khỏe mạnh.', image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&q=80', detailImage: 'uploads/can_bang_da_dau_before_after.png', badge: '', steps: ['Tẩy trang, làm sạch da chuyên sâu', 'Xông hơi, hút bã nhờn, tẩy tế bào chết', 'Massage ấn huyệt lưu thông khí huyết', 'Đắp mặt nạ, điện di tinh chất', 'Thoa kem dưỡng và kem chống nắng bảo vệ da'] },
      { id: 'svc10', title: 'Tái Sinh Da Lão Hóa VIP', price: '1.200.000đ', desc: 'Kích thích tăng sinh collagen và elastin, xóa mờ nếp nhăn, mang lại vẻ thanh xuân rạng ngời.', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80', detailImage: 'uploads/tai_sinh_lao_hoa_before_after.png', badge: 'VIP', steps: ['Tẩy trang, làm sạch da chuyên sâu', 'Xông hơi, hút bã nhờn, tẩy tế bào chết', 'Massage ấn huyệt lưu thông khí huyết', 'Đắp mặt nạ, điện di tinh chất', 'Thoa kem dưỡng và kem chống nắng bảo vệ da'] },
      { id: 'svc11', title: 'Peel Sạch Mụn - Mịn Da Không Bong', price: '350.000đ', desc: 'Sử dụng hoạt chất an toàn loại bỏ lớp sừng già cỗi và mụn, giúp bề mặt da trơn láng mà không bong tróc.', image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80', detailImage: 'uploads/peel_sach_mun_before_after.png', badge: '', steps: ['Tẩy trang, làm sạch da chuyên sâu', 'Xông hơi, hút bã nhờn, tẩy tế bào chết', 'Massage ấn huyệt lưu thông khí huyết', 'Đắp mặt nạ, điện di tinh chất', 'Thoa kem dưỡng và kem chống nắng bảo vệ da'] },
      { id: 'svc12', title: 'Xử Lý Da Kích Ứng', price: '650.000đ', desc: 'Làm dịu tức thì tình trạng mẩn đỏ, rát ngứa, phục hồi lớp màng hydro-lipid mỏng yếu.', image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&q=80', detailImage: 'uploads/xu_ly_kich_ung_before_after.png', badge: 'Cấp Cứu', steps: ['Tẩy trang, làm sạch da chuyên sâu', 'Xông hơi, hút bã nhờn, tẩy tế bào chết', 'Massage ấn huyệt lưu thông khí huyết', 'Đắp mặt nạ, điện di tinh chất', 'Thoa kem dưỡng và kem chống nắng bảo vệ da'] }
    ];

    window.premiumServicesData = premiumServices; // Expose globally for the modal

    // Icon mapping for each service
    const serviceIcons = [
      'sparkles',       // svc1 - Cải Thiện Sắc Tố
      'wand-2',         // svc2 - Điều Chỉnh Sắc Tố
      'droplets',       // svc3 - Tái Tạo Nền Da
      'palette',        // svc4 - Cân Bằng Sắc Tố
      'wind',           // svc5 - Thanh Lọc Da
      'heart',          // svc6 - Phục Hồi Nền Da Mụn
      'activity',       // svc7 - Cân Bằng Dầu
      'flask-conical',  // svc8 - Giải Độc Da
      'gauge',          // svc9 - Cân Bằng Da Dầu
      'crown',          // svc10 - Tái Sinh Da Lão Hóa VIP
      'sparkle',        // svc11 - Peel Sạch Mụn
      'shield-alert'    // svc12 - Xử Lý Da Kích Ứng
    ];

    function renderPremiumService(s, index) {
      const badgeClass = (s.badge === 'Hot' || s.badge === 'VIP') ? 'hot' : (s.badge === 'Đặc Trị' ? 'dark' : (s.badge === 'Cấp Cứu' ? 'emergency' : ''));
      const badge = s.badge ? `<span class="psc-badge ${badgeClass}">${s.badge}</span>` : '';
      const icon = serviceIcons[index] || 'sparkles';
      const num = String(index + 1).padStart(2, '0');
      const zaloIcon = zaloIconSvg(18);
      return `<div class="premium-service-card psc-animate-card" onclick="openServiceModal('${s.id}')" style="animation-delay: ${index * 0.1}s">
            <div class="psc-number">${num}</div>
            <div class="psc-icon-wrap">
              <i data-lucide="${icon}" class="lucide-icon" style="width:24px;height:24px;"></i>
            </div>
            ${badge}
            <h3 class="psc-title">${s.title}</h3>
            <p class="psc-desc">${s.desc}</p>
            <div class="psc-price">${s.price}</div>
            <span class="psc-detail">Xem chi tiết <i class="fas fa-arrow-right" style="font-size:0.75rem;"></i></span>
            <div class="psc-divider"></div>
            <div class="psc-actions">
              <span class="psc-book-label">ĐẶT DỊCH VỤ NGAY</span>
              <a href="https://zalo.me/0935801229" target="_blank" class="psc-zalo-btn" onclick="event.stopPropagation();">
                <span class="zalo-icon-svg">${zaloIcon}</span>
                Tư vấn qua Zalo
              </a>
            </div>
          </div>`;
    }

    function initServiceAnimations() {
      // IntersectionObserver for premium service animations
      const animateElements = document.querySelectorAll('.psc-animate, .psc-animate-card');
      if (animateElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        animateElements.forEach(el => observer.observe(el));
      }
    }

    const premiumGrid = document.getElementById('premium_services_grid');
    if (premiumGrid) {
      premiumGrid.innerHTML = premiumServices.map(renderPremiumService).join('');
      // Re-initialize Lucide icons for injected content
      if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
      }
      // Initialize scroll animations for premium cards
      setTimeout(initServiceAnimations, 200);
    }

    const revGrid = document.getElementById('dyn_reviews_grid');
    if (revGrid) {
      const rRes = await fetch('/api/reviews');
      if (rRes.ok) {
        const { data } = await rRes.json();
        revGrid.innerHTML = data.map(r => {
          const initials = r.customer_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
          const colors = ['#1E6FD9', '#0F172A', '#059669', '#D97706', '#7C3AED', '#DB2777', '#2563EB', '#0891B2', '#65A30D', '#9333EA'];
          const colorIdx = r.customer_name.length % colors.length;
          const bgColor = colors[colorIdx];
          return `<div class="rev-card reveal" style="animation-delay:0s">
            <div class="rev-stars"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div>
            <div class="rev-quote-icon">"</div>
            <p class="rev-text">${r.review_text}</p>
            <div class="rev-divider"></div>
            <div class="rev-author">
              <div class="rev-avatar" style="background:${bgColor};">${initials}</div>
              <div class="rev-author-info">
                <strong class="rev-name">${r.customer_name}</strong>
                <span class="rev-detail">${r.customer_details}</span>
              </div>
            </div>
          </div>`;
        }).join('');
      }
    }

    setTimeout(revealOnScroll, 100);

    // Theme Toggle Logic
    const themeBtn = document.getElementById('themeToggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    if (currentTheme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');

    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        let theme = document.documentElement.getAttribute('data-theme');
        if (theme === 'dark') {
          document.documentElement.removeAttribute('data-theme');
          localStorage.setItem('theme', 'light');
        } else {
          document.documentElement.setAttribute('data-theme', 'dark');
          localStorage.setItem('theme', 'dark');
        }
      });
    }

  } catch (e) {
    console.error("Failed to fetch dynamic content", e);
  }

  // 1. Topbar hide/show on scroll
  const topbar = document.getElementById('topbar');
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (topbar) {
      if (currentScroll > 80 && currentScroll > lastScroll) {
        topbar.classList.add('topbar--hidden');
      } else {
        topbar.classList.remove('topbar--hidden');
      }
    }
    lastScroll = currentScroll;
  });

  // 2. Header scroll effect
  const header = document.getElementById('header');
  if (header && !header.classList.contains('header-solid')) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 60);
      revealOnScroll();
      updateActiveLink();
    });
  } else {
    window.addEventListener('scroll', () => {
      revealOnScroll();
    });
  }

  // 3. Mobile nav toggle
  const menuToggle = document.getElementById('menuToggle');
  const navbar = document.getElementById('navbar');
  if (menuToggle && navbar) {
    menuToggle.addEventListener('click', () => {
      const open = navbar.classList.toggle('open');
      menuToggle.querySelector('i').className = open ? 'fas fa-times' : 'fas fa-bars';
    });
    document.querySelectorAll('.nav-link').forEach(l => {
      l.addEventListener('click', () => {
        navbar.classList.remove('open');
        menuToggle.querySelector('i').className = 'fas fa-bars';
      });
    });
  }

  // 4. Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = header ? header.offsetHeight : 0;
      window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
    });
  });

  // 5. Scroll reveal
  function revealOnScroll() {
    document.querySelectorAll('.reveal').forEach(el => {
      if (el.getBoundingClientRect().top < window.innerHeight - 80) {
        el.classList.add('visible');
      }
    });
  }
  revealOnScroll();

  // 6. Active nav link on scroll
  const sections = document.querySelectorAll('section[id]');
  function updateActiveLink() {
    let current = '';
    sections.forEach(s => {
      const offset = header ? header.offsetHeight : 0;
      if (window.scrollY >= s.offsetTop - offset - 20) current = s.id;
    });
    document.querySelectorAll('.nav-link').forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === '#' + current);
    });
  }

  // Replace all zalo-logo.png images with inline SVG
  document.querySelectorAll('.zalo-logo-img img[src*="zalo-logo.png"]').forEach(img => {
    const size = parseInt(img.getAttribute('width')) || 16;
    const span = document.createElement('span');
    span.className = 'zalo-icon-svg';
    span.innerHTML = zaloIconSvg(size);
    img.parentNode.replaceChild(span, img);
  });

  // Add Zalo icon to all text-only Zalo links (links containing "Zalo" text without an icon)
  document.querySelectorAll('a[href*="zalo.me"]').forEach(link => {
    const hasIcon = link.querySelector('.zalo-icon-svg, .zalo-logo-img, img');
    if (!hasIcon && link.textContent.trim().toLowerCase().includes('zalo')) {
      const icon = document.createElement('span');
      icon.className = 'zalo-icon-svg zalo-inline-icon';
      icon.innerHTML = zaloIconSvg(14);
      icon.style.marginRight = '4px';
      icon.style.display = 'inline-flex';
      icon.style.alignItems = 'center';
      link.insertBefore(icon, link.firstChild);
    }
  });

});

// Zalo helper - Generate Zalo SVG icon
function zaloIconSvg(size) {
  const s = size || 28;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="${s}" height="${s}">
    <rect width="28" height="28" rx="6" fill="#0068ff"/>
    <text x="14" y="19" font-family="Arial,Helvetica,sans-serif" font-weight="bold" font-size="16" fill="#ffffff" text-anchor="middle">Z</text>
  </svg>`;
}

// Generate inline Zalo SVG HTML for direct use in templates
function zaloSvgHtml(size) {
  const s = size || 16;
  return `<span class="zalo-icon-svg">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="${s}" height="${s}">
      <rect width="28" height="28" rx="6" fill="#0068ff"/>
      <text x="14" y="19" font-family="Arial,Helvetica,sans-serif" font-weight="bold" font-size="16" fill="#ffffff" text-anchor="middle">Z</text>
    </svg>
  </span>`;
}

// Zalo booking - open Zalo chat with phone number
function openZaloChat(phone) {
  const p = phone || '0935801229';
  window.open(`https://zalo.me/${p}`, '_blank');
}

// Booking Functions
function openBookingModal() {
  openZaloChat('0935801229');
}

// Service Modal Functions
function openServiceModal(serviceId) {
  if (!window.premiumServicesData) return;
  let service = window.premiumServicesData.find(s => s.id === serviceId);
  if (!service) {
    const hairRemovalServices = {
      triet_nach: {
        title: 'Triệt Nách Chuyên Sâu',
        price: '1.000.000đ',
        desc: 'Liệu trình triệt lông nách bằng công nghệ ánh sáng tiên tiến, giúp loại bỏ tận gốc nang lông, hỗ trợ làm sáng mịn vùng da dưới cánh tay và ngăn mùi hiệu quả.',
        detailImage: 'uploads/triet_nach_before_after.jpg',
        steps: [
          'Vệ sinh và làm sạch vùng da dưới cánh tay',
          'Tỉa gọn lông chuẩn bị cho liệu trình',
          'Thoa gel lạnh bảo vệ và làm dịu da',
          'Tiến hành đi máy ánh sáng triệt lông công nghệ cao',
          'Lau sạch gel và thoa dưỡng chất phục hồi da'
        ]
      },
      triet_mep: {
        title: 'Triệt Mép Chuyên Sâu',
        price: '600.000đ',
        desc: 'Liệu trình triệt lông mép bằng công nghệ ánh sáng tiên tiến, giúp loại bỏ hoàn toàn lớp vi-ô-lông sậm màu xung quanh môi, trả lại làn da mịn màng, trắng sáng tự tin.',
        detailImage: 'uploads/triet_mep_before_after.png',
        steps: [
          'Làm sạch vùng da quanh mép',
          'Thoa gel bảo vệ da chuyên dụng',
          'Tiến hành đi máy triệt lông công nghệ cao',
          'Lau sạch và thoa kem phục hồi cấp ẩm'
        ]
      },
      triet_mat: {
        title: 'Triệt Mặt Chuyên Sâu',
        price: '1.500.000đ',
        desc: 'Phương pháp triệt lông mặt toàn diện giúp se khít lỗ chân lông, hỗ trợ giảm mụn cám, mụn đầu đen và tăng cường hấp thu dưỡng chất dưỡng da tối đa.',
        detailImage: 'uploads/triet_mat_before_after.png',
        steps: [
          'Tẩy trang và rửa mặt sạch sâu',
          'Tẩy tế bào chết nhẹ nhàng trên bề mặt da',
          'Thoa gel lạnh làm dịu da',
          'Thực hiện đi máy triệt lông trên các vùng mặt',
          'Làm sạch gel và đắp mặt nạ làm dịu, se khít lỗ chân lông'
        ]
      },
      triet_tay_half: {
        title: 'Triệt Nửa Tay Chuyên Sâu',
        price: '1.700.000đ',
        desc: 'Liệu trình triệt sạch lông từ khuỷu tay đến cổ tay, mang lại làn da trắng mịn, tự tin diện trang phục ngắn tay.',
        detailImage: 'uploads/triet_tay_half_before_after.png',
        steps: [
          'Vệ sinh sạch sẽ vùng nửa cánh tay',
          'Thoa gel triệt lông chuyên dụng',
          'Tiến hành đi máy ánh sáng triệt lông',
          'Lau sạch và thoa kem dưỡng ẩm phục hồi'
        ]
      },
      triet_tay_full: {
        title: 'Triệt Nguyên Tay Chuyên Sâu',
        price: '2.000.000đ',
        desc: 'Liệu trình triệt sạch lông toàn bộ cánh tay từ bả vai đến ngón tay, kích thích sản sinh collagen giúp da tay đều màu, sáng mịn màng.',
        detailImage: 'uploads/triet_tay_full_before_after.png',
        steps: [
          'Làm sạch toàn bộ cánh tay',
          'Tỉa gọn lông và thoa lớp gel làm dịu mát',
          'Thực hiện đi máy triệt lông toàn bộ cánh tay',
          'Lau sạch gel và bôi dưỡng chất nuôi dưỡng làn da'
        ]
      },
      triet_chan_half: {
        title: 'Triệt Nửa Chân Chuyên Sâu',
        price: '1.800.000đ',
        desc: 'Giải quyết triệt để tình trạng lông rậm rạp ở vùng bắp chân dưới, giúp bạn sở hữu đôi chân nuột nà, mịn màng và tự tin hơn.',
        detailImage: 'uploads/triet_chan_half_before_after.png',
        steps: [
          'Vệ sinh và sát khuẩn nhẹ nhàng vùng bắp chân',
          'Thoa gel lạnh bảo vệ bề mặt da',
          'Điện di ánh sáng triệt lông công nghệ cao',
          'Làm sạch da và thoa kem dưỡng đặc trị giúp se khít chân lông'
        ]
      },
      triet_chan_full: {
        title: 'Triệt Nguyên Chân Chuyên Sâu',
        price: '2.300.000đ',
        desc: 'Liệu trình triệt lông toàn diện từ đùi đến ngón chân. Công nghệ ánh sáng giúp tiêu diệt tận gốc nang lông và cải thiện đáng kể tình trạng viêm nang lông.',
        detailImage: 'uploads/triet_chan_full_before_after.png',
        steps: [
          'Vệ sinh sạch sâu toàn bộ đôi chân',
          'Thoa gel mát lạnh bảo vệ tối đa làn da',
          'Tiến hành triệt lông bằng máy ánh sáng công nghệ cao',
          'Lau gel và thoa tinh chất dưỡng sáng, ngừa viêm nang lông'
        ]
      }
    };
    if (hairRemovalServices[serviceId]) {
      service = {
        id: serviceId,
        ...hairRemovalServices[serviceId]
      };
    }
  }
  if (!service) return;

  document.getElementById('smTitle').innerText = service.title;
  document.getElementById('smPrice').innerText = service.price;
  document.getElementById('smDesc').innerText = service.desc;

  // Render detail image if available
  const imgContainer = document.getElementById('smImageContainer');
  const imgEl = document.getElementById('smImage');
  if (imgContainer && imgEl) {
    if (service.detailImage) {
      imgEl.src = service.detailImage;
      imgContainer.style.display = 'block';
    } else {
      imgEl.src = '';
      imgContainer.style.display = 'none';
    }
  }

  const stepsHtml = service.steps.map((step, index) => {
    return `<li><div class="step-badge">${index + 1}</div><span>${step}</span></li>`;
  }).join('');
  document.getElementById('smSteps').innerHTML = stepsHtml;

  const modal = document.getElementById('serviceModal');
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

function closeServiceModal() {
  const modal = document.getElementById('serviceModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}