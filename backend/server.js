require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDatabase = require('./config/database');
const errorHandler = require('./src/middleware/error');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const courseRoutes = require('./src/routes/courseRoutes');
const unitRoutes = require('./src/routes/unitRoutes');
const lessonRoutes = require('./src/routes/lessonRoutes');
const vocabularyRoutes = require('./src/routes/vocabularyRoutes');
const exerciseRoutes = require('./src/routes/exerciseRoutes');
const testRoutes = require('./src/routes/testRoutes');
const deckRoutes = require('./src/routes/deckRoutes');
const flashcardRoutes = require('./src/routes/flashcardRoutes');
const achievementRoutes = require('./src/routes/achievementRoutes');

const app = express();
const PORT = process.env.PORT || 1124;

// Kết nối Database
connectDatabase();

// CORS Configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001'], // Frontend URLs
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions)); // ✅ Thêm CORS
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/units', unitRoutes);
app.use('/api/v1/lessons', lessonRoutes);
app.use('/api/v1/vocabularies', vocabularyRoutes);
app.use('/api/v1/exercises', exerciseRoutes);
app.use('/api/v1/tests', testRoutes);
app.use('/api/v1/decks', deckRoutes);
app.use('/api/v1/flashcards', flashcardRoutes);
app.use('/api/v1/achievements', achievementRoutes);

// Route mặc định
app.get('/', (req, res) => {
  res.json({ 
    message: 'Chào mừng đến với API APPTA',
    endpoints: {
      auth: '/api/auth',
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

// Error handler middleware
app.use(errorHandler);

// Khởi động server
app.listen(PORT, () => {
  console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
  console.log(`✅ CORS enabled for: http://localhost:3000`);
});