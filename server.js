require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Setup Multer for Image Uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'la_bonita_spa_super_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 1 day
}));

// Setup Database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Users
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )`);

    // Content
    db.run(`CREATE TABLE IF NOT EXISTS content (
        key TEXT PRIMARY KEY,
        value TEXT
    )`);

    // Services
    db.run(`CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        description TEXT,
        category INTEGER,
        price TEXT,
        duration TEXT,
        image_url TEXT,
        badge TEXT
    )`);

    // Reviews
    db.run(`CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT,
        customer_details TEXT,
        review_text TEXT,
        avatar_url TEXT,
        rating INTEGER
    )`);

    // Bookings
    db.run(`CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        phone TEXT,
        service TEXT,
        date TEXT,
        time TEXT,
        status TEXT DEFAULT 'Pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // History
    db.run(`CREATE TABLE IF NOT EXISTS history_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        admin_username TEXT,
        action_type TEXT,
        table_name TEXT,
        old_value TEXT,
        new_value TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // -----------------------------------------
    // Seed Data (Only runs if tables are empty)
    // -----------------------------------------

    // Default Admin
    db.get('SELECT * FROM users WHERE username = ?', ['admin'], (err, row) => {
        if (!row) {
            const hash = bcrypt.hashSync('password123', 10);
            db.run('INSERT INTO users (username, password) VALUES (?, ?)', ['admin', hash]);
        }
    });

    // Content Seed
    const defaultContent = {
        'hero_title': 'Nơi Phục Hồi<br><em>Làn Da Nguyên Bản</em>',
        'hero_desc': 'Hơn 10 năm kinh nghiệm điều trị mụn & nám chuyên sâu. Phác đồ cá nhân hóa, công nghệ tiên tiến, an toàn tuyệt đối.',
        // New CEO/About content
        'ceo_subtitle': 'CHUYÊN GIA PHỤC HỒI DA CHUYÊN SÂU',
        'ceo_title': '10+ Năm Kinh Nghiệm Chăm Sóc & Phục Hồi Da Chuyên Sâu',
        'ceo_description': '<p class="ceo-desc">Với hơn 10 năm kinh nghiệm chuyên sâu trong lĩnh vực nám, mụn và phục hồi da, CEO Phạm Bảo Ngọc đã đồng hành cùng hàng ngàn khách hàng sở hữu làn da khó, da yếu và tổn thương lâu năm.</p><p class="ceo-desc">Chuyên xử lý các tình trạng nám đậm màu, mụn kéo dài và làn da suy yếu sau nhiều phương pháp không phù hợp, La Bonita Spa tập trung vào phục hồi cấu trúc da và tái tạo nền da khỏe mạnh từ bên trong, thay vì chỉ cải thiện trên bề mặt.</p><p class="ceo-desc">Mỗi liệu trình đều được cá nhân hóa theo tình trạng thực tế của da, ưu tiên sự an toàn, bền vững và nuôi dưỡng nền da khỏe từ gốc. Sau quá trình chăm sóc, làn da vẫn giữ được độ khỏe tự nhiên, hạn chế mỏng yếu, đỏ rát hay nhạy cảm.</p>',
        'ceo_bullet1': 'Chuyên xử lý nám, mụn và da tổn thương lâu năm',
        'ceo_bullet2': 'Phục hồi cấu trúc & tái tạo nền da chuyên sâu',
        'ceo_bullet3': 'Liệu trình an toàn, ưu tiên nền da khỏe tự nhiên',
        'ceo_bullet4': 'Hơn 10 năm kinh nghiệm thực chiến trong ngành chăm sóc da',
        'ceo_quote': '“Làn da đẹp không chỉ là thay đổi vẻ ngoài, mà còn là sự tự tin và cảm giác yêu bản thân mỗi ngày.”',
        'ceo_quote_author': '— CEO Phạm Bảo Ngọc',
        'contact_address': '23 Lỗ Giáng 2, Hoà Xuân, Cẩm Lệ, Đà Nẵng',
        'contact_phone': '0988.xxx.xxx – 0912.xxx.xxx',
        'contact_hours': 'Thứ 2–6: 8:30–20:00 &nbsp;|&nbsp; T7–CN: 8:00–21:00'
    };
    for (const [key, value] of Object.entries(defaultContent)) {
        db.run('INSERT OR IGNORE INTO content (key, value) VALUES (?, ?)', [key, value]);
    }
    
    // Force update CEO section to ensure changes are written even if db is already seeded
    const forceCeoUpdates = {
        'ceo_subtitle': defaultContent.ceo_subtitle,
        'ceo_title': defaultContent.ceo_title,
        'ceo_description': defaultContent.ceo_description,
        'ceo_bullet1': defaultContent.ceo_bullet1,
        'ceo_bullet2': defaultContent.ceo_bullet2,
        'ceo_bullet3': defaultContent.ceo_bullet3,
        'ceo_bullet4': defaultContent.ceo_bullet4
    };
    for (const [key, value] of Object.entries(forceCeoUpdates)) {
        db.run('INSERT OR REPLACE INTO content (key, value) VALUES (?, ?)', [key, value]);
    }

    // Services Seed
    db.get('SELECT count(*) as count FROM services', (err, row) => {
        if (row && row.count === 0) {
            const defaultServices = [
                ['Mụn Nhẹ (Ẩn, Cám, Đầu Đen)', 'Làm sạch sâu, lấy nhân mụn chuẩn y khoa, kiểm soát tuyến bã nhờn.', 1, 'Từ 399.000đ/buổi', '3 – 5 buổi', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80', 'Cơ Bản'],
                ['Mụn Viêm, Sưng Đỏ', 'Kháng viêm, triệt khuẩn tầng sâu, ngăn sẹo rỗ và thâm mụn.', 1, 'Từ 599.000đ/buổi', '1 – 2 tháng', 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&q=80', 'Phổ Biến'],
                ['Nám Mảng, Tàn Nhang Nhẹ', 'Phá vỡ hắc sắc tố nông, làm sáng đều màu da an toàn.', 2, 'Từ 899.000đ/buổi', '4 – 6 tuần', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80', ''],
                ['Nám Chân Sâu (Laser)', 'Laser bóc tách nám gốc sâu tại trung bì. Không xâm lấn, không nghỉ dưỡng lâu.', 2, 'Theo liệu trình', '2 – 3 tháng', 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&q=80', 'Laser']
            ];
            const stmt = db.prepare('INSERT INTO services (title, description, category, price, duration, image_url, badge) VALUES (?, ?, ?, ?, ?, ?, ?)');
            defaultServices.forEach(s => stmt.run(s));
            stmt.finalize();
        }
    });

    // Reviews Seed
    db.get('SELECT count(*) as count FROM reviews', (err, row) => {
        if (row && row.count === 0) {
            const defaultReviews = [
                ['Hoàng Minh', 'Học sinh, 18 tuổi', 'Sau 2 tháng điều trị mụn viêm nang tại La Bonita, da mình sạch mụn 90%, không để lại sẹo rỗ. Dù còn vài vết thâm nhỏ nhưng mình thấy hài lòng.', '', 5],
                ['Thu Thủy', 'Nhân viên VP, 32 tuổi', 'Nám chân sâu sau sinh khiến mình trầm cảm. Nhờ liệu trình Laser mix Meso sau 3 tháng, da sáng lên thấy rõ, không còn tự ti nữa.', '', 5],
                ['Thanh Hà', 'GV mầm non, 28 tuổi', 'Da mình cải thiện khá rõ sau vài buổi. Lúc đầu cũng hơi lo nhưng được tư vấn kỹ nên yên tâm hơn. Cảm ơn team.', '', 5],
                ['Minh Tuấn', 'Kỹ sư CNTT, 26 tuổi', 'Mình bị mụn từ cấp 3, đi nhiều chỗ không khỏi. Ở đây làm kỹ, không bị ép mua thêm sản phẩm. Da đỡ dầu hẳn.', '', 5],
                ['Phương Anh', 'Freelancer, 24 tuổi', 'Không gian yên tĩnh, thư giãn thật sự. Lấy nhân mụn nhẹ tay, không đau như mình nghĩ.', '', 5],
                ['Kim Ngân', 'Nhân viên NH, 30 tuổi', 'Nhân viên tư vấn kỹ và nhẹ nhàng. Mình từng thử nhiều nơi nhưng ở đây khá ổn, giá hợp lý.', '', 5],
                ['Hoàng Long', 'Sinh viên, 20 tuổi', 'Lần đầu đi spa nên hơi ngại, nhưng chị tư vấn viên rất thân thiện. Da mặt đỡ mụn hơn sau 1 tuần.', '', 5],
                ['Bích Trâm', 'Nội trợ, 35 tuổi', 'Da nhạy cảm nên mình ngại đi spa. Ở đây dùng sản phẩm dịu nhẹ, không kích ứng. Sẽ quay lại.', '', 5],
                ['Quốc Bảo', 'Nhân viên văn phòng, 27 tuổi', 'Mình ít khi viết đánh giá nhưng lần này thấy hài lòng. Da bớt đỏ và mụn giảm rõ sau 3 buổi.', '', 5],
                ['Yến Nhi', 'Tiếp viên hàng không, 29 tuổi', 'Lịch trình bận rộn nên cần chỗ làm nhanh mà hiệu quả. La Bonita đáp ứng tốt, không mất nhiều thời gian.', '', 5],
                ['Mỹ Linh', 'Nhà thiết kế, 31 tuổi', 'Cảm giác thư giãn ngay từ bước massage mặt. Da sau liệu trình mềm và sáng hơn hẳn.', '', 5],
                ['Đức Huy', 'Kinh doanh tự do, 33 tuổi', 'Ban đầu mình cũng bán tín bán nghi nhưng làm xong thấy da thật sự khác. Sẽ giới thiệu bạn bè.', '', 5],
                ['Ngọc Trâm', 'Sinh viên, 21 tuổi', 'Được tư vấn rất tận tình, không hề bị chèo kéo như mấy chỗ khác. Da cải thiện từ từ.', '', 5],
                ['Anh Thư', 'Giáo viên, 29 tuổi', 'Kỹ thuật lấy nhân mụn nhẹ nhàng, không rát. Phòng sạch sẽ, thoáng mát. Hài lòng.', '', 5],
                ['Văn Hải', 'Kỹ thuật viên, 25 tuổi', 'Mình bị mụn lưng, tưởng không làm được nhưng ở đây có dịch vụ luôn. Đỡ ngứa và mụn giảm.', '', 5],
                ['Diễm My', 'Chuyên viên truyền thông, 27 tuổi', 'Đặt lịch nhanh, được nhắc lịch trước khi đến. Dịch vụ chuyên nghiệp, không phải chờ lâu.', '', 5],
                ['Trọng Nhân', 'Nhân viên kỹ thuật, 30 tuổi', 'Da dầu mụn từ lâu, thử ở đây thấy ổn. Bác sĩ tư vấn dễ hiểu, không dùng từ chuyên môn khó.', '', 5],
                ['Huyền My', 'Nhân viên sale, 23 tuổi', 'Phòng treatment nhìn sang trọng, sạch sẽ. Cảm giác như đang ở resort chứ không phải spa.', '', 5],
                ['Khánh Vân', 'Content creator, 26 tuổi', 'Mình làm bên mảng làm đẹp nên khá kỹ tính. La Bonita làm tốt, sản phẩm dùng rõ ràng.', '', 5],
                ['Thành Luân', 'Tài xế công nghệ, 28 tuổi', 'Vợ chở tới, lúc đầu ngại vì ít đàn ông đi spa. Nhưng vào làm xong thấy thoải mái, da mặt sạch hơn.', '', 5]
            ];
            const stmt = db.prepare('INSERT INTO reviews (customer_name, customer_details, review_text, avatar_url, rating) VALUES (?, ?, ?, ?, ?)');
            defaultReviews.forEach(r => stmt.run(r));
            stmt.finalize();
        }
    });
});

// Helper for generic API responses
function handleDbResult(res, err, data = null, successMsg = 'Success') {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, message: successMsg, data });
}

// History Logging Helper
function logHistory(admin, action, table, oldVal, newVal) {
    db.run('INSERT INTO history_logs (admin_username, action_type, table_name, old_value, new_value) VALUES (?, ?, ?, ?, ?)',
        [admin, action, table, JSON.stringify(oldVal), JSON.stringify(newVal)]
    );
}

// Auth Middleware
function requireAuth(req, res, next) {
    if (req.session && req.session.userId) next();
    else res.status(401).json({ success: false, error: 'Unauthorized' });
}

// ==========================
// Auth APIs
// ==========================
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login requests per windowMs
    message: { success: false, message: 'Too many login attempts, please try again later' }
});

// app.post('/api/admin/login', loginLimiter, (req, res) => {
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (user && bcrypt.compareSync(password, user.password)) {
            req.session.userId = user.id;
            req.session.username = user.username;
            res.json({ success: true });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    });
});

app.post('/api/admin/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

app.get('/api/admin/session', (req, res) => {
    if (req.session && req.session.userId) res.json({ loggedIn: true, username: req.session.username });
    else res.json({ loggedIn: false });
});

// ==========================
// Public APIs (GET Only)
// ==========================
app.get('/api/content', (req, res) => {
    db.all('SELECT * FROM content', (err, rows) => {
        if (err) return handleDbResult(res, err);
        const content = {};
        rows.forEach(r => content[r.key] = r.value);
        res.json(content);
    });
});

app.get('/api/services', (req, res) => {
    db.all('SELECT * FROM services', (err, rows) => handleDbResult(res, err, rows));
});

app.get('/api/reviews', (req, res) => {
    db.all('SELECT * FROM reviews', (err, rows) => handleDbResult(res, err, rows));
});

app.post('/api/bookings', (req, res) => {
    const { name, phone, service, date, time } = req.body;
    db.run(`INSERT INTO bookings (name, phone, service, date, time) VALUES (?, ?, ?, ?, ?)`,
        [name, phone, service, date, time], function (err) {
            handleDbResult(res, err, { id: this.lastID }, 'Booking successful');
        });
});

// ==========================
// Protected Admin APIs (CRUD)
// ==========================
app.put('/api/admin/content', requireAuth, (req, res) => {
    const updates = req.body;
    const admin = req.session.username;
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        for (const [key, newVal] of Object.entries(updates)) {
            db.get('SELECT value FROM content WHERE key = ?', [key], (err, row) => {
                if (row && row.value !== newVal) {
                    logHistory(admin, 'UPDATE', 'content', row.value, newVal);
                    db.run('UPDATE content SET value = ? WHERE key = ?', [newVal, key]);
                }
            });
        }
        db.run('COMMIT');
        res.json({ success: true });
    });
});

// CRUD Helper
function makeCrudRoutes(tableName, columns) {
    // CREATE
    app.post(`/api/admin/${tableName}`, requireAuth, (req, res) => {
        const admin = req.session.username;
        const keys = columns.join(', ');
        const placeholders = columns.map(() => '?').join(', ');
        const values = columns.map(c => req.body[c]);

        db.run(`INSERT INTO ${tableName} (${keys}) VALUES (${placeholders})`, values, function (err) {
            if (!err) logHistory(admin, 'CREATE', tableName, null, req.body);
            handleDbResult(res, err, { id: this.lastID });
        });
    });

    // UPDATE
    app.put(`/api/admin/${tableName}/:id`, requireAuth, (req, res) => {
        const admin = req.session.username;
        const id = req.params.id;
        const sets = columns.map(c => `${c} = ?`).join(', ');
        const values = columns.map(c => req.body[c]);

        db.get(`SELECT * FROM ${tableName} WHERE id = ?`, [id], (err, oldRow) => {
            if (err || !oldRow) return handleDbResult(res, err || new Error('Not found'));
            db.run(`UPDATE ${tableName} SET ${sets} WHERE id = ?`, [...values, id], function (err) {
                if (!err) logHistory(admin, 'UPDATE', tableName, oldRow, req.body);
                handleDbResult(res, err);
            });
        });
    });

    // DELETE
    app.delete(`/api/admin/${tableName}/:id`, requireAuth, (req, res) => {
        const admin = req.session.username;
        const id = req.params.id;
        db.get(`SELECT * FROM ${tableName} WHERE id = ?`, [id], (err, oldRow) => {
            if (err || !oldRow) return handleDbResult(res, err || new Error('Not found'));
            db.run(`DELETE FROM ${tableName} WHERE id = ?`, [id], function (err) {
                if (!err) logHistory(admin, 'DELETE', tableName, oldRow, null);
                handleDbResult(res, err);
            });
        });
    });
}

makeCrudRoutes('services', ['title', 'description', 'category', 'price', 'duration', 'image_url', 'badge']);
makeCrudRoutes('reviews', ['customer_name', 'customer_details', 'review_text', 'avatar_url', 'rating']);
makeCrudRoutes('bookings', ['name', 'phone', 'service', 'date', 'time', 'status']);

app.get('/api/admin/bookings', requireAuth, (req, res) => {
    db.all('SELECT * FROM bookings ORDER BY created_at DESC', (err, rows) => handleDbResult(res, err, rows));
});

app.post('/api/admin/upload', requireAuth, upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });
    const imageUrl = '/uploads/' + req.file.filename;
    res.json({ success: true, url: imageUrl });
});

app.get('/api/admin/stats', requireAuth, (req, res) => {
    db.serialize(() => {
        let stats = {};
        db.get('SELECT count(*) as count FROM services', (err, row) => stats.services = row ? row.count : 0);
        db.get('SELECT count(*) as count FROM bookings', (err, row) => stats.bookings = row ? row.count : 0);
        db.get('SELECT count(*) as count FROM reviews', (err, row) => stats.reviews = row ? row.count : 0);
        db.get('SELECT count(*) as count FROM bookings WHERE status = "Pending"', (err, row) => {
            stats.pending_bookings = row ? row.count : 0;
            res.json({ success: true, data: stats });
        });
    });
});

app.get('/api/admin/history', requireAuth, (req, res) => {
    db.all('SELECT * FROM history_logs ORDER BY timestamp DESC LIMIT 100', (err, rows) => {
        handleDbResult(res, err, rows);
    });
});

// Serve Static Files
app.use(express.static(__dirname));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin', 'dashboard.html')));
app.get('/admin/login', (req, res) => res.sendFile(path.join(__dirname, 'admin', 'login.html')));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
