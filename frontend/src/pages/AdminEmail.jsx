import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Swal from 'sweetalert2';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import AdminLayout from '../layouts/AdminLayout';

// ========== STYLED COMPONENTS ==========

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const WelcomeCard = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'linear-gradient(135deg, #1f2937 0%, #111827 100%)' 
    : 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)'
  };
  border-radius: 24px;
  padding: 2rem;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 300px;
    height: 300px;
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    opacity: 0.05;
    border-radius: 50%;
    transform: translate(30%, -30%);
  }

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
`;

const WelcomeContent = styled.div`
  flex: 1;
  z-index: 1;
`;

const WelcomeTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.5rem;
`;

const WelcomeSubtitle = styled.p`
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  margin-bottom: 0.75rem;
`;

const DateTime = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  span:first-child {
    font-size: 1rem;
  }
`;

const WelcomeIllustration = styled.div`
  font-size: 5rem;
  z-index: 1;

  @media (max-width: 768px) {
    font-size: 4rem;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1.5rem;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  }
`;

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: ${props => props.color || '#f59e0b'}22;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-weight: 600;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const TemplatesList = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1.5rem;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };
`;

const ListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ListTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
`;

const AddButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 10px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  border: none;
  font-weight: bold;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
  }
`;

const TemplateItem = styled.div`
  padding: 1rem;
  margin-bottom: 0.75rem;
  border-radius: 12px;
  background: ${props => {
    if (props.active) {
      return props.theme === 'dark' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)';
    }
    return props.theme === 'dark' ? '#1f2937' : '#f9fafb';
  }};
  border-left: 3px solid ${props => props.active ? '#f59e0b' : 'transparent'};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.theme === 'dark' ? '#374151' : '#f3f4f6'};
    transform: translateX(5px);
  }
`;

const TemplateIcon = styled.span`
  font-size: 1.5rem;
  margin-right: 0.75rem;
`;

const TemplateName = styled.div`
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.25rem;
`;

const TemplateDescription = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

const EditorSection = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };
`;

const EditorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
`;

const EditorTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const EditorActions = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const ActionButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;

  ${props => {
    if (props.variant === 'primary') {
      return `
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        color: white;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
        }
      `;
    }
    if (props.variant === 'secondary') {
      return `
        background: linear-gradient(135deg, #1CB0F6 0%, #0891b2 100%);
        color: white;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(28, 176, 246, 0.3);
        }
      `;
    }
    return `
      background: ${props.theme === 'dark' ? '#374151' : '#f3f4f6'};
      color: ${props.theme === 'dark' ? '#e5e7eb' : '#374151'};
      
      &:hover {
        background: ${props.theme === 'dark' ? '#4B5563' : '#e5e7eb'};
      }
    `;
  }}
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 2px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #f59e0b;
    box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 200px;
  padding: 1rem;
  border-radius: 12px;
  border: 2px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 0.875rem;
  font-family: 'Courier New', monospace;
  line-height: 1.6;
  resize: vertical;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #f59e0b;
    box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
  }
`;

const VariablesBox = styled.div`
  padding: 1rem;
  border-radius: 12px;
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#f9fafb'};
  margin-bottom: 1.5rem;
`;

const VariablesTitle = styled.div`
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
`;

const VariablesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const VariableTag = styled.span`
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  font-size: 0.75rem;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(245, 158, 11, 0.2);
    transform: scale(1.05);
  }
`;

// ========== MOCK DATA ==========

const mockTemplates = [
  {
    id: 1,
    icon: '👋',
    name: 'Welcome Email',
    description: 'Email chào mừng người dùng mới',
    subject: 'Welcome to EnglishMaster! 🎉',
    content: `Hi {{user_name}},

Welcome to EnglishMaster! We're thrilled to have you join our learning community.

Your account has been successfully created:
- Email: {{user_email}}
- Account ID: {{user_id}}
- Join Date: {{current_date}}

Get started now:
1. Complete your profile
2. Take a placement test
3. Start your first lesson

Best regards,
EnglishMaster Team`,
  },
  {
    id: 2,
    icon: '🔐',
    name: 'Password Reset',
    description: 'Email đặt lại mật khẩu',
    subject: 'Reset Your Password',
    content: `Hi {{user_name}},

We received a request to reset your password.

Click here to reset: {{reset_link}}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

Best regards,
EnglishMaster Team`,
  },
  {
    id: 3,
    icon: '✅',
    name: 'Email Verification',
    description: 'Xác thực địa chỉ email',
    subject: 'Verify Your Email Address',
    content: `Hi {{user_name}},

Please verify your email address to activate your account.

Verification Code: {{verification_code}}

Or click here: {{verification_link}}

Best regards,
EnglishMaster Team`,
  },
  {
    id: 4,
    icon: '🎓',
    name: 'Course Completion',
    description: 'Thông báo hoàn thành khóa học',
    subject: 'Congratulations! Course Completed 🎉',
    content: `Hi {{user_name}},

Congratulations on completing "{{course_name}}"!

Your achievements:
- Final Score: {{final_score}}%
- Completion Date: {{completion_date}}
- Certificate: {{certificate_link}}

Keep learning!

Best regards,
EnglishMaster Team`,
  },
  {
    id: 5,
    icon: '📧',
    name: 'Newsletter',
    description: 'Bản tin định kỳ',
    subject: 'EnglishMaster Weekly Newsletter 📰',
    content: `Hi {{user_name}},

Here's your weekly learning summary:

📊 This Week:
- Lessons Completed: {{lessons_count}}
- Study Time: {{study_time}} minutes
- Current Streak: {{streak_days}} days

🔥 Keep it up!

Best regards,
EnglishMaster Team`,
  },
];

// ========== COMPONENT ==========

const AdminEmail = () => {
  const { toast, showToast, hideToast } = useToast();
  const [theme] = useState('light');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTemplate, setSelectedTemplate] = useState(mockTemplates[0]);
  const [editedTemplate, setEditedTemplate] = useState(mockTemplates[0]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date) => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const stats = {
    templates: mockTemplates.length,
    sent: 12567,
    delivered: 12234,
    openRate: 78,
  };

  const variables = [
    '{{user_name}}',
    '{{user_email}}',
    '{{user_id}}',
    '{{current_date}}',
    '{{reset_link}}',
    '{{verification_code}}',
    '{{verification_link}}',
    '{{course_name}}',
    '{{final_score}}',
    '{{completion_date}}',
    '{{certificate_link}}',
    '{{lessons_count}}',
    '{{study_time}}',
    '{{streak_days}}',
  ];

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setEditedTemplate(template);
  };

  const handleSaveTemplate = () => {
    Swal.fire({
      icon: 'success',
      title: 'Đã lưu!',
      text: `Template "${editedTemplate.name}" đã được cập nhật`,
      confirmButtonColor: '#f59e0b',
    });
    showToast('success', 'Thành công!', 'Email template đã được lưu');
  };

  const handleTestSend = () => {
    Swal.fire({
      title: '📧 Gửi email thử',
      html: `
        <div style="text-align:left;">
          <p style="margin-bottom:1rem;color:#6b7280;">Nhập email để nhận email thử nghiệm</p>
          <input id="testEmail" type="email" class="swal2-input" placeholder="your@email.com" style="margin:0;width:100%;">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '📤 Gửi',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#6b7280',
      preConfirm: () => {
        const email = document.getElementById('testEmail').value;
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
          Swal.showValidationMessage('Vui lòng nhập email hợp lệ');
          return false;
        }
        return email;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        showToast('success', 'Đã gửi!', `Email thử đã được gửi đến ${result.value}`);
      }
    });
  };

  const handleAddTemplate = () => {
    Swal.fire({
      title: '➕ Thêm template mới',
      html: `
        <div style="display:flex;flex-direction:column;gap:1rem;text-align:left;">
          <label>
            <span style="font-weight:600;color:#1e293b;display:block;margin-bottom:0.5rem;">📧 Tên template</span>
            <input id="templateName" class="swal2-input" placeholder="VD: Welcome Email" style="margin:0;width:100%;">
          </label>
          <label>
            <span style="font-weight:600;color:#1e293b;display:block;margin-bottom:0.5rem;">📝 Mô tả</span>
            <input id="templateDesc" class="swal2-input" placeholder="Mô tả ngắn" style="margin:0;width:100%;">
          </label>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '✨ Tạo template',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#6b7280',
      width: 600,
    }).then((result) => {
      if (result.isConfirmed) {
        showToast('success', 'Thành công!', 'Template mới đã được tạo');
      }
    });
  };

  const handleInsertVariable = (variable) => {
    setEditedTemplate({
      ...editedTemplate,
      content: editedTemplate.content + ' ' + variable
    });
    showToast('info', 'Đã thêm', `Biến ${variable} đã được thêm vào nội dung`);
  };

  return (
    <AdminLayout pageTitle="📧 Email">
      <Toast toast={toast} onClose={hideToast} />
      
      <PageContainer>
        {/* Welcome Card */}
        <WelcomeCard theme={theme}>
          <WelcomeContent>
            <WelcomeTitle theme={theme}>
              Quản lý Email Templates 📧
            </WelcomeTitle>
            <WelcomeSubtitle theme={theme}>
              Tạo và chỉnh sửa các mẫu email tự động
            </WelcomeSubtitle>
            <DateTime theme={theme}>
              <span>🕐</span>
              {formatDateTime(currentTime)} UTC | 👤 vinhsonvlog
            </DateTime>
          </WelcomeContent>
          <WelcomeIllustration>📧</WelcomeIllustration>
        </WelcomeCard>

        {/* Stats */}
        <StatsGrid>
          <StatCard theme={theme}>
            <StatIcon color="#f59e0b">📧</StatIcon>
            <StatValue theme={theme}>{stats.templates}</StatValue>
            <StatLabel theme={theme}>Templates</StatLabel>
          </StatCard>

          <StatCard theme={theme}>
            <StatIcon color="#1CB0F6">📤</StatIcon>
            <StatValue theme={theme}>{stats.sent.toLocaleString()}</StatValue>
            <StatLabel theme={theme}>Đã gửi</StatLabel>
          </StatCard>

          <StatCard theme={theme}>
            <StatIcon color="#10b981">✅</StatIcon>
            <StatValue theme={theme}>{stats.delivered.toLocaleString()}</StatValue>
            <StatLabel theme={theme}>Đã nhận</StatLabel>
          </StatCard>

          <StatCard theme={theme}>
            <StatIcon color="#8b5cf6">📊</StatIcon>
            <StatValue theme={theme}>{stats.openRate}%</StatValue>
            <StatLabel theme={theme}>Tỷ lệ mở</StatLabel>
          </StatCard>
        </StatsGrid>

        {/* Content Grid */}
        <ContentGrid>
          {/* Templates List */}
          <TemplatesList theme={theme}>
            <ListHeader>
              <ListTitle theme={theme}>Email Templates</ListTitle>
              <AddButton onClick={handleAddTemplate}>➕</AddButton>
            </ListHeader>

            {mockTemplates.map(template => (
              <TemplateItem
                key={template.id}
                theme={theme}
                active={selectedTemplate.id === template.id}
                onClick={() => handleSelectTemplate(template)}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <TemplateIcon>{template.icon}</TemplateIcon>
                  <div>
                    <TemplateName theme={theme}>{template.name}</TemplateName>
                    <TemplateDescription theme={theme}>
                      {template.description}
                    </TemplateDescription>
                  </div>
                </div>
              </TemplateItem>
            ))}
          </TemplatesList>

          {/* Editor */}
          <EditorSection theme={theme}>
            <EditorHeader theme={theme}>
              <EditorTitle theme={theme}>
                <span>{selectedTemplate.icon}</span>
                {selectedTemplate.name}
              </EditorTitle>
              <EditorActions>
                <ActionButton theme={theme} onClick={() => showToast('info', 'Preview', 'Xem trước email')}>
                  👁️ Preview
                </ActionButton>
                <ActionButton theme={theme} variant="secondary" onClick={handleTestSend}>
                  📤 Test Send
                </ActionButton>
                <ActionButton theme={theme} variant="primary" onClick={handleSaveTemplate}>
                  💾 Save
                </ActionButton>
              </EditorActions>
            </EditorHeader>

            <FormGroup>
              <Label theme={theme}>Subject</Label>
              <Input
                theme={theme}
                value={editedTemplate.subject}
                onChange={(e) => setEditedTemplate({ ...editedTemplate, subject: e.target.value })}
              />
            </FormGroup>

            <VariablesBox theme={theme}>
              <VariablesTitle theme={theme}>
                📋 Available Variables (Click to insert)
              </VariablesTitle>
              <VariablesList>
                {variables.map((variable, index) => (
                  <VariableTag
                    key={index}
                    onClick={() => handleInsertVariable(variable)}
                    title="Click to insert"
                  >
                    {variable}
                  </VariableTag>
                ))}
              </VariablesList>
            </VariablesBox>

            <FormGroup>
              <Label theme={theme}>Email Content</Label>
              <TextArea
                theme={theme}
                value={editedTemplate.content}
                onChange={(e) => setEditedTemplate({ ...editedTemplate, content: e.target.value })}
              />
            </FormGroup>
          </EditorSection>
        </ContentGrid>
      </PageContainer>
    </AdminLayout>
  );
};

export default AdminEmail;