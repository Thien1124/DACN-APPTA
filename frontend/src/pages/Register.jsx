import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import Toast from '../components/Toast'; // ⬅️ Import
import useToast from '../hooks/useToast'; // ⬅️ Import

// ========== STYLED COMPONENTS ==========

const PageWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${props => props.theme === 'dark'
    ? 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2d2d2d 100%)'
    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e0 100%)'
  };
  position: relative;
  overflow-x: hidden; /* ⬅️ Thay đổi từ overflow: hidden */

  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.theme === 'dark'
      ? 'radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 70%), radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 70%)'
      : 'radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.05) 0%, transparent 70%), radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.05) 0%, transparent 70%)'
    };
    z-index: 0;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    overflow-y: auto; /* ⬅️ Thêm dòng này */
  }
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
    min-height: auto; /* ⬅️ Thay đổi từ min-height: 100vh */
    padding-top: 5rem; /* ⬅️ Thêm padding-top để tránh che ThemeToggle */
    padding-bottom: 2rem; /* ⬅️ Thêm padding-bottom */
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
  background: ${props => props.theme === 'dark'
    ? 'rgba(31, 41, 55, 0.5)'
    : 'rgba(255, 255, 255, 0.7)'
  };
  backdrop-filter: blur(10px);
  border-radius: 12px;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateX(10px);
  }
`;

const BenefitIcon = styled.span`
  font-size: 2rem;
`;

const BenefitText = styled.span`
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#e5e7eb' : '#374151'};
  font-weight: 600;
`;


const RegisterContainer = styled.div`
  width: 100%;
  max-width: 500px;
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

const RegisterCard = styled.div`
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
  position: fixed; /* ⬅️ Thay đổi từ absolute sang fixed */
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
  z-index: 1000; /* ⬅️ Tăng z-index */

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

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
`;

const Step = styled.div`
  width: ${props => props.active ? '40px' : '12px'};
  height: 12px;
  border-radius: 6px;
  background: ${props => props.active
    ? '#58CC02'
    : props.theme === 'dark' ? '#374151' : '#e5e7eb'
  };
  transition: all 0.3s ease;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
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

const Select = styled.select`
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
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${props => props.error ? '#ef4444' : '#58CC02'};
    box-shadow: 0 0 0 3px ${props => props.error
    ? 'rgba(239, 68, 68, 0.1)'
    : 'rgba(88, 204, 2, 0.1)'
  };
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

const PasswordStrength = styled.div`
  margin-top: 0.5rem;
`;

const StrengthBar = styled.div`
  height: 4px;
  border-radius: 2px;
  background: ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  overflow: hidden;
`;

const StrengthFill = styled.div`
  height: 100%;
  width: ${props => props.strength}%;
  background: ${props => {
    if (props.strength < 33) return '#ef4444';
    if (props.strength < 66) return '#f59e0b';
    return '#58CC02';
  }};
  transition: all 0.3s ease;
`;

const StrengthText = styled.span`
  font-size: 0.75rem;
  color: ${props => {
    if (props.strength < 33) return '#ef4444';
    if (props.strength < 66) return '#f59e0b';
    return '#58CC02';
  }};
  margin-top: 0.25rem;
  display: block;
`;

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
`;

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #58CC02;
`;

const CheckboxLabel = styled.label`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#d1d5db' : '#4b5563'};
  line-height: 1.5;
  cursor: pointer;

  a {
    color: #58CC02;
    text-decoration: none;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const Button = styled.button`
  flex: 1;
  padding: 1rem;
  font-size: 1.125rem;
  font-weight: bold;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const BackButton = styled(Button)`
  background: ${props => props.theme === 'dark' ? '#374151' : '#f3f4f6'};
  color: ${props => props.theme === 'dark' ? '#e5e7eb' : '#374151'};

  &:hover:not(:disabled) {
    background: ${props => props.theme === 'dark' ? '#4B5563' : '#e5e7eb'};
  }
`;

const NextButton = styled(Button)`
  background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(88, 204, 2, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(88, 204, 2, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
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

const LoginText = styled.p`
  text-align: center;
  margin-top: 2rem;
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

const LoginLink = styled(Link)`
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

const Register = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState('light');
  const { toast, showToast, hideToast } = useToast(); // ⬅️ Thêm useToast hook
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    level: '',
    goal: '',
    agreeTerms: false,
  });

  const [errors, setErrors] = useState({});

  // Toggle theme
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10;
    return Math.min(strength, 100);
  };

  const passwordStrength = calculatePasswordStrength(formData.password);

  const getStrengthText = (strength) => {
    if (strength < 33) return 'Yếu';
    if (strength < 66) return 'Trung bình';
    return 'Mạnh';
  };

  // Validate step 1
  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Tên không được để trống';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Họ không được để trống';
    }

    if (!formData.email) {
      newErrors.email = 'Email không được để trống';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate step 2
  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = 'Mật khẩu không được để trống';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
    }

    if (!formData.age) {
      newErrors.age = 'Vui lòng chọn độ tuổi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate step 3
  const validateStep3 = () => {
    const newErrors = {};

    if (!formData.level) {
      newErrors.level = 'Vui lòng chọn trình độ';
    }

    if (!formData.goal) {
      newErrors.goal = 'Vui lòng chọn mục tiêu';
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'Bạn phải đồng ý với điều khoản';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step - ⬇️ Thêm Toast validation
  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      showToast('success', 'Tuyệt vời!', 'Chuyển sang bước tiếp theo');
      setCurrentStep(2);
    } else if (currentStep === 1) {
      showToast('error', 'Lỗi!', 'Vui lòng điền đầy đủ thông tin bước 1');
    } else if (currentStep === 2 && validateStep2()) {
      showToast('success', 'Tuyệt vời!', 'Chuyển sang bước cuối cùng');
      setCurrentStep(3);
      
    } else if (currentStep === 2) {
      showToast('error', 'Lỗi!', 'Vui lòng kiểm tra lại mật khẩu và độ tuổi');
    }
    
  };

  // Handle back step
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle submit - ⬇️ Thêm Toast
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep3()) {
      showToast('error', 'Lỗi!', 'Vui lòng điền đầy đủ thông tin và đồng ý điều khoản');
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      console.log('Register data:', formData);
      setLoading(false);

      // ⬇️ Chỉ dùng Toast, không dùng setRegistrationComplete
      showToast('success', 'Thành công!', 'Đăng ký thành công! Đang chuyển đến trang đăng nhập...');

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }, 1500);
  };

  // Handle social register - ⬇️ Thêm Toast
  const handleSocialRegister = (provider) => {
    console.log(`Register with ${provider}`);
    showToast('info', 'Thông báo', `Đang đăng ký bằng ${provider}...`);
  };

  return (
    <PageWrapper theme={theme}>
      <ThemeToggle theme={theme} onClick={toggleTheme}>
        {theme === 'light' ? '🌙' : '☀️'}
      </ThemeToggle>

      {/* ⬇️ Thêm Toast component */}
      <Toast toast={toast} onClose={hideToast} />

      {/* Left Section - Illustration */}
      <LeftSection>
        <IllustrationContainer>
          <IllustrationEmoji>🚀</IllustrationEmoji>
          <IllustrationTitle theme={theme}>
            Bắt đầu hành trình học tập!
          </IllustrationTitle>
          <IllustrationText theme={theme}>
            Tham gia cùng hàng triệu người đang học tiếng Anh mỗi ngày
          </IllustrationText>
          <BenefitsList>
            <BenefitItem theme={theme}>
              <BenefitIcon>✨</BenefitIcon>
              <BenefitText theme={theme}>100% miễn phí, mãi mãi</BenefitText>
            </BenefitItem>
            <BenefitItem theme={theme}>
              <BenefitIcon>🎯</BenefitIcon>
              <BenefitText theme={theme}>Học theo lộ trình cá nhân hóa</BenefitText>
            </BenefitItem>
            <BenefitItem theme={theme}>
              <BenefitIcon>🏆</BenefitIcon>
              <BenefitText theme={theme}>Nhận huy chương và thành tích</BenefitText>
            </BenefitItem>
            <BenefitItem theme={theme}>
              <BenefitIcon>👥</BenefitIcon>
              <BenefitText theme={theme}>Tham gia cộng đồng học tập</BenefitText>
            </BenefitItem>
          </BenefitsList>
        </IllustrationContainer>
      </LeftSection>

      {/* Right Section - Register Form */}
      <RightSection>
        <RegisterContainer>
          <RegisterCard theme={theme}>
            <Logo>
              <LogoIcon>🦉</LogoIcon>
              <LogoText>EnglishMaster</LogoText>
            </Logo>
            <Title theme={theme}>Đăng ký tài khoản</Title>
            <Subtitle theme={theme}>
              {currentStep === 1 && 'Bước 1: Thông tin cơ bản'}
              {currentStep === 2 && 'Bước 2: Bảo mật và độ tuổi'}
              {currentStep === 3 && 'Bước 3: Mục tiêu học tập'}
            </Subtitle>

            <StepIndicator>
              <Step active={currentStep === 1} theme={theme} />
              <Step active={currentStep === 2} theme={theme} />
              <Step active={currentStep === 3} theme={theme} />
            </StepIndicator>

            <Form onSubmit={handleSubmit}>
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <>
                  <FormRow>
                    <FormGroup>
                      <Label theme={theme}>Tên</Label>
                      <InputWrapper>
                        <InputIcon theme={theme}>👤</InputIcon>
                        <Input
                          type="text"
                          name="firstName"
                          placeholder="Tên của bạn"
                          value={formData.firstName}
                          onChange={handleChange}
                          theme={theme}
                          error={errors.firstName}
                        />
                      </InputWrapper>
                      {errors.firstName && <ErrorMessage>{errors.firstName}</ErrorMessage>}
                    </FormGroup>

                    <FormGroup>
                      <Label theme={theme}>Họ</Label>
                      <InputWrapper>
                        <InputIcon theme={theme}>👤</InputIcon>
                        <Input
                          type="text"
                          name="lastName"
                          placeholder="Họ của bạn"
                          value={formData.lastName}
                          onChange={handleChange}
                          theme={theme}
                          error={errors.lastName}
                        />
                      </InputWrapper>
                      {errors.lastName && <ErrorMessage>{errors.lastName}</ErrorMessage>}
                    </FormGroup>
                  </FormRow>

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

                  <Divider theme={theme}>
                    <DividerText theme={theme}>Hoặc đăng ký với</DividerText>
                  </Divider>

                  <SocialButtons>
                    <SocialButton
                      type="button"
                      theme={theme}
                      onClick={() => handleSocialRegister('Google')}
                    >
                      <span>🔵</span>
                      Google
                    </SocialButton>
                    <SocialButton
                      type="button"
                      theme={theme}
                      onClick={() => handleSocialRegister('Facebook')}
                    >
                      <span>📘</span>
                      Facebook
                    </SocialButton>
                  </SocialButtons>
                </>
              )}

              {/* Step 2: Password & Age */}
              {currentStep === 2 && (
                <>
                  <FormGroup>
                    <Label theme={theme}>Mật khẩu</Label>
                    <InputWrapper>
                      <InputIcon theme={theme}>🔒</InputIcon>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Tạo mật khẩu"
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
                    {formData.password && (
                      <PasswordStrength>
                        <StrengthBar theme={theme}>
                          <StrengthFill strength={passwordStrength} />
                        </StrengthBar>
                        <StrengthText strength={passwordStrength}>
                          Độ mạnh: {getStrengthText(passwordStrength)}
                        </StrengthText>
                      </PasswordStrength>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <Label theme={theme}>Xác nhận mật khẩu</Label>
                    <InputWrapper>
                      <InputIcon theme={theme}>🔒</InputIcon>
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        placeholder="Nhập lại mật khẩu"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        theme={theme}
                        error={errors.confirmPassword}
                      />
                      <PasswordToggle
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        theme={theme}
                      >
                        {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                      </PasswordToggle>
                    </InputWrapper>
                    {errors.confirmPassword && <ErrorMessage>{errors.confirmPassword}</ErrorMessage>}
                  </FormGroup>

                  <FormGroup>
                    <Label theme={theme}>Độ tuổi</Label>
                    <InputWrapper>
                      <InputIcon theme={theme}>🎂</InputIcon>
                      <Select
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        theme={theme}
                        error={errors.age}
                      >
                        <option value="">Chọn độ tuổi</option>
                        <option value="under-13">Dưới 13 tuổi</option>
                        <option value="13-17">13-17 tuổi</option>
                        <option value="18-24">18-24 tuổi</option>
                        <option value="25-34">25-34 tuổi</option>
                        <option value="35-44">35-44 tuổi</option>
                        <option value="45+">Trên 45 tuổi</option>
                      </Select>
                    </InputWrapper>
                    {errors.age && <ErrorMessage>{errors.age}</ErrorMessage>}
                  </FormGroup>
                </>
              )}

              {/* Step 3: Goals & Terms */}
              {currentStep === 3 && (
                <>
                  <FormGroup>
                    <Label theme={theme}>Trình độ hiện tại</Label>
                    <InputWrapper>
                      <InputIcon theme={theme}>📊</InputIcon>
                      <Select
                        name="level"
                        value={formData.level}
                        onChange={handleChange}
                        theme={theme}
                        error={errors.level}
                      >
                        <option value="">Chọn trình độ</option>
                        <option value="beginner">Mới bắt đầu (A1)</option>
                        <option value="elementary">Sơ cấp (A2)</option>
                        <option value="intermediate">Trung cấp (B1)</option>
                        <option value="upper-intermediate">Trung cấp cao (B2)</option>
                        <option value="advanced">Nâng cao (C1)</option>
                        <option value="proficient">Thành thạo (C2)</option>
                      </Select>
                    </InputWrapper>
                    {errors.level && <ErrorMessage>{errors.level}</ErrorMessage>}
                  </FormGroup>

                  <FormGroup>
                    <Label theme={theme}>Mục tiêu học tập</Label>
                    <InputWrapper>
                      <InputIcon theme={theme}>🎯</InputIcon>
                      <Select
                        name="goal"
                        value={formData.goal}
                        onChange={handleChange}
                        theme={theme}
                        error={errors.goal}
                      >
                        <option value="">Chọn mục tiêu</option>
                        <option value="travel">Du lịch</option>
                        <option value="work">Công việc</option>
                        <option value="study">Học tập</option>
                        <option value="exam">Thi cử (IELTS, TOEIC...)</option>
                        <option value="personal">Phát triển bản thân</option>
                        <option value="other">Khác</option>
                      </Select>
                    </InputWrapper>
                    {errors.goal && <ErrorMessage>{errors.goal}</ErrorMessage>}
                  </FormGroup>

                  <CheckboxWrapper>
                    <Checkbox
                      type="checkbox"
                      id="agreeTerms"
                      name="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={handleChange}
                    />
                    <CheckboxLabel htmlFor="agreeTerms" theme={theme}>
                      Tôi đồng ý với{' '}
                      <a href="#terms">Điều khoản sử dụng</a> và{' '}
                      <a href="#privacy">Chính sách bảo mật</a> của EnglishMaster
                    </CheckboxLabel>
                  </CheckboxWrapper>
                  {errors.agreeTerms && <ErrorMessage>{errors.agreeTerms}</ErrorMessage>}
                </>
              )}

              {/* Navigation Buttons */}
              <ButtonGroup>
                {currentStep > 1 && (
                  <BackButton type="button" onClick={handleBack} theme={theme}>
                    ← Quay lại
                  </BackButton>
                )}
                {currentStep < 3 ? (
                  <NextButton type="button" onClick={handleNext}>
                    Tiếp theo →
                  </NextButton>
                ) : (
                  <NextButton type="submit" disabled={loading}>
                    {loading ? <LoadingSpinner /> : 'Hoàn tất đăng ký'}
                  </NextButton>
                )}
              </ButtonGroup>
            </Form>

            <LoginText theme={theme}>
              Đã có tài khoản?{' '}
              <LoginLink to="/login">Đăng nhập ngay</LoginLink>
            </LoginText>

        </RegisterCard>
      </RegisterContainer>
    </RightSection>
    </PageWrapper >
  );
};

export default Register;