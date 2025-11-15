import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';

// Import pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Lesson from './pages/Lesson';
import Practice from './pages/Practice';
import Progress from './pages/Progress';
import Profile from './pages/Profile';
import ScrollToTop from './components/ScrollToTop';
import ForgotPassword from './pages/ForgotPassword';
import Leaderboard from './pages/leaderboard';
import Welcome from './pages/Welcome';
import Learn from './pages/Learn';
import Settings from './pages/Settings';
import AccountSettings from './pages/AccountSettings';
import ProfileSettings from './pages/ProfileSettings';
import NotificationsSettings from './pages/NotificationsSettings';
import SocialSettings from './pages/SocialSettings';
import PrivacySettings from './pages/PrivacySettings';
import ProtectedRoute from './components/ProtectedRoute';
import Guidebook from './pages/Guidebook';
import Characters from './pages/Characters';
import PronunciationPractice from './pages/PronunciationPractice';
import Quests from './pages/Quests';
import Shop from './pages/Shop';
import OAuthSuccess from './pages/OAuthSuccess';
import AuditLog from './pages/AuditLog';
import Notifications from './pages/Notifications';
import LearningGoals from './pages/LearningGoals';
import TopicFlashcards from './pages/TopicFlashcards';
import Decks from './pages/Decks';
import Flashcards from './pages/Flashcards';
import PracticeTest from './pages/PracticeTest';
import Worldbank from './pages/Worldbank';
import DeckReviews from './pages/DeckReviews';
import QuizBank from './pages/QuizBank';
import PersonalizedRoadmap from './pages/PersonalizedRoadmap';
import FlashcardReview from './pages/FlashcardReview';
import AIFlashcardGenerator from './pages/AIFlashcardGenerator';
import RoadmapStepExercises from './pages/RoadmapStepExercises';
import Verify2FA from './pages/Verify2FA';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminCourses from './pages/AdminCourses';
import AdminUsers from './pages/AdminUsers';
import AdminUnits from './pages/AdminUnits';
import AdminLessons from './pages/AdminLessons';
import AdminVocabularies from './pages/AdminVocabularies';
import AdminExercises from './pages/AdminExercises';
import AdminAchievements from './pages/AdminAchievements';
import AdminTests from './pages/AdminTests';
import AdminDecks from './pages/AdminDecks';
import AdminFlashcards from './pages/AdminFlashcards';
import AdminLeaderboard from './pages/AdminLeaderboard';

// Admin CRUD Forms
import AdminCourseForm from './pages/AdminCourseForm';
import AdminUnitForm from './pages/AdminUnitForm';
import AdminLessonForm from './pages/AdminLessonForm';
import AdminVocabularyForm from './pages/AdminVocabularyForm';
import AdminExerciseForm from './pages/AdminExerciseForm';
import AdminAchievementForm from './pages/AdminAchievementForm';
import AdminTestForm from './pages/AdminTestForm';
import AdminDeckForm from './pages/AdminDeckForm';
import AdminFlashcardForm from './pages/AdminFlashcardForm';
import AdminNotifications from './pages/AdminNotifications';
import AdminAuditlog from './pages/AdminAuditlog';
import AdminSettings from './pages/AdminSettings';
import AdminFlashcardBulkCreate from './pages/AdminFlashcardBulkCreate';
import AdminDeckDetail from './pages/AdminDeckDetail';
import AdminVocabularyBulkCreate from './pages/AdminVocabularyBulkCreate';
import AdminVocabularyAICreate from './pages/AdminVocabularyAICreate';

// Import Styles
import './styles/App.css';
import PronunciationChecker from './pages/PronunciationChecker';
import PronunciationCheckerPage from './pages/PronunciationCheckerPage';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* ========== PUBLIC ROUTES ========== */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* ========== PROTECTED ROUTES ========== */}
          <Route path="/welcome" element={
            <ProtectedRoute>
              <Welcome />
            </ProtectedRoute>
          } />

          <Route path="/learn" element={
            <ProtectedRoute>
              <Learn />
            </ProtectedRoute>
          } />

          <Route path="/lesson/:lessonId" element={
            <ProtectedRoute>
              <Lesson />
            </ProtectedRoute>
          } />

          <Route path="/practice" element={
            <ProtectedRoute>
              <Practice />
            </ProtectedRoute>
          } />

          <Route path="/progress" element={
            <ProtectedRoute>
              <Progress />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          <Route path="/leaderboard" element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          } />

          <Route path="/quests" element={
            <ProtectedRoute>
              <Quests />
            </ProtectedRoute>
          } />

          <Route path="/shop" element={
            <ProtectedRoute>
              <Shop />
            </ProtectedRoute>
          } />

          {/* Settings Routes */}
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />

          <Route path="/settings/account" element={
            <ProtectedRoute>
              <AccountSettings />
            </ProtectedRoute>
          } />

          <Route path="/settings/profile" element={
            <ProtectedRoute>
              <ProfileSettings />
            </ProtectedRoute>
          } />

          <Route path="/settings/notifications" element={
            <ProtectedRoute>
              <NotificationsSettings />
            </ProtectedRoute>
          } />

          <Route path="/settings/social" element={
            <ProtectedRoute>
              <SocialSettings />
            </ProtectedRoute>
          } />

          <Route path="/settings/privacy" element={
            <ProtectedRoute>
              <PrivacySettings />
            </ProtectedRoute>
          } />

          {/* Learning Resources */}
          <Route path="/guidebook/:unitId/:lessonId" element={
            <ProtectedRoute>
              <Guidebook />
            </ProtectedRoute>
          } />

          <Route path="/characters" element={
            <ProtectedRoute>
              <Characters />
            </ProtectedRoute>
          } />

          <Route path="/goals" element={
            <ProtectedRoute>
              <LearningGoals />
            </ProtectedRoute>
          } />
          
          <Route path="/verify-2fa" element={<Verify2FA />} />
        
         
          <Route path="/decks" element={
            <ProtectedRoute>
              <Decks />
            </ProtectedRoute>
          } />

          <Route path="/decks/:deckId/study" element={
            <ProtectedRoute>
              <TopicFlashcards />
            </ProtectedRoute>
          } />

          <Route path="/pronunciation" element={
            <ProtectedRoute>
              <PronunciationPractice />
            </ProtectedRoute>
          } />

          <Route path="/settings/audit-log" element={
            <ProtectedRoute>
              <AuditLog />
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          } />
          <Route path="/practice" element={
            <ProtectedRoute>
              <Practice />
            </ProtectedRoute>
          } />
          <Route path="/practice/:id" element={
            <ProtectedRoute>
              <PracticeTest />
            </ProtectedRoute>
          } />
          <Route path="/flashcards" element={
            <ProtectedRoute>
              <Flashcards />
            </ProtectedRoute>
          } />
          <Route path="/worldbank" element={<Worldbank />} />
          <Route path="/decks/:deckId/reviews" element={<DeckReviews />} />
          <Route path="/quiz-bank" element={<QuizBank />} />
          <Route path="/roadmap" element={<PersonalizedRoadmap />} />
          <Route path="/flashcards/review/:deckId" element={<FlashcardReview />} />
          <Route path="/ai-flashcards" element={<AIFlashcardGenerator />} />
          <Route 
            path="/roadmap-step/:roadmapId/:stepNumber" 
            element={
              <ProtectedRoute>
                <RoadmapStepExercises />
              </ProtectedRoute>
            } 
          />
          {/* ========== ADMIN DASHBOARD & PAGES ========== */}
          
          {/* Dashboard */}
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Users Management */}
          <Route path="/admin/users" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminUsers />
            </ProtectedRoute>
          } />

          {/* Content Management */}
          <Route path="/admin/courses" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminCourses />
            </ProtectedRoute>
          } />

          <Route path="/admin/units" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminUnits />
            </ProtectedRoute>
          } />

          <Route path="/admin/lessons" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLessons />
            </ProtectedRoute>
          } />

          <Route path="/admin/vocabularies" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminVocabularies />
            </ProtectedRoute>
          } />
          <Route path="/admin/vocabularies/bulk-create" element={<AdminVocabularyBulkCreate />} />
          <Route path="/admin/vocabularies/ai-create" element={<AdminVocabularyAICreate />} />

          <Route path="/admin/exercises" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminExercises />
            </ProtectedRoute>
          } />

          <Route path="/admin/tests" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminTests />
            </ProtectedRoute>
          } />

          {/* Flashcard & Deck */}
          <Route path="/admin/decks" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDecks />
            </ProtectedRoute>
          } />
          <Route path="/admin/decks/:id" element={
          <ProtectedRoute allowedRoles={['admin', 'teacher']}>
            <AdminDeckDetail />
          </ProtectedRoute>
        } />

          <Route path="/admin/flashcards" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminFlashcards />
            </ProtectedRoute>
          } />

          {/* Gamification */}
          <Route path="/admin/achievements" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminAchievements />
            </ProtectedRoute>
          } />

          <Route path="/admin/leaderboard" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLeaderboard />
            </ProtectedRoute>
          } />

          <Route path="/admin/notifications" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminNotifications />
            </ProtectedRoute>
          } />
          <Route path="/admin/audit-log" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminAuditlog />
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminSettings />
            </ProtectedRoute>
          } />

          {/* ========== ADMIN CRUD ROUTES ========== */}
          
          {/* Course CRUD */}
          <Route path="/admin/courses/create" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminCourseForm />
            </ProtectedRoute>
          } />
          <Route path="/admin/courses/edit/:id" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminCourseForm />
            </ProtectedRoute>
          } />

          {/* Unit CRUD */}
          <Route path="/admin/units/create" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminUnitForm />
            </ProtectedRoute>
          } />
          <Route path="/admin/units/edit/:id" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminUnitForm />
            </ProtectedRoute>
          } />

          {/* Lesson CRUD */}
          <Route path="/admin/lessons/create" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLessonForm />
            </ProtectedRoute>
          } />
          <Route path="/admin/lessons/edit/:id" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLessonForm />
            </ProtectedRoute>
          } />

          {/* Vocabulary CRUD */}
          <Route path="/admin/vocabularies/create" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminVocabularyForm />
            </ProtectedRoute>
          } />
          <Route path="/admin/vocabularies/edit/:id" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminVocabularyForm />
            </ProtectedRoute>
          } />

          {/* Exercise CRUD */}
          <Route path="/admin/exercises/create" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminExerciseForm />
            </ProtectedRoute>
          } />
          <Route path="/admin/exercises/edit/:id" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminExerciseForm />
            </ProtectedRoute>
          } />

          {/* Achievement CRUD */}
          <Route path="/admin/achievements/create" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminAchievementForm />
            </ProtectedRoute>
          } />
          <Route path="/admin/achievements/edit/:id" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminAchievementForm />
            </ProtectedRoute>
          } />

          {/* Test CRUD */}
          <Route path="/admin/tests/create" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminTestForm />
            </ProtectedRoute>
          } />
          <Route path="/admin/tests/edit/:id" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminTestForm />
            </ProtectedRoute>
          } />

          {/* Deck CRUD */}
          <Route path="/admin/decks/create" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDeckForm />
            </ProtectedRoute>
          } />
          <Route path="/admin/decks/edit/:id" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDeckForm />
            </ProtectedRoute>
          } />

          {/* Flashcard CRUD */}
          <Route path="/admin/flashcards/create" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminFlashcardForm />
            </ProtectedRoute>
          } />
          <Route path="/admin/flashcards/edit/:id" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminFlashcardForm />
            </ProtectedRoute>
          } />

          {/* Bulk Create Flashcards */}
          <Route path="/admin/flashcards/bulk-create" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminFlashcardBulkCreate />
            </ProtectedRoute>
          } />

          {/* Thêm route cho OAuth success */}
          <Route path="/oauth/success" element={<OAuthSuccess />} />
<Route path="/pronunciation-practice/:deckId" element={
            <ProtectedRoute>
              <PronunciationCheckerPage />
            </ProtectedRoute>
          } />

          {/* Optional: Single flashcard pronunciation */}
          <Route path="/pronunciation/:flashcardId" element={
            <ProtectedRoute>
              <PronunciationCheckerPage />
            </ProtectedRoute>
          } />
          {/* ========== 404 NOT FOUND ========== */}
          <Route path="*" element={
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100vh',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              textAlign: 'center',
              padding: '2rem'
            }}>
              <h1 style={{ fontSize: '8rem', margin: 0 }}>404</h1>
              <p style={{ fontSize: '1.5rem', marginTop: '1rem' }}>Trang không tồn tại</p>
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  marginTop: '2rem',
                  padding: '0.75rem 1.5rem',
                  background: '#58CC02',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                Về trang chủ
              </button>
            </div>
          } />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
