import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import Swal from 'sweetalert2';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import Header from '../components/Header';

// ========== STYLED COMPONENTS ==========

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: ${props => props.theme === 'dark' 
    ? 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2d2d2d 100%)'
    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e0 100%)'
  };
  position: relative;
  overflow-x: hidden;

  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.theme === 'dark'
      ? 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 70%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 70%), radial-gradient(circle at 40% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 70%)'
      : 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 70%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.05) 0%, transparent 70%), radial-gradient(circle at 40% 80%, rgba(16, 185, 129, 0.05) 0%, transparent 70%)'
    };
    z-index: -1;
  }
`;

const DashboardContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const JoinCard = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 3rem;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };
  box-shadow: ${props => props.theme === 'dark'
    ? '0 20px 60px rgba(0, 0, 0, 0.5)'
    : '0 20px 60px rgba(0, 0, 0, 0.1)'
  };
  animation: slideUp 0.6s ease;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
  }
`;

const IconHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Icon = styled.div`
  font-size: 5rem;
  margin-bottom: 1rem;
  animation: float 3s ease-in-out infinite;

  @keyframes float {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  text-align: center;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  text-align: center;
  margin-bottom: 2rem;
  line-height: 1.6;
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
  font-size: 1.125rem;
  border: 2px solid ${props => props.theme === 'dark' 
    ? props.error ? '#ef4444' : '#374151'
    : props.error ? '#ef4444' : '#e5e7eb'
  };
  border-radius: 12px;
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  transition: all 0.3s ease;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-align: center;
  font-family: 'Courier New', monospace;

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
    text-transform: none;
    letter-spacing: normal;
  }
`;

const ErrorMessage = styled.span`
  font-size: 0.875rem;
  color: #ef4444;
  margin-top: 0.25rem;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1.25rem;
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;

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

  span:first-child {
    font-size: 1.5rem;
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
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-size: 0.875rem;
  font-weight: 600;
`;

const BackLink = styled.button`
  width: 100%;
  padding: 1rem;
  border: 2px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  background: transparent;
  color: ${props => props.theme === 'dark' ? '#e5e7eb' : '#374151'};
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background: ${props => props.theme === 'dark' ? '#374151' : '#f3f4f6'};
    transform: translateY(-2px);
  }
`;

const InfoBox = styled.div`
  background: rgba(28, 176, 246, 0.1);
  border: 2px solid #1CB0F6;
  border-radius: 12px;
  padding: 1rem;
  margin-top: 1.5rem;
`;

const InfoTitle = styled.div`
  font-weight: bold;
  color: #1CB0F6;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const InfoText = styled.div`
  color: ${props => props.theme === 'dark' ? '#d1d5db' : '#4b5563'};
  font-size: 0.875rem;
  line-height: 1.6;
`;

// ========== MOCK DATA ==========

const mockClasses = {
  'ABC123': {
    id: 1,
    name: 'TOEIC Basic - Morning Class',
    subject: 'TOEIC Preparation',
    teacher: 'Tran Thi B',
    students: 28,
    maxStudents: 30,
    color: 'linear-gradient(135deg, #58CC02 0%, #45a302 100%)',
  },
  'XYZ789': {
    id: 2,
    name: 'Business English Advanced',
    subject: 'Business Communication',
    teacher: 'Nguyen Van C',
    students: 15,
    maxStudents: 20,
    color: 'linear-gradient(135deg, #1CB0F6 0%, #0891b2 100%)',
  },
  'DEF456': {
    id: 3,
    name: 'IELTS Speaking Practice',
    subject: 'IELTS Preparation',
    teacher: 'Le Thi D',
    students: 20,
    maxStudents: 25,
    color: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  },
};

// ========== COMPONENT ==========

const JoinClass = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast, showToast, hideToast } = useToast();
  const [theme, setTheme] = useState('light');
  const [classCode, setClassCode] = useState(searchParams.get('code') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const code = classCode.trim().toUpperCase();

    if (!code) {
      setError('Vui lòng nhập mã lớp học');
      return;
    }

    if (code.length !== 6) {
      setError('Mã lớp học phải có 6 ký tự');
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);

      const classInfo = mockClasses[code];

      if (!classInfo) {
        setError('Mã lớp học không tồn tại');
        showToast('error', 'Lỗi!', 'Mã lớp học không hợp lệ hoặc đã hết hạn');
        return;
      }

      if (classInfo.students >= classInfo.maxStudents) {
        setError('Lớp học đã đầy');
        showToast('error', 'Lỗi!', 'Lớp học đã đạt số lượng tối đa');
        return;
      }

      // Success - Show confirmation
      Swal.fire({
        title: 'Tìm thấy lớp học!',
        html: `
          <div style="text-align: left; padding: 1rem;">
            <h3 style="color: #58CC02; margin-bottom: 1rem;">📚 ${classInfo.name}</h3>
            <p><strong>Môn học:</strong> ${classInfo.subject}</p>
            <p><strong>Giảng viên:</strong> ${classInfo.teacher}</p>
            <p><strong>Số học viên:</strong> ${classInfo.students}/${classInfo.maxStudents}</p>
            <p style="margin-top: 1rem; color: #6b7280;">Bạn có muốn tham gia lớp học này không?</p>
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: '✅ Tham gia',
        cancelButtonText: 'Hủy',
        confirmButtonColor: '#58CC02',
        cancelButtonColor: '#6b7280',
      }).then((result) => {
        if (result.isConfirmed) {
          // Join class
          Swal.fire({
            icon: 'success',
            title: 'Tham gia thành công!',
            text: `Bạn đã tham gia lớp "${classInfo.name}"`,
            confirmButtonText: 'Đến lớp học',
            confirmButtonColor: '#58CC02',
          }).then(() => {
            navigate('/student/classes');
          });
        }
      });
    }, 1500);
  };

  return (
    <PageWrapper theme={theme}>
      <Toast toast={toast} onClose={hideToast} />

      <Header
        theme={theme}
        onThemeToggle={toggleTheme}
        userName="Vinh Son"
        userEmail="vinhsonvlog@example.com"
        notificationCount={3}
        showNotification={true}
        showAvatar={true}
      />

      <DashboardContainer>
        <JoinCard theme={theme}>
          <IconHeader>
            <Icon>🎓</Icon>
            <Title theme={theme}>Tham gia lớp học</Title>
            <Subtitle theme={theme}>
              Nhập mã lớp học mà giảng viên đã chia sẻ với bạn
            </Subtitle>
          </IconHeader>

          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label theme={theme}>Mã lớp học</Label>
              <InputWrapper>
                <Input
                  theme={theme}
                  type="text"
                  placeholder="VD: ABC123"
                  value={classCode}
                  onChange={(e) => {
                    setClassCode(e.target.value.toUpperCase());
                    setError('');
                  }}
                  maxLength={6}
                  error={error}
                />
              </InputWrapper>
              {error && <ErrorMessage>{error}</ErrorMessage>}
            </FormGroup>

            <SubmitButton type="submit" disabled={loading || !classCode.trim()}>
              {loading ? (
                <>
                  <LoadingSpinner />
                  Đang tìm kiếm...
                </>
              ) : (
                <>
                  <span>🔍</span>
                  Tìm kiếm lớp học
                </>
              )}
            </SubmitButton>
          </Form>

          <Divider theme={theme}>
            <DividerText theme={theme}>HOẶC</DividerText>
          </Divider>

          <BackLink theme={theme} onClick={() => navigate('/student/classes')}>
            <span>📋</span>
            Xem lớp học của tôi
          </BackLink>

          <InfoBox>
            <InfoTitle>
              <span>💡</span>
              Làm sao để lấy mã lớp học?
            </InfoTitle>
            <InfoText theme={theme}>
              Mã lớp học được giảng viên cung cấp khi tạo lớp. 
              Bạn có thể nhận mã qua email, link mời, hoặc trực tiếp từ giảng viên.
            </InfoText>
          </InfoBox>
        </JoinCard>
      </DashboardContainer>
    </PageWrapper>
  );
};

export default JoinClass;