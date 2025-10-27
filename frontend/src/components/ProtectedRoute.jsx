import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';
import Swal from 'sweetalert2';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();

  // Nếu chưa đăng nhập -> chuyển về login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra tài khoản đã kích hoạt chưa
  if (!user?.isActive) {
    // Hiển thị thông báo và chuyển về login
    Swal.fire({
      icon: 'warning',
      title: 'Tài khoản chưa kích hoạt',
      text: 'Vui lòng kiểm tra email để kích hoạt tài khoản của bạn.',
      confirmButtonColor: '#58CC02',
      confirmButtonText: 'Đồng ý'
    });
    
    // Đăng xuất và xóa thông tin
    authService.logout();
    return <Navigate to="/login" replace />;
  }

  // Nếu route yêu cầu admin nhưng user không phải admin
  if (requireAdmin && user?.role !== 'admin') {
    Swal.fire({
      icon: 'error',
      title: 'Không có quyền truy cập',
      text: 'Bạn không có quyền truy cập vào trang này.',
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Đồng ý'
    });
    return <Navigate to="/learn" replace />;
  }

  return children;
};

export default ProtectedRoute;