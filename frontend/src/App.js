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
import './styles/App.css';
import './styles/colors.css';
import './styles/animations.css';
import './styles/responsive.css';
import AdminDashboard from './pages/AdminDashboard';
import AuditLog from './pages/AuditLog';
import GrammarQuiz from './pages/GrammarQuiz';
import FlashcardPractice from './pages/FlashcardPractice';
import Wordbank from './pages/Wordbank';
import AdminAuditLog from './pages/AdminAuditLog';
import TeacherClassroom from './pages/TeacherClassroom';
import JoinClass from './pages/JoinClass';
import StudentClasses from './pages/StudentClasses';

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
          <Route path="/student/classes" element={<StudentClasses />} />
          //Admin Routes
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/audit-log" element={<AdminAuditLog />} />
          //Teacher Routes
          <Route path="/teacher/classroom" element={<TeacherClassroom />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
