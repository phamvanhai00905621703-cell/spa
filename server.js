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

    // Gallery
    db.run(`CREATE TABLE IF NOT EXISTS gallery (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        image_url TEXT,
        thumbnail_url TEXT,
        alt_text TEXT
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
        'about_title': 'Nâng Tầm Vẻ Đẹp<br>Chân Thực Của Bạn',
        'about_desc': 'La Bonita Spa tự hào là địa chỉ điều trị mụn và nám uy tín với hơn 10 năm kinh nghiệm chuẩn y khoa, cam kết hiệu quả thật — giá trị thật.',
        'contact_address': '123 Đường Sắc Đẹp, Quận 1, TP. Hồ Chí Minh',
        'contact_phone': '0988.xxx.xxx – 0912.xxx.xxx',
        'contact_hours': 'Thứ 2–6: 8:30–20:00 &nbsp;|&nbsp; T7–CN: 8:00–21:00'
    };
    for (const [key, value] of Object.entries(defaultContent)) {
        db.run('INSERT OR IGNORE INTO content (key, value) VALUES (?, ?)', [key, value]);
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

    // Gallery Seed
    db.get('SELECT count(*) as count FROM gallery', (err, row) => {
        if (row && row.count === 0) {
            const defaultGallery = [
                ['https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=80', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80', 'Spa interior'],
                ['https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=1200&q=80', 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&q=80', 'Treatment room'],
                ['https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&q=80', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80', 'Skincare']
            ];
            const stmt = db.prepare('INSERT INTO gallery (image_url, thumbnail_url, alt_text) VALUES (?, ?, ?)');
            defaultGallery.forEach(g => stmt.run(g));
            stmt.finalize();
        }
    });

    // Reviews Seed
    db.get('SELECT count(*) as count FROM reviews', (err, row) => {
        if (row && row.count === 0) {
            const defaultReviews = [
                ['Hoàng Minh', 'Học sinh, 18 tuổi', 'Sau 2 tháng điều trị mụn viêm nang tại La Bonita, da mình sạch mụn 90%, không để lại sẹo rỗ.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop', 5],
                ['Thu Thủy', 'Nhân viên VP, 32 tuổi', 'Nám chân sâu sau sinh khiến mình trầm cảm. Nhờ liệu trình Laser mix Meso sau 3 tháng, giờ mình tự tin.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop', 5]
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

app.get('/api/gallery', (req, res) => {
    db.all('SELECT * FROM gallery', (err, rows) => handleDbResult(res, err, rows));
});

app.get('/api/reviews', (req, res) => {
    db.all('SELECT * FROM reviews', (err, rows) => handleDbResult(res, err, rows));
});

app.post('/api/bookings', (req, res) => {
    const { name, phone, service, date, time } = req.body;
    db.run(`INSERT INTO bookings (name, phone, service, date, time) VALUES (?, ?, ?, ?, ?)`, 
        [name, phone, service, date, time], function(err) {
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
        
        db.run(`INSERT INTO ${tableName} (${keys}) VALUES (${placeholders})`, values, function(err) {
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
            db.run(`UPDATE ${tableName} SET ${sets} WHERE id = ?`, [...values, id], function(err) {
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
            db.run(`DELETE FROM ${tableName} WHERE id = ?`, [id], function(err) {
                if (!err) logHistory(admin, 'DELETE', tableName, oldRow, null);
                handleDbResult(res, err);
            });
        });
    });
}

makeCrudRoutes('services', ['title', 'description', 'category', 'price', 'duration', 'image_url', 'badge']);
makeCrudRoutes('gallery', ['image_url', 'thumbnail_url', 'alt_text']);
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
