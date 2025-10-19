import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { authService } from '../services/authService';

const PageWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
`;

const Message = styled.div`
  text-align: center;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
`;

const OAuthSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy token từ URL hoặc cookie
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token') || getCookie('token');

    if (token) {
      localStorage.setItem('token', token);
      
      // Lấy thông tin user từ backend
      authService.getProfile()
        .then(response => {
          if (response.success && response.data?.user) {
            const user = response.data.user;
            
            // Kiểm tra isActive
            if (!user.isActive) {
              alert('Tài khoản của bạn chưa được kích hoạt. Vui lòng kiểm tra email.');
              navigate('/login');
              return;
            }
            
            // Chuyển hướng dựa trên role
            setTimeout(() => {
              if (user.role === 'admin') {
                navigate('/admin');
              } else {
                navigate('/learn');
              }
            }, 1500);
          } else {
            navigate('/login?error=oauth');
          }
        })
        .catch(error => {
          console.error('Error fetching user profile:', error);
          navigate('/login?error=oauth');
        });
    } else {
      navigate('/login?error=oauth');
    }
  }, [navigate]);

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  return (
    <PageWrapper>
      <Message>
        ✅ Đăng nhập thành công!<br />
        Đang chuyển hướng...
      </Message>
    </PageWrapper>
  );
};

export default OAuthSuccess;