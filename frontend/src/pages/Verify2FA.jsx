import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import { authService } from '../services/authService';
import logo from '../assets/logo.png';

// ========== ANIMATIONS ==========

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(2deg);
  }
`;

// ========== STYLED COMPONENTS ==========

const PageWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -300px;
    right: -300px;
    width: 800px;
    height: 800px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%);
    border-radius: 50%;
    animation: ${float} 6s ease-in-out infinite;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -200px;
    left: -200px;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    border-radius: 50%;
    animation: ${float} 8s ease-in-out infinite reverse;
  }

  @media (max-width: 968px) {
    background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
    
    &::before, &::after {
      display: none;
    }
  }
`;

const Container = styled.div`
  margin: auto;
  padding: 2rem;
  width: 100%;
  max-width: 480px;
  position: relative;
  z-index: 1;

  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 28px;
  padding: 3rem 2.5rem;
  box-shadow: 
    0 30px 80px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.5) inset;
  animation: ${fadeIn} 0.6s ease;
  border: 1px solid rgba(255, 255, 255, 0.3);

  @media (max-width: 480px) {
    padding: 2.5rem 1.75rem;
    border-radius: 24px;
  }
`;

const LogoSection = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
  animation: ${slideIn} 0.8s ease;
`;

const LogoWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 90px;
  height: 90px;
  background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
  border-radius: 24px;
  box-shadow: 
    0 10px 30px rgba(88, 204, 2, 0.3),
    0 0 0 8px rgba(88, 204, 2, 0.1);
  margin-bottom: 1.5rem;
  animation: ${pulse} 2s ease-in-out infinite;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: 26px;
    padding: 3px;
    background: linear-gradient(135deg, #58CC02, #45a302);
    -webkit-mask: 
      linear-gradient(#fff 0 0) content-box, 
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0.5;
  }
`;

const Logo = styled.img`
  width: 55px;
  height: 55px;
  filter: brightness(0) invert(1);
`;

const IconWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  margin-bottom: 1rem;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);

  svg {
    width: 28px;
    height: 28px;
    fill: white;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  background: linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.75rem;
  font-weight: 800;
  letter-spacing: -0.5px;

  @media (max-width: 480px) {
    font-size: 1.75rem;
  }
`;

const Subtitle = styled.p`
  font-size: 0.9375rem;
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 0;
  font-weight: 500;
`;

const EmailDisplay = styled.div`
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  padding: 1rem 1.25rem;
  border-radius: 16px;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 2px solid rgba(88, 204, 2, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  }
`;

const EmailIcon = styled.div`
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(88, 204, 2, 0.3);
  flex-shrink: 0;
`;

const EmailText = styled.div`
  flex: 1;
  font-size: 0.9375rem;
  color: #1f2937;
  font-weight: 600;
  word-break: break-all;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const Label = styled.label`
  font-size: 0.9375rem;
  font-weight: 700;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  letter-spacing: -0.2px;

  span {
    font-size: 1.25rem;
  }
`;

const CodeInputContainer = styled.div`
  display: flex;
  gap: 0.625rem;
  justify-content: center;

  @media (max-width: 480px) {
    gap: 0.5rem;
  }
`;

const CodeInput = styled.input`
  width: 56px;
  height: 68px;
  font-size: 1.75rem;
  font-weight: 800;
  text-align: center;
  border: 3px solid ${props => props.error ? '#ef4444' : '#e5e7eb'};
  border-radius: 14px;
  background: ${props => props.error ? '#fef2f2' : '#ffffff'};
  color: #1a1a1a;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  &:focus {
    outline: none;
    border-color: ${props => props.error ? '#ef4444' : '#667eea'};
    background: ${props => props.error ? '#fef2f2' : '#f9fafb'};
    box-shadow: 0 0 0 4px ${props => props.error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(102, 126, 234, 0.15)'};
    transform: scale(1.05);
  }

  &:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
    opacity: 0.6;
  }

  ${props => props.error && `
    animation: ${shake} 0.5s ease;
  `}

  @media (max-width: 480px) {
    width: 48px;
    height: 60px;
    font-size: 1.5rem;
  }
`;

const ErrorMessage = styled.div`
  font-size: 0.875rem;
  color: #ef4444;
  margin-top: -0.25rem;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-weight: 600;
  padding: 0.75rem 1rem;
  background: #fef2f2;
  border-radius: 10px;
  border-left: 3px solid #ef4444;
  animation: ${slideIn} 0.3s ease;

  &::before {
    content: '⚠️';
    font-size: 1rem;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1.125rem;
  font-size: 1.0625rem;
  font-weight: 800;
  border: none;
  border-radius: 16px;
  background: ${props => props.disabled 
    ? 'linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%)'
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };
  color: white;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => props.disabled 
    ? 'none'
    : '0 6px 20px rgba(102, 126, 234, 0.4)'
  };
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s;
  }

  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.5);

    &::before {
      left: 100%;
    }
  }

  &:active:not(:disabled) {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.7;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: ${spin} 0.8s linear infinite;
`;

const AlternativeOption = styled.div`
  text-align: center;
  margin-top: 2rem;
  padding-top: 1.75rem;
  border-top: 2px solid #f3f4f6;
`;

const SecondaryButton = styled.button`
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border: 2px solid #d1d5db;
  color: #4b5563;
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  transition: all 0.3s ease;
  text-decoration: none;

  &:hover {
    background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
    border-color: #9ca3af;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }
`;

const BackLink = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1.25rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border-radius: 10px;
  transition: all 0.3s ease;

  &:hover {
    color: #1f2937;
    background: #f3f4f6;
  }

  svg {
    width: 16px;
    height: 16px;
    transition: transform 0.3s ease;
  }

  &:hover svg {
    transform: translateX(-3px);
  }
`;

const HelpText = styled.div`
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-left: 4px solid #3b82f6;
  padding: 1.25rem;
  border-radius: 12px;
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: #1e40af;
  line-height: 1.6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);

  strong {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    font-size: 0.9375rem;
    color: #1e3a8a;
  }
`;

const TimerDisplay = styled.div`
  text-align: center;
  margin-top: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 12px;
  border: 2px solid #fbbf24;
  
  span {
    font-size: 0.875rem;
    color: #92400e;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  strong {
    font-size: 1.25rem;
    color: #78350f;
    font-weight: 800;
  }
`;

const ResendButton = styled.button`
  background: none;
  border: none;
  color: #667eea;
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  text-decoration: underline;
  padding: 0.5rem 1rem;
  transition: all 0.3s ease;
  opacity: ${props => props.disabled ? 0.5 : 1};
  margin-top: 0.75rem;

  &:hover:not(:disabled) {
    color: #764ba2;
    transform: scale(1.05);
  }
`;

// ========== COMPONENT ==========

const Verify2FA = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast, showToast, hideToast } = useToast();

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);

  const userData = location.state?.userData;
  const userEmail = userData?.email || '';
  const userId = userData?.userId || '';

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  useEffect(() => {
    if (!userData || !userEmail || !userId) {
      showToast('error', 'Lỗi!', 'Phiên đăng nhập không hợp lệ');
      navigate('/login');
    }
  }, [userData, userEmail, userId, navigate, showToast]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleCodeChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
    
    if (pastedData.length === 6) {
      const newCode = pastedData.split('');
      setCode(newCode);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const fullCode = code.join('');
    
    if (fullCode.length !== 6) {
      setError('Vui lòng nhập đầy đủ 6 số');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authService.verify2FALogin(userId, userEmail, fullCode);
      
      if (response.success) {
        showToast('success', 'Đăng nhập thành công!', 'Chào mừng bạn trở lại');
        
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        setTimeout(() => {
          navigate('/learn');
        }, 1000);
      }
    } catch (err) {
      console.error('2FA verification error:', err);
      setError(err.message || 'Mã xác thực không đúng');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      showToast('error', 'Xác thực thất bại!', err.message || 'Vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = () => {
    if (!canResend) return;
    
    setTimer(30);
    setCanResend(false);
    showToast('success', 'Đã làm mới!', 'Vui lòng kiểm tra lại ứng dụng xác thực');
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <PageWrapper>
      <Toast toast={toast} onClose={hideToast} />

      <Container>
        <Card>
          <LogoSection>
            <LogoWrapper>
              <Logo src={logo} alt="Logo" />
            </LogoWrapper>
            <Title>Xác thực 2 yếu tố</Title>
            <Subtitle>
              Nhập mã 6 số từ ứng dụng Google Authenticator để tiếp tục
            </Subtitle>
          </LogoSection>

          <EmailDisplay>
            <EmailIcon>{userEmail.charAt(0).toUpperCase()}</EmailIcon>
            <EmailText>{userEmail}</EmailText>
          </EmailDisplay>

          <Form onSubmit={handleSubmit}>
            <InputGroup>
              <Label>
                <span></span> Mã xác thực
              </Label>
              <CodeInputContainer onPaste={handlePaste}>
                {code.map((digit, index) => (
                  <CodeInput
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    error={error}
                    disabled={loading}
                    autoComplete="off"
                  />
                ))}
              </CodeInputContainer>
              {error && <ErrorMessage>{error}</ErrorMessage>}
            </InputGroup>

            <SubmitButton type="submit" disabled={loading || code.join('').length !== 6}>
              {loading ? <LoadingSpinner /> : 'Xác thực ngay'}
            </SubmitButton>
          </Form>

          {timer > 0 && (
            <TimerDisplay>
              <span>
                 Mã hợp lệ trong: <strong>{timer}s</strong>
              </span>
            </TimerDisplay>
          )}

          <HelpText>
            <strong> Mẹo hữu ích</strong>
            Mã xác thực tự động thay đổi mỗi 30 giây. Hãy đảm bảo bạn đang sử dụng mã mới nhất từ Google Authenticator.
          </HelpText>

          

          <div style={{ textAlign: 'center' }}>
            <BackLink onClick={handleBackToLogin}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
              Quay lại đăng nhập
            </BackLink>
          </div>
        </Card>
      </Container>
    </PageWrapper>
  );
};

export default Verify2FA;