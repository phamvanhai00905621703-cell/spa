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
      if (document.getElementById('dyn_about_title')) document.getElementById('dyn_about_title').innerHTML = content.about_title || '';
      if (document.getElementById('dyn_about_desc')) document.getElementById('dyn_about_desc').innerHTML = content.about_desc || '';
    }

    function renderServiceCard(s) {
        const badgeClass = (s.badge === 'Phổ Biến' || s.badge === 'Laser') ? 'hot' : (s.badge === 'Đặc Trị' || s.badge === 'Mix Therapy' ? 'dark' : '');
        const badge = s.badge ? `<span class="badge-tag ${badgeClass}">${s.badge}</span>` : '';
        return `<a href="#" class="service-card reveal">
            <div class="card-img"><img src="${s.image_url}" alt="${s.title}">${badge}</div>
            <div class="card-body">
            <h4>${s.title}</h4>
            <p>${s.description}</p>
            <div class="card-meta"><i class="far fa-clock"></i> ${s.duration} &nbsp;·&nbsp; <strong>${s.price}</strong></div>
            <span class="btn-detail">Xem chi tiết <i class="fas fa-arrow-right"></i></span>
            </div>
        </a>`;
    }

    const svcGrid1 = document.getElementById('dyn_services_grid_1');
    const svcGrid2 = document.getElementById('dyn_services_grid_2');
    if (svcGrid1 || svcGrid2) {
        const sRes = await fetch('/api/services');
        if (sRes.ok) {
            const { data } = await sRes.json();
            if (svcGrid1) svcGrid1.innerHTML = data.filter(s => s.category == 1).map(renderServiceCard).join('');
            if (svcGrid2) svcGrid2.innerHTML = data.filter(s => s.category == 2).map(renderServiceCard).join('');
        }
    }

    const galGrid = document.getElementById('dyn_gallery_grid');
    if (galGrid) {
        const gRes = await fetch('/api/gallery');
        if (gRes.ok) {
            const { data } = await gRes.json();
            galGrid.innerHTML = data.map(g => `<div class="gallery-item reveal" data-src="${g.image_url}"><img src="${g.thumbnail_url || g.image_url}" alt="${g.alt_text}"><div class="gal-overlay"><i class="fas fa-expand"></i></div></div>`).join('');
            bindLightbox(); // Re-bind after injecting
        }
    }

    const revGrid = document.getElementById('dyn_reviews_grid');
    if (revGrid) {
        const rRes = await fetch('/api/reviews');
        if (rRes.ok) {
            const { data } = await rRes.json();
            revGrid.innerHTML = data.map(r => `<div class="testi-card reveal"><div class="stars">${'<i class="fas fa-star"></i>'.repeat(r.rating)}</div><p>"${r.review_text}"</p><div class="testi-author"><img src="${r.avatar_url}" alt="${r.customer_name}"><div><strong>${r.customer_name}</strong><span>${r.customer_details}</span></div></div></div>`).join('');
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

    // Gallery Filtering
    const filterBtns = document.querySelectorAll('.filter-btn');
    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.dataset.filter;
                document.querySelectorAll('.gallery-item').forEach(item => {
                    if (filter === 'all' || item.dataset.cat === filter) {
                        item.style.display = 'block';
                        setTimeout(() => item.classList.add('visible'), 10);
                    } else {
                        item.style.display = 'none';
                        item.classList.remove('visible');
                    }
                });
            });
        });
    }

  } catch(e) {
    console.error("Failed to fetch dynamic content", e);
  }

  // 1. Header scroll effect
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

  // 2. Mobile nav toggle
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

  // 3. Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = header ? header.offsetHeight : 0;
      window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
    });
  });

  // 4. Scroll reveal
  function revealOnScroll() {
    document.querySelectorAll('.reveal').forEach(el => {
      if (el.getBoundingClientRect().top < window.innerHeight - 80) {
        el.classList.add('visible');
      }
    });
  }
  revealOnScroll();

  // 5. Active nav link on scroll
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

  // 6. Gallery Lightbox with Navigation
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  const lbClose = document.getElementById('lbClose');
  let currentGallery = [];
  let currentIndex = 0;

  if (lightbox && lbImg) {
    // Add Nav Buttons if not present
    if (!document.querySelector('.lb-nav')) {
        const nav = document.createElement('div');
        nav.className = 'lb-nav';
        nav.innerHTML = `
            <button id="lbPrev"><i class="fas fa-chevron-left"></i></button>
            <button id="lbNext"><i class="fas fa-chevron-right"></i></button>
        `;
        lightbox.appendChild(nav);
        document.getElementById('lbPrev').onclick = (e) => { e.stopPropagation(); navigateLightbox(-1); };
        document.getElementById('lbNext').onclick = (e) => { e.stopPropagation(); navigateLightbox(1); };
    }

    function openLightbox(index, items) {
      currentGallery = items;
      currentIndex = index;
      updateLightbox();
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function updateLightbox() {
      const item = currentGallery[currentIndex];
      lbImg.style.opacity = '0';
      setTimeout(() => {
        lbImg.src = item.dataset.src;
        lbImg.style.opacity = '1';
      }, 200);
    }

    function navigateLightbox(dir) {
      currentIndex = (currentIndex + dir + currentGallery.length) % currentGallery.length;
      updateLightbox();
    }

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }

    window.bindLightbox = function() {
        const items = Array.from(document.querySelectorAll('.gallery-item'));
        items.forEach((item, index) => {
            item.onclick = () => openLightbox(index, items);
        });
    };

    if (lbClose) lbClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', e => { 
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
    });

    window.bindLightbox();
  }
});

// Booking Modal Functions
function openBookingModal() {
    const modal = document.getElementById('bookingModal');
    if(modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeBookingModal() {
    const modal = document.getElementById('bookingModal');
    if(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        document.getElementById('bookingAlert').style.display = 'none';
        document.getElementById('bookingForm').reset();
    }
}

async function submitBooking(e) {
    e.preventDefault();
    const payload = {
        name: document.getElementById('bk_name').value,
        phone: document.getElementById('bk_phone').value,
        service: document.getElementById('bk_service').value,
        date: document.getElementById('bk_date').value,
        time: document.getElementById('bk_time').value
    };
    
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    btn.disabled = true;

    try {
        const res = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if(data.success) {
            document.getElementById('bookingForm').style.display = 'none';
            document.getElementById('bookingAlert').style.display = 'block';
        } else {
            alert('Lỗi: ' + data.error);
        }
    } catch (err) {
        alert('Lỗi kết nối. Vui lòng thử lại sau.');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}
