require('dotenv').config();

const express = require('express');
const passport = require('passport');
const cookieParser = 'cookie-parser';
const bodyParser = require('body-parser');
const cors = require('cors');

const connectDatabase = require('./config/database');
const errorHandler = require('./src/middleware/error'); // Giữ lại từ nhánh 'phat'
const passportConfig = require('./src/config/passport'); // Giữ lại từ nhánh 'main'

// KẾT HỢP IMPORTS TỪ CẢ HAI NHÁNH
// --- Nhánh 'phat' ---
const courseRoutes = require('./src/routes/courseRoutes');
const unitRoutes = require('./src/routes/unitRoutes');
const lessonRoutes = require('./src/routes/lessonRoutes');
const vocabularyRoutes = require('./src/routes/vocabularyRoutes');
const exerciseRoutes = require('./src/routes/exerciseRoutes');
const testRoutes = require('./src/routes/testRoutes');
const deckRoutes = require('./src/routes/deckRoutes');
const flashcardRoutes = require('./src/routes/flashcardRoutes');
const achievementRoutes = require('./src/routes/achievementRoutes');
// --- Nhánh 'main' ---
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');


const app = express();
const PORT = process.env.PORT || 1124;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Kết nối tới MongoDB
connectDatabase();

// Cấu hình CORS (chỉ cần một lần)
const corsOptions = {
    origin: [CLIENT_URL, 'http://localhost:3000', 'http://localhost:3001'], // Hỗ trợ nhiều frontend URL
    credentials: true,
};
app.use(cors(corsOptions));

// Middlewares
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Khởi tạo Passport (từ nhánh 'main')
app.use(passport.initialize());
passportConfig();


// KẾT HỢP ROUTES TỪ CẢ HAI NHÁNH
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/units', unitRoutes);
app.use('/api/v1/lessons', lessonRoutes);
app.use('/api/v1/vocabularies', vocabularyRoutes);
app.use('/api/v1/exercises', exerciseRoutes);
app.use('/api/v1/tests', testRoutes);
app.use('/api/v1/decks', deckRoutes);
app.use('/api/v1/flashcards', flashcardRoutes);
app.use('/api/v1/achievements', achievementRoutes);


// Route gốc đã được hợp nhất và làm phong phú hơn
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Chào mừng đến với API English Master',
        version: '1.0.0',
        endpoints: {
            // Endpoints từ nhánh 'main'
            auth: '/api/auth',
            users: '/api/users',
            // Endpoints từ nhánh 'phat'
            courses: '/api/v1/courses',
            units: '/api/v1/units',
            lessons: '/api/v1/lessons',
            vocabularies: '/api/v1/vocabularies',
            exercises: '/api/v1/exercises',
            tests: '/api/v1/tests',
            decks: '/api/v1/decks',
            flashcards: '/api/v1/flashcards',
            achievements: '/api/v1/achievements'
        }
    });
});

// Sử dụng error handler chung
app.use(errorHandler);

// 404 handler (nên đặt sau các routes và trước error handler chung)
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint không tồn tại',
    });
});


// Khởi động server
app.listen(PORT, () => {
    console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
    console.log(`✅ CORS được bật cho: ${CLIENT_URL}`);
});
