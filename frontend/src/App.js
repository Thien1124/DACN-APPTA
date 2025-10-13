import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Lesson from './pages/Lesson';
import Practice from './pages/Practice';
import Progress from './pages/Progress';
import Profile from './pages/Profile';
import ScrollToTop from './components/ScrollToTop';
import ForgotPassword from './pages/ForgotPassword';
import AdminDashboard from './pages/AdminDashboard';
import AuditLog from './pages/AuditLog';
import GrammarQuiz from './pages/GrammarQuiz';
import FlashcardPractice from './pages/FlashcardPractice';
import Wordbank from './pages/Wordbank';
import Notifications from './pages/Notifications';
import CreateSubQuiz from './pages/CreateSubQuiz';
import CreateLearningPath from './pages/CreateLearningPath';
import JoinClass from './pages/JoinClass';
import StudentClasses from './pages/StudentClasses';
import SearchByKeywordTag from './pages/SearchByKeywordTag';
import ManageDecks from './pages/ManageDecks';
import CreateCardWithNoteType from './pages/CreateCardWithNoteType';
import AdvancedFeatures from './pages/AdvancedFeatures';

//Import Admin Pages
import AdminStatistics from './pages/AdminStatistics';
import AdminLessons from './pages/AdminLessons';
import AdminOverview from './pages/AdminOverview';
import AdminAuditLog from './pages/AdminAuditLog';
import AdminNotifications from './pages/AdminNotifications';
import AdminClasses from './pages/AdminClasses';
import AdminExams from './pages/AdminExams';
import AdminFlashcards from './pages/AdminFlashcards';
import AdminWordbank from './pages/AdminWordbank';
import AdminQuizzes from './pages/AdminQuizzes';
import AdminSettings from './pages/AdminSettings';
import AdminEmail from './pages/AdminEmail';
import AdminBackup from './pages/AdminBackup';

//Import Teacher Pages
import TeacherNotifications from './pages/TeacherNotifications';
import TeacherAttendance from './pages/TeacherAttendance';
import TeacherDecks from './pages/TeacherDecks';
import TeacherLessons from './pages/TeacherLessons';
import TeacherAssignments from './pages/TeacherAssignments';
import TeacherStudents from './pages/TeacherStudents';
import TeacherClassroom from './pages/TeacherClassroom';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherQuizBank from './pages/TeacherQuizBank';
import TeacherStatistics from './pages/TeacherStatistics';
import TeacherAICards from './pages/TeacherAICards';
import TeacherQualityCheck from './pages/TeacherQualityCheck';
import TeacherComments from './pages/TeacherComments';
import TeacherSettings from './pages/TeacherSettings';

//Import Styles
import './styles/App.css';
import './styles/colors.css';
import './styles/animations.css';
import './styles/responsive.css';
function App() {
  return (
    <Provider store={store}>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/lesson/:id" element={<Lesson />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/wordbank" element={<Wordbank />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/audit-log" element={<AuditLog />} />
          <Route path="/flashcard-practice" element={<FlashcardPractice />} />
          <Route path="/grammar-quiz" element={<GrammarQuiz />} />
          <Route path="/join-class" element={<JoinClass />} />
          <Route path="/notifications" element={<Notifications />} />

          <Route path="/create-card" element={<CreateCardWithNoteType />} />
          <Route path="/advanced-features" element={<AdvancedFeatures />} />
          <Route path="/manage-decks" element={<ManageDecks />} />
          <Route path="/search-decks" element={<SearchByKeywordTag />} />
          <Route path="/create-sub-quiz" element={<CreateSubQuiz />} />
          <Route path="/learning-path" element={<CreateLearningPath />} />
          <Route path="/classes" element={<StudentClasses />} />
          {/* Admin Routes */}

          <Route path="/admin/notifications" element={<AdminNotifications />} />
          <Route path="/admin" element={<AdminOverview />} />
          <Route path="/admin/users" element={<AdminDashboard />} />
          <Route path="/admin/audit-log" element={<AdminAuditLog />} />
          <Route path="/admin/statistics" element={<AdminStatistics />} />
          <Route path="/admin/lessons" element={<AdminLessons />} />
          <Route path="/admin/classes" element={<AdminClasses />} />
          <Route path="/admin/exams" element={<AdminExams />} />
          <Route path="/admin/flashcards" element={<AdminFlashcards />} />
          <Route path="/admin/wordbank" element={<AdminWordbank />} />
          <Route path="/admin/quizzes" element={<AdminQuizzes />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/email" element={<AdminEmail />} />
          <Route path="/admin/backup" element={<AdminBackup />} />

          {/* Teacher Routes */}
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/teacher/notifications" element={<TeacherNotifications />} />
          <Route path="/teacher/quiz-bank" element={<TeacherQuizBank />} />
          <Route path="/teacher/students" element={<TeacherStudents />} />
          <Route path="/teacher/attendance" element={<TeacherAttendance />} />
          <Route path="/teacher/decks" element={<TeacherDecks />} />
          <Route path="/teacher/lessons" element={<TeacherLessons />} />
          <Route path="/teacher/assignments" element={<TeacherAssignments />} />
          <Route path="/teacher/statistics" element={<TeacherStatistics />} />
          <Route path="/teacher/classroom" element={<TeacherClassroom />} />
          <Route path="/teacher/ai-cards" element={<TeacherAICards />} />
          <Route path="/teacher/quality-check" element={<TeacherQualityCheck />} />
          <Route path="/teacher/comments" element={<TeacherComments />} />
          <Route path="/teacher/settings" element={<TeacherSettings />} />

        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
