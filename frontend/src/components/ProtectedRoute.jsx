import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    // Redirect về trang login nếu chưa đăng nhập
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;