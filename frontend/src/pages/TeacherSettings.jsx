import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Swal from 'sweetalert2';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import TeacherLayout from '../layouts/TeacherLayout';

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
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
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
`;

const TabsContainer = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1rem;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #8b5cf6;
    border-radius: 3px;
  }
`;

const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  border: none;
  background: ${props => props.active ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' : 'transparent'};
  color: ${props => {
    if (props.active) return 'white';
    return props.theme === 'dark' ? '#9ca3af' : '#6b7280';
  }};
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${props => props.active 
      ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' 
      : (props.theme === 'dark' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)')
    };
  }
`;

const SettingsSection = styled.div`
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

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const SettingsGrid = styled.div`
  display: grid;
  gap: 1.5rem;
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#f9fafb'};
  border-radius: 16px;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.theme === 'dark' ? '#374151' : '#f3f4f6'};
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const SettingInfo = styled.div`
  flex: 1;
`;

const SettingLabel = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.5rem;
`;

const SettingDescription = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  line-height: 1.5;
`;

const SettingControl = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 32px;
  cursor: pointer;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.checked ? '#8b5cf6' : '#d1d5db'};
    transition: 0.3s;
    border-radius: 34px;

    &:before {
      position: absolute;
      content: "";
      height: 24px;
      width: 24px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: 0.3s;
      border-radius: 50%;
      transform: ${props => props.checked ? 'translateX(28px)' : 'translateX(0)'};
    }
  }

  &:hover span {
    background: ${props => props.checked ? '#7c3aed' : '#9ca3af'};
  }
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border-radius: 10px;
  border: 2px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 0.875rem;
  width: 200px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const Select = styled.select`
  padding: 0.75rem 1rem;
  border-radius: 10px;
  border: 2px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 0.875rem;
  font-weight: 600;
  width: 200px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #8b5cf6;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const Button = styled.button`
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
        background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
        color: white;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        }
      `;
    }
    if (props.variant === 'danger') {
      return `
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
        
        &:hover {
          background: rgba(239, 68, 68, 0.2);
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

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ProfileSection = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const AvatarSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const Avatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
`;

const ProfileInfo = styled.div`
  flex: 1;
  display: grid;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 0.875rem;
`;

const TextArea = styled.textarea`
  padding: 0.75rem 1rem;
  border-radius: 10px;
  border: 2px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 0.875rem;
  min-height: 100px;
  resize: vertical;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }
`;

// ========== COMPONENT ==========

const TeacherSettings = () => {
  const { toast, showToast, hideToast } = useToast();
  const [theme] = useState('light');
  const [activeTab, setActiveTab] = useState('profile');
  const [currentTime, setCurrentTime] = useState(new Date());

  const [settings, setSettings] = useState({
    // Profile
    fullName: 'Vinh Son',
    email: 'vinhsonvlog@example.com',
    phone: '+84 123 456 789',
    bio: 'Passionate English teacher with 5 years of experience',
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    commentNotifications: true,
    assignmentNotifications: true,
    
    // Privacy
    showProfile: true,
    showEmail: false,
    allowMessages: true,
    
    // Preferences
    language: 'vi',
    timezone: 'Asia/Ho_Chi_Minh',
    theme: 'light',
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
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

  const handleToggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleInputChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleSaveSettings = () => {
    Swal.fire({
      icon: 'success',
      title: 'Đã lưu!',
      text: 'Cài đặt đã được cập nhật thành công',
      confirmButtonColor: '#8b5cf6',
    });
    showToast('success', 'Thành công!', 'Cài đặt đã được lưu');
  };

  const handleChangePassword = () => {
    Swal.fire({
      title: '🔐 Đổi mật khẩu',
      html: `
        <div style="display:flex;flex-direction:column;gap:1rem;text-align:left;">
          <label>
            <span style="font-weight:600;color:#1e293b;display:block;margin-bottom:0.5rem;">🔒 Mật khẩu hiện tại</span>
            <input id="currentPassword" type="password" class="swal2-input" style="margin:0;width:100%;">
          </label>
          <label>
            <span style="font-weight:600;color:#1e293b;display:block;margin-bottom:0.5rem;">🔑 Mật khẩu mới</span>
            <input id="newPassword" type="password" class="swal2-input" style="margin:0;width:100%;">
          </label>
          <label>
            <span style="font-weight:600;color:#1e293b;display:block;margin-bottom:0.5rem;">✅ Xác nhận mật khẩu mới</span>
            <input id="confirmPassword" type="password" class="swal2-input" style="margin:0;width:100%;">
          </label>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '🔑 Đổi mật khẩu',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#8b5cf6',
      cancelButtonColor: '#6b7280',
      width: 500,
    }).then((result) => {
      if (result.isConfirmed) {
        showToast('success', 'Thành công!', 'Mật khẩu đã được thay đổi');
      }
    });
  };

  const renderProfileSettings = () => (
    <SettingsSection theme={theme}>
      <SectionTitle theme={theme}>
        <span>👤</span>
        Thông tin cá nhân
      </SectionTitle>

      <ProfileSection>
        <AvatarSection>
          <Avatar>👨‍🏫</Avatar>
          <Button variant="primary" onClick={() => showToast('info', 'Upload', 'Chức năng đang phát triển')}>
            📷 Đổi ảnh
          </Button>
        </AvatarSection>

        <ProfileInfo>
          <FormGroup>
            <Label theme={theme}>Họ và tên</Label>
            <Input
              theme={theme}
              value={settings.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
            />
          </FormGroup>

          <FormGroup>
            <Label theme={theme}>Email</Label>
            <Input
              theme={theme}
              type="email"
              value={settings.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          </FormGroup>

          <FormGroup>
            <Label theme={theme}>Số điện thoại</Label>
            <Input
              theme={theme}
              value={settings.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
          </FormGroup>
        </ProfileInfo>
      </ProfileSection>

      <FormGroup>
        <Label theme={theme}>Giới thiệu bản thân</Label>
        <TextArea
          theme={theme}
          value={settings.bio}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          placeholder="Viết vài dòng về bản thân..."
        />
      </FormGroup>

      <ActionButtons>
        <Button theme={theme} onClick={handleChangePassword}>
          🔐 Đổi mật khẩu
        </Button>
        <Button theme={theme} variant="primary" onClick={handleSaveSettings}>
          💾 Lưu thay đổi
        </Button>
      </ActionButtons>
    </SettingsSection>
  );

  const renderNotificationSettings = () => (
    <SettingsSection theme={theme}>
      <SectionTitle theme={theme}>
        <span>🔔</span>
        Thông báo
      </SectionTitle>

      <SettingsGrid>
        <SettingItem theme={theme}>
          <SettingInfo>
            <SettingLabel theme={theme}>Email thông báo</SettingLabel>
            <SettingDescription theme={theme}>
              Nhận thông báo qua email
            </SettingDescription>
          </SettingInfo>
          <SettingControl>
            <ToggleSwitch checked={settings.emailNotifications}>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={() => handleToggle('emailNotifications')}
              />
              <span />
            </ToggleSwitch>
          </SettingControl>
        </SettingItem>

        <SettingItem theme={theme}>
          <SettingInfo>
            <SettingLabel theme={theme}>Push notifications</SettingLabel>
            <SettingDescription theme={theme}>
              Nhận thông báo đẩy trên trình duyệt
            </SettingDescription>
          </SettingInfo>
          <SettingControl>
            <ToggleSwitch checked={settings.pushNotifications}>
              <input
                type="checkbox"
                checked={settings.pushNotifications}
                onChange={() => handleToggle('pushNotifications')}
              />
              <span />
            </ToggleSwitch>
          </SettingControl>
        </SettingItem>

        <SettingItem theme={theme}>
          <SettingInfo>
            <SettingLabel theme={theme}>Nhận xét mới</SettingLabel>
            <SettingDescription theme={theme}>
              Thông báo khi có nhận xét mới từ học viên
            </SettingDescription>
          </SettingInfo>
          <SettingControl>
            <ToggleSwitch checked={settings.commentNotifications}>
              <input
                type="checkbox"
                checked={settings.commentNotifications}
                onChange={() => handleToggle('commentNotifications')}
              />
              <span />
            </ToggleSwitch>
          </SettingControl>
        </SettingItem>

        <SettingItem theme={theme}>
          <SettingInfo>
            <SettingLabel theme={theme}>Bài tập mới</SettingLabel>
            <SettingDescription theme={theme}>
              Thông báo khi học viên nộp bài tập
            </SettingDescription>
          </SettingInfo>
          <SettingControl>
            <ToggleSwitch checked={settings.assignmentNotifications}>
              <input
                type="checkbox"
                checked={settings.assignmentNotifications}
                onChange={() => handleToggle('assignmentNotifications')}
              />
              <span />
            </ToggleSwitch>
          </SettingControl>
        </SettingItem>
      </SettingsGrid>

      <ActionButtons>
        <Button theme={theme} variant="primary" onClick={handleSaveSettings}>
          💾 Lưu thay đổi
        </Button>
      </ActionButtons>
    </SettingsSection>
  );

  const renderPrivacySettings = () => (
    <SettingsSection theme={theme}>
      <SectionTitle theme={theme}>
        <span>🔒</span>
        Quyền riêng tư
      </SectionTitle>

      <SettingsGrid>
        <SettingItem theme={theme}>
          <SettingInfo>
            <SettingLabel theme={theme}>Hiển thị hồ sơ công khai</SettingLabel>
            <SettingDescription theme={theme}>
              Cho phép mọi người xem hồ sơ của bạn
            </SettingDescription>
          </SettingInfo>
          <SettingControl>
            <ToggleSwitch checked={settings.showProfile}>
              <input
                type="checkbox"
                checked={settings.showProfile}
                onChange={() => handleToggle('showProfile')}
              />
              <span />
            </ToggleSwitch>
          </SettingControl>
        </SettingItem>

        <SettingItem theme={theme}>
          <SettingInfo>
            <SettingLabel theme={theme}>Hiển thị email</SettingLabel>
            <SettingDescription theme={theme}>
              Cho phép học viên xem email của bạn
            </SettingDescription>
          </SettingInfo>
          <SettingControl>
            <ToggleSwitch checked={settings.showEmail}>
              <input
                type="checkbox"
                checked={settings.showEmail}
                onChange={() => handleToggle('showEmail')}
              />
              <span />
            </ToggleSwitch>
          </SettingControl>
        </SettingItem>

        <SettingItem theme={theme}>
          <SettingInfo>
            <SettingLabel theme={theme}>Cho phép tin nhắn</SettingLabel>
            <SettingDescription theme={theme}>
              Cho phép học viên gửi tin nhắn trực tiếp
            </SettingDescription>
          </SettingInfo>
          <SettingControl>
            <ToggleSwitch checked={settings.allowMessages}>
              <input
                type="checkbox"
                checked={settings.allowMessages}
                onChange={() => handleToggle('allowMessages')}
              />
              <span />
            </ToggleSwitch>
          </SettingControl>
        </SettingItem>
      </SettingsGrid>

      <ActionButtons>
        <Button theme={theme} variant="primary" onClick={handleSaveSettings}>
          💾 Lưu thay đổi
        </Button>
      </ActionButtons>
    </SettingsSection>
  );

  const renderPreferencesSettings = () => (
    <SettingsSection theme={theme}>
      <SectionTitle theme={theme}>
        <span>⚙️</span>
        Tùy chọn
      </SectionTitle>

      <SettingsGrid>
        <SettingItem theme={theme}>
          <SettingInfo>
            <SettingLabel theme={theme}>Ngôn ngữ</SettingLabel>
            <SettingDescription theme={theme}>
              Chọn ngôn ngữ hiển thị
            </SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Select
              theme={theme}
              value={settings.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
            >
              <option value="vi">🇻🇳 Tiếng Việt</option>
              <option value="en">🇬🇧 English</option>
              <option value="ja">🇯🇵 日本語</option>
              <option value="ko">🇰🇷 한국어</option>
            </Select>
          </SettingControl>
        </SettingItem>

        <SettingItem theme={theme}>
          <SettingInfo>
            <SettingLabel theme={theme}>Múi giờ</SettingLabel>
            <SettingDescription theme={theme}>
              Chọn múi giờ của bạn
            </SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Select
              theme={theme}
              value={settings.timezone}
              onChange={(e) => handleInputChange('timezone', e.target.value)}
            >
              <option value="UTC">UTC (GMT+0)</option>
              <option value="Asia/Ho_Chi_Minh">Ho Chi Minh (GMT+7)</option>
              <option value="Asia/Tokyo">Tokyo (GMT+9)</option>
              <option value="America/New_York">New York (GMT-5)</option>
            </Select>
          </SettingControl>
        </SettingItem>

        <SettingItem theme={theme}>
          <SettingInfo>
            <SettingLabel theme={theme}>Giao diện</SettingLabel>
            <SettingDescription theme={theme}>
              Chọn chế độ hiển thị
            </SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Select
              theme={theme}
              value={settings.theme}
              onChange={(e) => handleInputChange('theme', e.target.value)}
            >
              <option value="light">☀️ Sáng</option>
              <option value="dark">🌙 Tối</option>
              <option value="auto">🔄 Tự động</option>
            </Select>
          </SettingControl>
        </SettingItem>
      </SettingsGrid>

      <ActionButtons>
        <Button theme={theme} variant="primary" onClick={handleSaveSettings}>
          💾 Lưu thay đổi
        </Button>
      </ActionButtons>
    </SettingsSection>
  );

  return (
    <TeacherLayout pageTitle="⚙️ Cài đặt">
      <Toast toast={toast} onClose={hideToast} />
      
      <PageContainer>
        <WelcomeCard theme={theme}>
          <WelcomeContent>
            <WelcomeTitle theme={theme}>
              Cài đặt tài khoản ⚙️
            </WelcomeTitle>
            <WelcomeSubtitle theme={theme}>
              Quản lý thông tin và tùy chọn cá nhân
            </WelcomeSubtitle>
            <DateTime theme={theme}>
              <span>🕐</span>
              {formatDateTime(currentTime)} UTC | 👤 vinhsonvlog
            </DateTime>
          </WelcomeContent>
          <WelcomeIllustration>⚙️</WelcomeIllustration>
        </WelcomeCard>

        <TabsContainer theme={theme}>
          <Tab
            theme={theme}
            active={activeTab === 'profile'}
            onClick={() => setActiveTab('profile')}
          >
            <span>👤</span>
            Hồ sơ
          </Tab>
          <Tab
            theme={theme}
            active={activeTab === 'notifications'}
            onClick={() => setActiveTab('notifications')}
          >
            <span>🔔</span>
            Thông báo
          </Tab>
          <Tab
            theme={theme}
            active={activeTab === 'privacy'}
            onClick={() => setActiveTab('privacy')}
          >
            <span>🔒</span>
            Quyền riêng tư
          </Tab>
          <Tab
            theme={theme}
            active={activeTab === 'preferences'}
            onClick={() => setActiveTab('preferences')}
          >
            <span>⚙️</span>
            Tùy chọn
          </Tab>
        </TabsContainer>

        {activeTab === 'profile' && renderProfileSettings()}
        {activeTab === 'notifications' && renderNotificationSettings()}
        {activeTab === 'privacy' && renderPrivacySettings()}
        {activeTab === 'preferences' && renderPreferencesSettings()}
      </PageContainer>
    </TeacherLayout>
  );
};

export default TeacherSettings;