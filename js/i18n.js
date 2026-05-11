const i18n = {
    vi: {
        "home": "Trang chủ",
        "about": "Giới thiệu",
        "services": "Dịch vụ",
        "gallery": "Hình ảnh",
        "reviews": "Đánh giá",
        "contact": "Liên hệ",
        "book_now": "Đặt Lịch Ngay",
        "exp_badge": "Chuẩn Y Khoa · Da Liễu",
        "years_exp": "<span class='num'>10+</span><span class='label'>Năm kinh nghiệm</span>",
        "happy_clients": "<span class='num'>1000+</span><span class='label'>Khách hài lòng</span>",
        "positive_results": "<span class='num'>98%</span><span class='label'>Hiệu quả tích cực</span>",
        "about_sub": "Về Chúng Tôi",
        "about_ceo_role": "CEO · Chuyên gia Da Liễu Cao Cấp",
        "about_ceo_desc": "Hơn một thập kỷ tận tâm đồng hành cùng hàng ngàn khách hàng tìm lại sự tự tin.",
        "booking_title": "Đặt Lịch Khám",
        "booking_desc": "Vui lòng để lại thông tin, chuyên viên của chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.",
        "name_placeholder": "Họ và tên của bạn",
        "phone_placeholder": "Số điện thoại",
        "service_placeholder": "Chọn dịch vụ quan tâm",
        "service_acne": "Điều trị Mụn",
        "service_melasma": "Điều trị Nám",
        "service_other": "Khác",
        "date_placeholder": "Ngày mong muốn",
        "time_placeholder": "Giờ mong muốn",
        "submit_booking": "Gửi Yêu Cầu",
        "booking_success": "Đặt lịch thành công! Chúng tôi sẽ gọi lại cho bạn sớm nhất.",
        "hours_title": "Giờ Mở Cửa"
    },
    en: {
        "home": "Home",
        "about": "About Us",
        "services": "Services",
        "gallery": "Gallery",
        "reviews": "Reviews",
        "contact": "Contact",
        "book_now": "Book Now",
        "exp_badge": "Medical Standard · Dermatology",
        "years_exp": "<span class='num'>10+</span><span class='label'>Years Exp</span>",
        "happy_clients": "<span class='num'>1000+</span><span class='label'>Happy Clients</span>",
        "positive_results": "<span class='num'>98%</span><span class='label'>Positive Results</span>",
        "about_sub": "About Us",
        "about_ceo_role": "CEO · Senior Dermatologist",
        "about_ceo_desc": "Over a decade dedicated to helping thousands of clients regain their confidence.",
        "booking_title": "Book an Appointment",
        "booking_desc": "Please leave your information, our specialist will contact you shortly.",
        "name_placeholder": "Your Full Name",
        "phone_placeholder": "Phone Number",
        "service_placeholder": "Select Service",
        "service_acne": "Acne Treatment",
        "service_melasma": "Melasma Treatment",
        "service_other": "Other",
        "date_placeholder": "Preferred Date",
        "time_placeholder": "Preferred Time",
        "submit_booking": "Submit Request",
        "booking_success": "Booking successful! We will call you back shortly.",
        "hours_title": "Opening Hours"
    }
};

window.i18n = i18n;

function changeLanguage(lang) {
    localStorage.setItem('spa_lang', lang);
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[lang][key]) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
                if(el.tagName === 'INPUT' && (el.type === 'text' || el.type === 'tel')) {
                    el.placeholder = i18n[lang][key];
                } else if(el.tagName === 'SELECT') {
                    // special case for select first option
                    if(el.options[0] && el.options[0].value === '') el.options[0].text = i18n[lang][key];
                }
            } else {
                el.innerHTML = i18n[lang][key];
            }
        }
    });
    
    // Update active state of lang switcher
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById('lang_' + lang);
    if(btn) btn.classList.add('active');

    // Update select options translations (since they are children of select)
    document.querySelectorAll('option[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if(i18n[lang][key]) el.text = i18n[lang][key];
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('spa_lang') || 'vi';
    changeLanguage(savedLang);
});
