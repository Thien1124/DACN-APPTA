import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import Swal from 'sweetalert2';
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
    z-index: -1;
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

const FormContainer = styled.div`
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

const FormCard = styled.div`
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

const BackLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 2rem;
  transition: color 0.3s ease;

  &:hover {
    color: #58CC02;
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
  line-height: 1.6;
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

const ErrorMessage = styled.span`
  font-size: 0.875rem;
  color: #ef4444;
  margin-top: 0.25rem;
`;

const SuccessMessage = styled.div`
  background: rgba(88, 204, 2, 0.1);
  border: 2px solid #58CC02;
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  margin-bottom: 1rem;
  animation: slideDown 0.5s ease;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const SuccessIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 0.5rem;
`;

const SuccessText = styled.p`
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#e5e7eb' : '#1a1a1a'};
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const SuccessSubtext = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
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

const ResendButton = styled.button`
  background: none;
  border: none;
  color: #58CC02;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.875rem;
  text-decoration: underline;
  transition: color 0.3s ease;

  &:hover {
    color: #45a302;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CodeInputContainer = styled.div`
  display: flex;
  gap: 0.85rem;
  justify-content: center;
  margin: 2rem 0;
`;

const CodeInput = styled.input`
  width: 60px;
  height: 60px;
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
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
    border-color: #58CC02;
    box-shadow: 0 0 0 3px rgba(88, 204, 2, 0.1);
  }

  @media (max-width: 480px) {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }
`;

const TimerText = styled.p`
  text-align: center;
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  margin-top: 1rem;
`;

// ========== COMPONENT ==========

const ForgotPassword = () => {
    const navigate = useNavigate();
    const { toast, showToast, hideToast } = useToast();
    const [theme, setTheme] = useState('light');
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState(false);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    const inputRefs = useRef([]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

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
            showToast('error', 'Lỗi!', 'Vui lòng nhập email');
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            showToast('error', 'Lỗi!', 'Email không hợp lệ');
            return;
        }

        setLoading(true);

        setTimeout(() => {
            setLoading(false);
            setCurrentStep(2);
            setTimer(60);
            setCanResend(false);
            showToast('success', 'Thành công!', `Mã xác nhận đã được gửi đến ${email}`);
        }, 1500);
    };


    const handleBeforeInput = (index, e) => {
        const { data, inputType } = e;

        if (inputType === 'deleteContentBackward' || inputType === 'deleteContentForward') {
            return;
        }

        if (inputType === 'insertFromPaste') {
            return;
        }

        if (!data || !/^\d$/.test(data)) {
            e.preventDefault();
            return;
        }

        if (code[index]) {
            e.preventDefault();
            const newCode = [...code];
            newCode[index] = data;
            setCode(newCode);
            setError('');

            if (index < 5) {
                requestAnimationFrame(() => {
                    inputRefs.current[index + 1]?.focus();
                    inputRefs.current[index + 1]?.select();
                });
            }
        }
    };

    const handleCodeChange = (index, e) => {
        const value = e.target.value;
        const digit = value.replace(/\D/g, '').slice(-1);

        if (!digit) {
            const updatedCode = [...code];
            updatedCode[index] = '';
            setCode(updatedCode);
            return;
        }

        const updatedCode = [...code];
        updatedCode[index] = digit;
        setCode(updatedCode);
        setError('');

        if (index < 5) {
            requestAnimationFrame(() => {
                inputRefs.current[index + 1]?.focus();
                inputRefs.current[index + 1]?.select();
            });
        }
    };
    // Sửa lại hàm handleCodePaste
    const handleCodePaste = (e, startIndex = 0) => {
        e.preventDefault();

        // Lấy dữ liệu paste và chỉ giữ lại số
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');

        if (!pastedData) return;

        const newCode = [...code];

        // Điền từng số vào từng ô
        for (let i = 0; i < pastedData.length && (startIndex + i) < 6; i++) {
            newCode[startIndex + i] = pastedData[i];
        }

        setCode(newCode);

        // Focus vào ô tiếp theo sau khi paste
        const nextEmptyIndex = newCode.findIndex((val, idx) => idx >= startIndex && !val);
        if (nextEmptyIndex !== -1) {
            setTimeout(() => {
                inputRefs.current[nextEmptyIndex]?.focus();
            }, 0);
        } else {
            // Nếu đã đầy, focus ô cuối
            setTimeout(() => {
                inputRefs.current[5]?.focus();
            }, 0);
        }
    };

    const handleCodeKeyDown = (index, e) => {
        if (e.key === 'Backspace') {
            if (!code[index] && index > 0) {
                inputRefs.current[index - 1]?.focus();
            } else {
                const newCode = [...code];
                newCode[index] = '';
                setCode(newCode);
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };


    // Handle code verification
    const handleCodeSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const fullCode = code.join('');
        if (fullCode.length !== 6) {
            showToast('warning', 'Cảnh báo!', 'Vui lòng nhập đầy đủ 6 số');
            return;
        }

        setLoading(true);

        setTimeout(() => {
            setLoading(false);

            // Demo: accept "123456"
            if (fullCode === '123456') {
                setCurrentStep(3);
                showToast('success', 'Thành công!', 'Mã xác nhận chính xác!');
            } else {
                setError('Mã xác nhận không đúng');
                showToast('error', 'Lỗi!', 'Mã xác nhận không đúng. Thử lại!');
                setCode(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            }
        }, 1500);
    };

    // Handle resend code
    const handleResendCode = () => {
        setTimer(60);
        setCanResend(false);
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        showToast('info', 'Thông báo', 'Mã xác nhận mới đã được gửi!');
    };

    // Handle password submission
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!password) {
            showToast('error', 'Lỗi!', 'Vui lòng nhập mật khẩu mới');
            return;
        }

        if (password.length < 6) {
            showToast('error', 'Lỗi!', 'Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        if (password !== confirmPassword) {
            showToast('error', 'Lỗi!', 'Mật khẩu xác nhận không khớp');
            return;
        }

        setLoading(true);

        setTimeout(() => {
            setLoading(false);
            setSuccessMessage(true);

            Swal.fire({
                icon: 'success',
                title: 'Thành công!',
                text: 'Mật khẩu của bạn đã được đặt lại thành công!',
                confirmButtonText: 'Đăng nhập ngay',
                confirmButtonColor: '#58CC02',
                timer: 5000,
                timerProgressBar: true,
            }).then(() => {
                navigate('/login');
            });
        }, 1500);
    };

    return (
        <PageWrapper theme={theme}>
            <Toast toast={toast} onClose={hideToast} />

            <ThemeToggle theme={theme} onClick={toggleTheme}>
                {theme === 'light' ? '🌙' : '☀️'}
            </ThemeToggle>

            <LeftSection>
                <IllustrationContainer>
                    <IllustrationEmoji>🔐</IllustrationEmoji>
                    <IllustrationTitle theme={theme}>
                        Đừng lo lắng!
                    </IllustrationTitle>
                    <IllustrationText theme={theme}>
                        Chúng tôi sẽ giúp bạn lấy lại mật khẩu một cách nhanh chóng và an toàn.
                    </IllustrationText>
                </IllustrationContainer>
            </LeftSection>

            <RightSection>
                <FormContainer>
                    <FormCard theme={theme}>
                        <Logo>
                            <LogoIcon>🦉</LogoIcon>
                            <LogoText>EnglishMaster</LogoText>
                        </Logo>

                        <BackLink to="/login" theme={theme}>
                            <span>←</span>
                            Quay lại đăng nhập
                        </BackLink>

                        {!successMessage ? (
                            <>
                                <Title theme={theme}>
                                    {currentStep === 1 && 'Quên mật khẩu?'}
                                    {currentStep === 2 && 'Nhập mã xác nhận'}
                                    {currentStep === 3 && 'Tạo mật khẩu mới'}
                                </Title>
                                <Subtitle theme={theme}>
                                    {currentStep === 1 && 'Nhập email của bạn và chúng tôi sẽ gửi mã xác nhận'}
                                    {currentStep === 2 && `Chúng tôi đã gửi mã 6 số đến ${email}`}
                                    {currentStep === 3 && 'Hãy tạo một mật khẩu mạnh và dễ nhớ'}
                                </Subtitle>

                                <StepIndicator>
                                    <Step active={currentStep === 1} theme={theme} />
                                    <Step active={currentStep === 2} theme={theme} />
                                    <Step active={currentStep === 3} theme={theme} />
                                </StepIndicator>

                                {currentStep === 1 && (
                                    <Form onSubmit={handleEmailSubmit}>
                                        <FormGroup>
                                            <Label theme={theme}>Email</Label>
                                            <InputWrapper>
                                                <InputIcon theme={theme}>📧</InputIcon>
                                                <Input
                                                    type="email"
                                                    placeholder="example@email.com"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    theme={theme}
                                                    error={error}
                                                />
                                            </InputWrapper>
                                            {error && <ErrorMessage>{error}</ErrorMessage>}
                                        </FormGroup>

                                        <SubmitButton type="submit" disabled={loading}>
                                            {loading ? <LoadingSpinner /> : 'Gửi mã xác nhận'}
                                        </SubmitButton>
                                    </Form>
                                )}

                                {currentStep === 2 && (
                                    <Form onSubmit={handleCodeSubmit}>
                                        <CodeInputContainer>
                                            {code.map((digit, index) => (
                                                <CodeInput
                                                    key={index}
                                                    ref={(el) => (inputRefs.current[index] = el)}
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength="1"
                                                    value={digit}
                                                    onBeforeInput={(e) => handleBeforeInput(index, e)}
                                                    onChange={(e) => handleCodeChange(index, e)}
                                                    onKeyDown={(e) => handleCodeKeyDown(index, e)}
                                                    onPaste={(e) => handleCodePaste(e, index)}
                                                    onFocus={(e) => e.target.select()}
                                                    theme={theme}
                                                    error={error}
                                                    autoComplete="off"
                                                />
                                            ))}
                                        </CodeInputContainer>
                                        {error && <ErrorMessage style={{ textAlign: 'center' }}>{error}</ErrorMessage>}

                                        <TimerText theme={theme}>
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
                                            <Label theme={theme}>Mật khẩu mới</Label>
                                            <InputWrapper>
                                                <InputIcon theme={theme}>🔒</InputIcon>
                                                <Input
                                                    type="password"
                                                    placeholder="Nhập mật khẩu mới"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    theme={theme}
                                                    error={error}
                                                />
                                            </InputWrapper>
                                        </FormGroup>

                                        <FormGroup>
                                            <Label theme={theme}>Xác nhận mật khẩu</Label>
                                            <InputWrapper>
                                                <InputIcon theme={theme}>🔒</InputIcon>
                                                <Input
                                                    type="password"
                                                    placeholder="Nhập lại mật khẩu"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    theme={theme}
                                                    error={error}
                                                />
                                            </InputWrapper>
                                            {error && <ErrorMessage>{error}</ErrorMessage>}
                                        </FormGroup>

                                        <SubmitButton type="submit" disabled={loading}>
                                            {loading ? <LoadingSpinner /> : 'Đặt lại mật khẩu'}
                                        </SubmitButton>
                                    </Form>
                                )}
                            </>
                        ) : (
                            <SuccessMessage>
                                <SuccessIcon>🎉</SuccessIcon>
                                <SuccessText theme={theme}>
                                    Đặt lại mật khẩu thành công!
                                </SuccessText>
                                <SuccessSubtext theme={theme}>
                                    Đang chuyển đến trang đăng nhập...
                                </SuccessSubtext>
                            </SuccessMessage>
                        )}

                        {!successMessage && (
                            <LoginText theme={theme}>
                                Nhớ mật khẩu?{' '}
                                <LoginLink to="/login">Đăng nhập ngay</LoginLink>
                            </LoginText>
                        )}
                    </FormCard>
                </FormContainer>
            </RightSection>
        </PageWrapper>
    );
};

export default ForgotPassword;