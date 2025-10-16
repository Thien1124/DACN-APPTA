import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';

// ========== STYLED COMPONENTS ==========

const PageWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: #ffffff;
  position: relative;
  overflow: hidden;

  @media (max-width: 968px) {
    flex-direction: column;
  }
`;

const LeftSection = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  z-index: 1;
  background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.08) 0%, transparent 50%);
  }

  @media (max-width: 968px) {
    display: none;
  }
`;

const IllustrationContainer = styled.div`
  max-width: 450px;
  text-align: center;
  animation: fadeInLeft 0.8s ease;
  position: relative;
  z-index: 2;

  @keyframes fadeInLeft {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;

const IllustrationEmoji = styled.div`
  font-size: 6rem;
  margin-bottom: 1.5rem;
  animation: float 3s ease-in-out infinite;
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.2));

  @keyframes float {
    0%, 100% {
      transform: translateY(0) rotate(0deg);
    }
    50% {
      transform: translateY(-15px) rotate(3deg);
    }
  }
`;

const IllustrationTitle = styled.h2`
  font-size: 2.25rem;
  color: #ffffff;
  margin-bottom: 1rem;
  font-weight: 800;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  line-height: 1.2;
`;

const IllustrationText = styled.p`
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.6;
`;

const RightSection = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  z-index: 1;
  background: #ffffff;
  overflow-y: auto;

  @media (max-width: 968px) {
    padding: 1.5rem 1rem;
    padding-top: 5rem;
    padding-bottom: 2rem;
  }
`;

const FormContainer = styled.div`
  width: 100%;
  max-width: 420px;
  animation: fadeInRight 0.8s ease;

  @keyframes fadeInRight {
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;

const BackButton = styled(Link)`
  position: fixed;
  top: 1.25rem;
  left: 1.25rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: none;
  border-radius: 10px;
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.95);
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1000;
  text-decoration: none;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: scale(1.05);
  }

  @media (max-width: 968px) {
    background: rgba(0, 0, 0, 0.05);
    color: #3c3c3c;
    
    &:hover {
      background: rgba(0, 0, 0, 0.1);
    }
  }
`;

const Title = styled.h1`
  font-size: 1.75rem;
  color: #3c3c3c;
  margin-bottom: 0.75rem;
  text-align: center;
  font-weight: 800;
  letter-spacing: -0.5px;
`;

const Subtitle = styled.p`
  font-size: 0.9375rem;
  color: #777;
  margin-bottom: 2rem;
  text-align: center;
  line-height: 1.6;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.9375rem 1.25rem;
  font-size: 0.9375rem;
  border: 2px solid ${props => props.error ? '#ea2b2b' : '#e5e5e5'};
  border-radius: 14px;
  background: #ffffff;
  color: #3c3c3c;
  transition: all 0.3s ease;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${props => props.error ? '#ea2b2b' : '#1cb0f6'};
    background: #f7f7f7;
    box-shadow: 0 0 0 3px ${props => props.error ? 'rgba(234, 43, 43, 0.08)' : 'rgba(28, 176, 246, 0.08)'};
  }

  &::placeholder {
    color: #afafaf;
    font-weight: 400;
  }
`;

const ErrorMessage = styled.span`
  font-size: 0.8125rem;
  color: #ea2b2b;
  margin-top: 0.25rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  &::before {
    content: '⚠️';
    font-size: 0.8125rem;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 700;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  background: ${props => props.disabled ? '#e5e5e5' : 'linear-gradient(135deg, #1cb0f6 0%, #0e8fc7 100%)'};
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 0.5rem;
  box-shadow: ${props => props.disabled ? 'none' : '0 3px 10px rgba(28, 176, 246, 0.25)'};

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 16px rgba(28, 176, 246, 0.35);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const TimerText = styled.p`
  text-align: center;
  font-size: 0.875rem;
  color: #777;
  margin-top: 1rem;
`;

const ResendButton = styled.button`
  background: none;
  border: none;
  color: #1cb0f6;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.875rem;
  text-decoration: underline;
  transition: color 0.3s ease;
  padding: 0;

  &:hover {
    color: #0e8fc7;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// ========== COMPONENT ==========

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (currentStep === 2 && timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setCanResend(true);
    }
  }, [currentStep, timer]);

  // Handle email submission
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Vui lòng nhập email');
      showToast('error', 'Lỗi!', 'Vui lòng nhập email');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email không hợp lệ');
      showToast('error', 'Lỗi!', 'Email không hợp lệ');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setCurrentStep(2);
      setTimer(60);
      setCanResend(false);
      showToast('success', 'Thành công!', 'Mã xác nhận đã được gửi đến email của bạn');
    }, 1500);
  };

  // Handle code verification
  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!code) {
      setError('Vui lòng nhập mã xác nhận');
      showToast('warning', 'Cảnh báo!', 'Vui lòng nhập mã xác nhận');
      return;
    }

    if (code.length !== 6) {
      setError('Mã xác nhận phải có 6 số');
      showToast('warning', 'Cảnh báo!', 'Mã xác nhận phải có 6 số');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      // Giả lập kiểm tra mã (trong thực tế sẽ gọi API)
      if (code === '123456') {
        setCurrentStep(3);
        showToast('success', 'Thành công!', 'Mã xác nhận chính xác!');
      } else {
        setError('Mã xác nhận không đúng');
        showToast('error', 'Lỗi!', 'Mã xác nhận không đúng');
        setCode('');
      }
    }, 1500);
  };

  // Handle resend code
  const handleResendCode = () => {
    setTimer(60);
    setCanResend(false);
    setCode('');
    showToast('info', 'Thông báo', 'Mã xác nhận mới đã được gửi!');
  };

  // Handle password submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Vui lòng nhập mật khẩu mới');
      showToast('error', 'Lỗi!', 'Vui lòng nhập mật khẩu mới');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      showToast('error', 'Lỗi!', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      showToast('error', 'Lỗi!', 'Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      showToast('success', 'Thành công!', 'Đặt lại mật khẩu thành công!');

      // Chuyển về trang login sau 2 giây
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }, 1500);
  };

  return (
    <PageWrapper>
      <Toast toast={toast} onClose={hideToast} />

      <BackButton to="/login">←</BackButton>

      {/* Left Section */}
      <LeftSection>
        <IllustrationContainer>
          <IllustrationEmoji>🔐</IllustrationEmoji>
          <IllustrationTitle>Đừng lo lắng!</IllustrationTitle>
          <IllustrationText>
            Chúng tôi sẽ giúp bạn lấy lại mật khẩu một cách nhanh chóng và an toàn
          </IllustrationText>
        </IllustrationContainer>
      </LeftSection>

      {/* Right Section - Form */}
      <RightSection>
        <FormContainer>
          <Title>
            {currentStep === 1 && 'Quên mật khẩu'}
            {currentStep === 2 && 'Nhập mã xác nhận'}
            {currentStep === 3 && 'Tạo mật khẩu mới'}
          </Title>
          <Subtitle>
            {currentStep === 1 && 'Chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu của bạn qua email.'}
            {currentStep === 2 && `Chúng tôi đã gửi mã 6 số đến ${email}`}
            {currentStep === 3 && 'Hãy tạo một mật khẩu mạnh và dễ nhớ'}
          </Subtitle>

          {currentStep === 1 && (
            <Form onSubmit={handleEmailSubmit}>
              <FormGroup>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  error={error}
                  autoComplete="email"
                />
                {error && <ErrorMessage>{error}</ErrorMessage>}
              </FormGroup>

              <SubmitButton type="submit" disabled={loading}>
                {loading ? <LoadingSpinner /> : 'Gửi'}
              </SubmitButton>
            </Form>
          )}

          {currentStep === 2 && (
            <Form onSubmit={handleCodeSubmit}>
              <FormGroup>
                <Input
                  type="text"
                  placeholder="Nhập mã 6 số"
                  value={code}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setCode(value);
                    setError('');
                  }}
                  error={error}
                  autoComplete="off"
                  inputMode="numeric"
                  maxLength="6"
                />
                {error && <ErrorMessage>{error}</ErrorMessage>}
              </FormGroup>

              <TimerText>
                {canResend ? (
                  <>
                    Không nhận được mã?{' '}
                    <ResendButton onClick={handleResendCode} type="button">
                      Gửi lại
                    </ResendButton>
                  </>
                ) : (
                  `Gửi lại mã sau ${timer}s`
                )}
              </TimerText>

              <SubmitButton type="submit" disabled={loading}>
                {loading ? <LoadingSpinner /> : 'Xác nhận'}
              </SubmitButton>
            </Form>
          )}

          {currentStep === 3 && (
            <Form onSubmit={handlePasswordSubmit}>
              <FormGroup>
                <Input
                  type="password"
                  placeholder="Mật khẩu mới"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  error={error}
                  autoComplete="new-password"
                />
              </FormGroup>

              <FormGroup>
                <Input
                  type="password"
                  placeholder="Xác nhận mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError('');
                  }}
                  error={error}
                  autoComplete="new-password"
                />
                {error && <ErrorMessage>{error}</ErrorMessage>}
              </FormGroup>

              <SubmitButton type="submit" disabled={loading}>
                {loading ? <LoadingSpinner /> : 'Đặt lại mật khẩu'}
              </SubmitButton>
            </Form>
          )}
        </FormContainer>
      </RightSection>
    </PageWrapper>
  );
};

export default ForgotPassword;