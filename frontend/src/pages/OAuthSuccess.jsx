import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

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
    // Lấy token từ cookie (backend đã set)
    const token = getCookie('token');
    
    if (token) {
      localStorage.setItem('token', token);
      
      // Xóa cookie sau khi lưu vào localStorage
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      // Lấy thông tin user từ localStorage hoặc gọi API
      // Giả sử backend đã lưu user info trong token
      setTimeout(() => {
        navigate('/learn'); // Chuyển đến trang học
      }, 1500);
    } else {
      // Nếu không có token, chuyển về login với lỗi
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