import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import Toast from '../components/Toast'; 
import useToast from '../hooks/useToast'; 

// ========== STYLED COMPONENTS ==========

const PageWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${props => props.theme === 'dark' 
    ? 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2d2d2d 100%)'
    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e0 100%)'
  };
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.theme === 'dark'
      ? 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 70%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 70%)'
      : 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 70%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.05) 0%, transparent 70%)'
    };
    z-index: 0;
  }

  @media (max-width: 768px) {
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

  @media (max-width: 768px) {
    display: none;
  }
`;

const IllustrationContainer = styled.div`
  max-width: 500px;
  text-align: center;
  animation: fadeInLeft 0.8s ease;

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
  font-size: 10rem;
  margin-bottom: 2rem;
  animation: float 3s ease-in-out infinite;

  @keyframes float {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-20px);
    }
  }
`;

const IllustrationTitle = styled.h2`
  font-size: 2.5rem;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 1rem;
  font-weight: bold;
`;

const IllustrationText = styled.p`
  font-size: 1.25rem;
  color: ${props => props.theme === 'dark' ? '#d1d5db' : '#6b7280'};
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

  @media (max-width: 768px) {
    padding: 1rem;
    min-height: 100vh;
  }
`;

const LoginContainer = styled.div`
  width: 100%;
  max-width: 450px;
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

const LoginCard = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 3rem;
  box-shadow: ${props => props.theme === 'dark'
    ? '0 20px 60px rgba(0, 0, 0, 0.5)'
    : '0 20px 60px rgba(0, 0, 0, 0.1)'
  };
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
`;

const LogoIcon = styled.span`
  font-size: 3rem;
`;

const LogoText = styled.span`
  font-size: 2rem;
  font-weight: bold;
  color: #58CC02;
`;

const ThemeToggle = styled.button`
  position: absolute;
  top: 2rem;
  right: 2rem;
  background: ${props => props.theme === 'dark' ? '#374151' : '#f3f4f6'};
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;

  &:hover {
    transform: rotate(20deg) scale(1.1);
    background: ${props => props.theme === 'dark' ? '#4B5563' : '#e5e7eb'};
  }

  @media (max-width: 768px) {
    top: 1rem;
    right: 1rem;
    width: 45px;
    height: 45px;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.5rem;
  text-align: center;
  font-weight: bold;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  margin-bottom: 2rem;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#e5e7eb' : '#374151'};
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const InputIcon = styled.span`
  position: absolute;
  left: 1rem;
  font-size: 1.25rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  font-size: 1rem;
  border: 2px solid ${props => props.theme === 'dark' 
    ? props.error ? '#ef4444' : '#374151'
    : props.error ? '#ef4444' : '#e5e7eb'
  };
  border-radius: 12px;
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.error ? '#ef4444' : '#58CC02'};
    box-shadow: 0 0 0 3px ${props => props.error 
      ? 'rgba(239, 68, 68, 0.1)' 
      : 'rgba(88, 204, 2, 0.1)'
    };
  }

  &::placeholder {
    color: ${props => props.theme === 'dark' ? '#6b7280' : '#9ca3af'};
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  transition: color 0.3s ease;

  &:hover {
    color: ${props => props.theme === 'dark' ? '#e5e7eb' : '#374151'};
  }
`;

const ErrorMessage = styled.span`
  font-size: 0.875rem;
  color: #ef4444;
  margin-top: 0.25rem;
`;

const ForgotPassword = styled(Link)`
  align-self: flex-end;
  font-size: 0.875rem;
  color: #58CC02;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;

  &:hover {
    color: #45a302;
    text-decoration: underline;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem;
  font-size: 1.125rem;
  font-weight: bold;
  color: white;
  background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(88, 204, 2, 0.3);
  margin-top: 1rem;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(88, 204, 2, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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
    background: ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  }
`;

const DividerText = styled.span`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

const SocialButtons = styled.div`
  display: flex;
  gap: 1rem;
`;

const SocialButton = styled.button`
  flex: 1;
  padding: 0.875rem;
  font-size: 1rem;
  font-weight: 600;
  border: 2px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  border-radius: 12px;
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#e5e7eb' : '#374151'};
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    border-color: #58CC02;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const SignUpText = styled.p`
  text-align: center;
  margin-top: 2rem;
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

const SignUpLink = styled(Link)`
  color: #58CC02;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.3s ease;

  &:hover {
    color: #45a302;
    text-decoration: underline;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
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
  const [theme, setTheme] = useState('light');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast, showToast, hideToast } = useToast(); // ⬅️ Sử dụng useToast hook
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  // Toggle theme
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

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

    // Simulate API call
    setTimeout(() => {
      console.log('Login data:', formData);
      setLoading(false);
      
      showToast('success', 'Thành công!', 'Đăng nhập thành công!');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    }, 1500);
  };

  // Handle social login
  const handleSocialLogin = (provider) => {
    console.log(`Login with ${provider}`);
    showToast('info', 'Thông báo', `Đang đăng nhập bằng ${provider}...`);
  };

  return (
    <PageWrapper theme={theme}>
      <ThemeToggle theme={theme} onClick={toggleTheme}>
        {theme === 'light' ? '🌙' : '☀️'}
      </ThemeToggle>

      {/* ⬇️ Sử dụng Toast component */}
      <Toast toast={toast} onClose={hideToast} />

      {/* Left Section - Illustration */}
      <LeftSection>
        <IllustrationContainer>
          <IllustrationEmoji>🎓</IllustrationEmoji>
          <IllustrationTitle theme={theme}>
            Chào mừng trở lại!
          </IllustrationTitle>
          <IllustrationText theme={theme}>
            Tiếp tục hành trình học tiếng Anh của bạn. 
            Mỗi ngày một chút, bạn sẽ đạt được mục tiêu của mình!
          </IllustrationText>
        </IllustrationContainer>
      </LeftSection>

      {/* Right Section - Login Form */}
      <RightSection>
        <LoginContainer>
          <LoginCard theme={theme}>
            <Logo>
              <LogoIcon>🦉</LogoIcon>
              <LogoText>EnglishMaster</LogoText>
            </Logo>

            <Title theme={theme}>Đăng nhập</Title>
            <Subtitle theme={theme}>
              Nhập thông tin để tiếp tục học tập
            </Subtitle>

            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label theme={theme}>Email</Label>
                <InputWrapper>
                  <InputIcon theme={theme}>📧</InputIcon>
                  <Input
                    type="email"
                    name="email"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    theme={theme}
                    error={errors.email}
                  />
                </InputWrapper>
                {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label theme={theme}>Mật khẩu</Label>
                <InputWrapper>
                  <InputIcon theme={theme}>🔒</InputIcon>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Nhập mật khẩu"
                    value={formData.password}
                    onChange={handleChange}
                    theme={theme}
                    error={errors.password}
                  />
                  <PasswordToggle
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    theme={theme}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </PasswordToggle>
                </InputWrapper>
                {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
              </FormGroup>

              <ForgotPassword to="/forgot-password">
                Quên mật khẩu?
              </ForgotPassword>

              <SubmitButton type="submit" disabled={loading}>
                {loading ? <LoadingSpinner /> : 'Đăng nhập'}
              </SubmitButton>
            </Form>

            <Divider theme={theme}>
              <DividerText theme={theme}>Hoặc đăng nhập với</DividerText>
            </Divider>

            <SocialButtons>
              <SocialButton 
                theme={theme} 
                onClick={() => handleSocialLogin('Google')}
              >
                <span>🔵</span>
                Google
              </SocialButton>
              <SocialButton 
                theme={theme} 
                onClick={() => handleSocialLogin('Facebook')}
              >
                <span>📘</span>
                Facebook
              </SocialButton>
            </SocialButtons>

            <SignUpText theme={theme}>
              Chưa có tài khoản?{' '}
              <SignUpLink to="/register">Đăng ký ngay</SignUpLink>
            </SignUpText>
          </LoginCard>
        </LoginContainer>
      </RightSection>
    </PageWrapper>
  );
};

export default Login;