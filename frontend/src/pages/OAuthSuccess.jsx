import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { authService } from '../services/authService';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
`;

const LoadingCard = styled.div`
  background: white;
  padding: 3rem;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 400px;
`;

const Spinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #58CC02;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1.5rem;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
`;

const Message = styled.p`
  font-size: 1rem;
  color: #6b7280;
`;

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleOAuthSuccess = async () => {
      try {
        // Lấy token từ URL query params
        const token = searchParams.get('token');

        if (!token) {
          console.error('❌ No token found in URL');
          setTimeout(() => {
            navigate('/login?error=oauth');
          }, 2000);
          return;
        }

        console.log('✅ Token received:', token.substring(0, 20) + '...');

        // Lưu token vào localStorage
        localStorage.setItem('token', token);

        // Lấy thông tin user
        const userResponse = await authService.getCurrentUserProfile();
        
        if (userResponse.success && userResponse.data) {
          const user = userResponse.data;
          
          // Lưu user info
          localStorage.setItem('user', JSON.stringify(user));
          
          console.log('✅ OAuth login success:', user.email);

          // Redirect theo role
          setTimeout(() => {
            if (user.role === 'admin') {
              navigate('/admin');
            } else {
              navigate('/learn');
            }
          }, 1500);
        } else {
          throw new Error('Failed to get user info');
        }

      } catch (error) {
        console.error('❌ OAuth success handler error:', error);
        setTimeout(() => {
          navigate('/login?error=oauth');
        }, 2000);
      }
    };

    handleOAuthSuccess();
  }, [navigate, searchParams]);

  return (
    <Container>
      <LoadingCard>
        <Spinner />
        <Title>Đăng nhập thành công!</Title>
        <Message>Đang chuyển hướng...</Message>
      </LoadingCard>
    </Container>
  );
};

export default OAuthSuccess;