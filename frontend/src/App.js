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
import Leaderboard from './pages/leaderboard'
import Welcome from './pages/Welcome';
import Learn from './pages/Learn';


import ProtectedRoute from './components/ProtectedRoute';

import Guidebook from './pages/Guidebook';
import Characters from './pages/Characters';
import PronunciationPractice from './pages/PronunciationPractice';
import Quests from './pages/Quests';
import Shop from './pages/Shop';

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
          <Route path="/lesson" element={<Lesson />} />
          
          <Route path="/profile" element={<Profile />} />
         
          <Route path="/welcome" element={<Welcome />} />
          <Route 
            path="/learn" 
            element={
              <ProtectedRoute>
                <Learn />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/lesson/:id" 
            element={
              <ProtectedRoute>
                <Lesson />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/leaderboard" 
            element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            } 
          />

          
          <Route path="/guidebook/:unitId/:lessonId" element={<Guidebook />} />
          <Route path="/characters" element={<Characters />} />
          <Route path="/pronunciation-practice" element={<PronunciationPractice />} />
          <Route 
            path="/quests" 
            element={
              <ProtectedRoute>
                <Quests />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/shop" 
            element={
              <ProtectedRoute>
                <Shop />
              </ProtectedRoute>
            } 
          />
          
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
