import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import Toast from '../components/Toast'; 
import useToast from '../hooks/useToast'; 
import { authService } from '../services/authService';

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
  margin-bottom: 2rem;
`;

const BenefitsList = styled.div`
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: left;
`;

const BenefitItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(8px);
    background: rgba(255, 255, 255, 0.2);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  }
`;

const BenefitIcon = styled.span`
  font-size: 2rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
`;

const BenefitText = styled.span`
  font-size: 1rem;
  color: #ffffff;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
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

const LoginContainer = styled.div`
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

const CloseButton = styled.button`
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

const SignUpButton = styled(Link)`
  position: fixed;
  top: 1.25rem;
  right: 1.25rem;
  padding: 0.75rem 1.5rem;
  background: #ffffff;
  border: 2px solid transparent;
  border-radius: 14px;
  color: #58CC02;
  font-weight: 700;
  font-size: 0.875rem;
  text-decoration: none;
  text-transform: uppercase;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
  z-index: 1000;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 16px rgba(88, 204, 2, 0.25);
    border-color: #58CC02;
  }

  @media (max-width: 968px) {
    padding: 0.625rem 1.25rem;
    font-size: 0.8125rem;
  }
`;

const Title = styled.h1`
  font-size: 1.75rem;
  color: #3c3c3c;
  margin-bottom: 1.75rem;
  text-align: center;
  font-weight: 800;
  letter-spacing: -0.5px;
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

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
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

const PasswordToggle = styled.button`
  position: absolute;
  right: 0.875rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }

  svg {
    width: 20px;
    height: 20px;
    fill: #afafaf;
    transition: fill 0.3s ease;
  }

  &:hover svg {
    fill: #3c3c3c;
  }
`;

const ForgotPassword = styled(Link)`
  align-self: flex-end;
  font-size: 0.8125rem;
  color: #afafaf;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &:hover {
    color: #777;
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

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.5rem 0;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, transparent, #e5e5e5, transparent);
  }
`;

const DividerText = styled.span`
  font-size: 0.8125rem;
  color: #afafaf;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 1px;
  padding: 0 0.5rem;
`;

const SocialButtons = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.875rem;
`;

const SocialButton = styled.button`
  padding: 0.875rem;
  font-size: 0.875rem;
  font-weight: 700;
  border: 2px solid #e5e5e5;
  border-radius: 14px;
  background: #ffffff;
  color: #3c3c3c;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    border-color: ${props => props.provider === 'google' ? '#4285F4' : '#1877F2'};
    background: ${props => props.provider === 'google' ? '#f0f7ff' : '#f0f5ff'};
    transform: translateY(-2px);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const TermsText = styled.p`
  font-size: 0.75rem;
  color: #afafaf;
  text-align: center;
  line-height: 1.5;
  margin-top: 1.5rem;

  a {
    color: #1cb0f6;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.3s ease;

    &:hover {
      color: #0e8fc7;
      text-decoration: underline;
    }
  }
`;

const ReCaptchaText = styled.p`
  font-size: 0.6875rem;
  color: #afafaf;
  text-align: center;
  line-height: 1.4;
  margin-top: 0.625rem;

  a {
    color: #afafaf;
    text-decoration: underline;
    transition: color 0.3s ease;

    &:hover {
      color: #777;
    }
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

// ========== COMPONENT ==========

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast, showToast, hideToast } = useToast();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState({});

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email không được để trống';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.password) {
      newErrors.password = 'Mật khẩu không được để trống';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('error', 'Lỗi!', 'Vui lòng kiểm tra lại thông tin đăng nhập');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.login({
        email: formData.email,
        password: formData.password,
      });

      showToast('success', 'Thành công!', 'Đăng nhập thành công!');
      
      // Chờ 1 giây rồi chuyển hướng
      setTimeout(() => {
        navigate('/learn');
      }, 1000);
    } catch (error) {
      console.error('Login error:', error);
      
      // Xử lý các loại lỗi cụ thể
      let errorMessage = 'Đăng nhập thất bại. Vui lòng thử lại!';
      
      if (error.response) {
        // Lỗi từ server trả về
        const status = error.response.status;
        const data = error.response.data;
        
        switch (status) {
          case 401:
            errorMessage = 'Email hoặc mật khẩu không chính xác!';
            // Highlight các trường bị lỗi
            setErrors({
              email: 'Email hoặc mật khẩu không đúng',
              password: 'Email hoặc mật khẩu không đúng'
            });
            break;
          case 404:
            errorMessage = 'Tài khoản không tồn tại!';
            setErrors({ email: 'Tài khoản không tồn tại' });
            break;
          case 403:
            errorMessage = 'Tài khoản của bạn đã bị khóa!';
            break;
          case 422:
            errorMessage = data?.message || 'Thông tin đăng nhập không hợp lệ!';
            break;
          case 500:
            errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau!';
            break;
          default:
            errorMessage = data?.message || error.message || 'Đăng nhập thất bại!';
        }
      } else if (error.request) {
        // Lỗi không nhận được response từ server
        errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng!';
      } else {
        // Lỗi khác
        errorMessage = error.message || 'Đã có lỗi xảy ra!';
      }
      
      showToast('error', 'Đăng nhập thất bại!', errorMessage);
    } finally {
      setLoading(false);
    }
  };
  // Handle social login - Cập nhật
  const handleSocialLogin = (provider) => {
    const backendUrl = process.env.REACT_APP_API_URL ;
    
    if (provider === 'Google') {
      window.location.href = `${backendUrl}/auth/google`;
    } else if (provider === 'Facebook') {
      window.location.href = `${backendUrl}/auth/facebook`;
    }
  };

  // Handle close
  const handleClose = () => {
    navigate('/');
  };

  return (
    <PageWrapper>
      <Toast toast={toast} onClose={hideToast} />

      <CloseButton onClick={handleClose}>✕</CloseButton>
      <SignUpButton to="/register">Đăng ký</SignUpButton>

      {/* Left Section - Background */}
      <LeftSection>
        <IllustrationContainer>
          <IllustrationEmoji>🎓</IllustrationEmoji>
          <IllustrationTitle>
            Chào mừng trở lại!
          </IllustrationTitle>
          <IllustrationText>
            Tiếp tục hành trình học tiếng Anh của bạn
          </IllustrationText>
          <BenefitsList>
            <BenefitItem>
              <BenefitIcon>📚</BenefitIcon>
              <BenefitText>Truy cập bài học của bạn</BenefitText>
            </BenefitItem>
            <BenefitItem>
              <BenefitIcon>🎯</BenefitIcon>
              <BenefitText>Tiếp tục tiến độ học tập</BenefitText>
            </BenefitItem>
            <BenefitItem>
              <BenefitIcon>🏆</BenefitIcon>
              <BenefitText>Xem thành tích của bạn</BenefitText>
            </BenefitItem>
            <BenefitItem>
              <BenefitIcon>⚡</BenefitIcon>
              <BenefitText>Học mọi lúc, mọi nơi</BenefitText>
            </BenefitItem>
          </BenefitsList>
        </IllustrationContainer>
      </LeftSection>

      {/* Right Section - Form */}
      <RightSection>
        <LoginContainer>
          <Title>Đăng nhập</Title>

          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Input
                type="email"
                name="email"
                placeholder="Email hoặc tên đăng nhập"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                autoComplete="email"
              />
              {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <InputWrapper>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Mật khẩu"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  autoComplete="current-password"
                />
                <PasswordToggle
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24">
                      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                    </svg>
                  )}
                </PasswordToggle>
              </InputWrapper>
              {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
              <ForgotPassword to="/forgot-password">Quên?</ForgotPassword>
            </FormGroup>

            <SubmitButton type="submit" disabled={loading}>
              {loading ? <LoadingSpinner /> : 'Đăng nhập'}
            </SubmitButton>

            <Divider>
              <DividerText>Hoặc</DividerText>
            </Divider>

            <SocialButtons>
              <SocialButton
                type="button"
                provider="google"
                onClick={() => handleSocialLogin('Google')}
              >
                <svg viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </SocialButton>
              <SocialButton
                type="button"
                provider="facebook"
                onClick={() => handleSocialLogin('Facebook')}
              >
                <svg viewBox="0 0 24 24">
                  <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </SocialButton>
            </SocialButtons>

            <TermsText>
              Khi đăng nhập, bạn đã đồng ý với{' '}
              <a href="/terms">Các chính sách</a> và{' '}
              <a href="/privacy">Chính sách bảo mật</a> của chúng tôi.
            </TermsText>

            <ReCaptchaText>
              Trang này được reCAPTCHA Enterprise bảo hộ và theo{' '}
              <a href="https://policies.google.com/privacy">Chính sách bảo mật</a> và{' '}
              <a href="https://policies.google.com/terms">Điều khoản dịch vụ</a> của Google.
            </ReCaptchaText>
          </Form>
        </LoginContainer>
      </RightSection>
    </PageWrapper>
  );
};

export default Login;