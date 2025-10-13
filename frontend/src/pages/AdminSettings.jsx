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
    background: #f59e0b;
    border-radius: 3px;
  }
`;

const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  border: none;
  background: ${props => props.active ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'transparent'};
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
      ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' 
      : (props.theme === 'dark' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)')
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
    background: ${props => props.checked ? '#f59e0b' : '#d1d5db'};
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
    background: ${props => props.checked ? '#d97706' : '#9ca3af'};
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
    border-color: #f59e0b;
    box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
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
    border-color: #f59e0b;
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
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        color: white;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
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

const InfoBox = styled.div`
  padding: 1rem 1.5rem;
  border-radius: 12px;
  background: ${props => {
    if (props.variant === 'warning') return 'rgba(245, 158, 11, 0.1)';
    if (props.variant === 'danger') return 'rgba(239, 68, 68, 0.1)';
    return 'rgba(28, 176, 246, 0.1)';
  }};
  border-left: 4px solid ${props => {
    if (props.variant === 'warning') return '#f59e0b';
    if (props.variant === 'danger') return '#ef4444';
    return '#1CB0F6';
  }};
  margin-top: 1.5rem;
`;

const InfoText = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#d1d5db' : '#4b5563'};
  line-height: 1.6;
  margin: 0;
`;

// ========== COMPONENT ==========

const AdminSettings = () => {
  const { toast, showToast, hideToast } = useToast();
  const [theme] = useState('light');
  const [activeTab, setActiveTab] = useState('general');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Settings State
  const [settings, setSettings] = useState({
    siteName: 'EnglishMaster',
    siteUrl: 'https://englishmaster.com',
    maintenanceMode: false,
    allowRegistration: true,
    emailVerification: true,
    twoFactorAuth: false,
    autoBackup: true,
    backupFrequency: 'daily',
    maxFileSize: '10',
    sessionTimeout: '30',
    language: 'vi',
    timezone: 'Asia/Ho_Chi_Minh',
  });

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

  const handleToggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleInputChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleSaveSettings = () => {
    Swal.fire({
      title: 'Xác nhận lưu?',
      text: 'Bạn có chắc muốn lưu các thay đổi?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '💾 Lưu',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        showToast('success', 'Đã lưu!', 'Cài đặt đã được cập nhật thành công');
      }
    });
  };

  const handleResetSettings = () => {
    Swal.fire({
      title: 'Khôi phục mặc định?',
      text: 'Tất cả cài đặt sẽ được khôi phục về giá trị mặc định!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '🔄 Khôi phục',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        showToast('success', 'Đã khôi phục!', 'Cài đặt đã được khôi phục về mặc định');
      }
    });
  };

  const renderGeneralSettings = () => (
    <SettingsSection theme={theme}>
      <SectionTitle theme={theme}>
        <span>⚙️</span>
        Cài đặt chung
      </SectionTitle>
      
      <SettingsGrid>
        <SettingItem theme={theme}>
          <SettingInfo>
            <SettingLabel theme={theme}>Tên website</SettingLabel>
            <SettingDescription theme={theme}>
              Tên hiển thị của website
            </SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Input
              theme={theme}
              value={settings.siteName}
              onChange={(e) => handleInputChange('siteName', e.target.value)}
              placeholder="EnglishMaster"
            />
          </SettingControl>
        </SettingItem>

        <SettingItem theme={theme}>
          <SettingInfo>
            <SettingLabel theme={theme}>URL website</SettingLabel>
            <SettingDescription theme={theme}>
              Địa chỉ URL chính của website
            </SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Input
              theme={theme}
              value={settings.siteUrl}
              onChange={(e) => handleInputChange('siteUrl', e.target.value)}
              placeholder="https://englishmaster.com"
            />
          </SettingControl>
        </SettingItem>

        <SettingItem theme={theme}>
          <SettingInfo>
            <SettingLabel theme={theme}>Ngôn ngữ mặc định</SettingLabel>
            <SettingDescription theme={theme}>
              Ngôn ngữ hiển thị mặc định của hệ thống
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
              Múi giờ sử dụng cho hệ thống
            </SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Select
              theme={theme}
              value={settings.timezone}
              onChange={(e) => handleInputChange('timezone', e.target.value)}
            >
              <option value="UTC">UTC (GMT+0)</option>
              <option value="Asia/Ho_Chi_Minh">Asia/Ho Chi Minh (GMT+7)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
              <option value="America/New_York">America/New York (GMT-5)</option>
            </Select>
          </SettingControl>
        </SettingItem>

        <SettingItem theme={theme}>
          <SettingInfo>
            <SettingLabel theme={theme}>Chế độ bảo trì</SettingLabel>
            <SettingDescription theme={theme}>
              Kích hoạt chế độ bảo trì website
            </SettingDescription>
          </SettingInfo>
          <SettingControl>
            <ToggleSwitch checked={settings.maintenanceMode}>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={() => handleToggle('maintenanceMode')}
              />
              <span />
            </ToggleSwitch>
          </SettingControl>
        </SettingItem>
      </SettingsGrid>

      {settings.maintenanceMode && (
        <InfoBox theme={theme} variant="warning">
          <InfoText theme={theme}>
            ⚠️ <strong>Cảnh báo:</strong> Chế độ bảo trì đang được bật. Chỉ admin mới có thể truy cập website.
          </InfoText>
        </InfoBox>
      )}

      <ActionButtons>
        <Button theme={theme} onClick={handleResetSettings}>
          🔄 Khôi phục mặc định
        </Button>
        <Button theme={theme} variant="primary" onClick={handleSaveSettings}>
          💾 Lưu thay đổi
        </Button>
      </ActionButtons>
    </SettingsSection>
  );

  const renderSecuritySettings = () => (
    <SettingsSection theme={theme}>
      <SectionTitle theme={theme}>
        <span>🔐</span>
        Bảo mật
      </SectionTitle>
      
      <SettingsGrid>
        <SettingItem theme={theme}>
          <SettingInfo>
            <SettingLabel theme={theme}>Cho phép đăng ký</SettingLabel>
            <SettingDescription theme={theme}>
              Cho phép người dùng mới đăng ký tài khoản
            </SettingDescription>
          </SettingInfo>
          <SettingControl>
            <ToggleSwitch checked={settings.allowRegistration}>
              <input
                type="checkbox"
                checked={settings.allowRegistration}
                onChange={() => handleToggle('allowRegistration')}
              />
              <span />
            </ToggleSwitch>
          </SettingControl>
        </SettingItem>

        <SettingItem theme={theme}>
          <SettingInfo>
            <SettingLabel theme={theme}>Xác thực email</SettingLabel>
            <SettingDescription theme={theme}>
              Yêu cầu xác thực email khi đăng ký
            </SettingDescription>
          </SettingInfo>
          <SettingControl>
            <ToggleSwitch checked={settings.emailVerification}>
              <input
                type="checkbox"
                checked={settings.emailVerification}
                onChange={() => handleToggle('emailVerification')}
              />
              <span />
            </ToggleSwitch>
          </SettingControl>
        </SettingItem>

        <SettingItem theme={theme}>
          <SettingInfo>
            <SettingLabel theme={theme}>Xác thực 2 bước (2FA)</SettingLabel>
            <SettingDescription theme={theme}>
              Bắt buộc xác thực 2 bước cho admin
            </SettingDescription>
          </SettingInfo>
          <SettingControl>
            <ToggleSwitch checked={settings.twoFactorAuth}>
              <input
                type="checkbox"
                checked={settings.twoFactorAuth}
                onChange={() => handleToggle('twoFactorAuth')}
              />
              <span />
            </ToggleSwitch>
          </SettingControl>
        </SettingItem>

        <SettingItem theme={theme}>
          <SettingInfo>
            <SettingLabel theme={theme}>Thời gian phiên</SettingLabel>
            <SettingDescription theme={theme}>
              Thời gian tự động đăng xuất (phút)
            </SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Input
              theme={theme}
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => handleInputChange('sessionTimeout', e.target.value)}
              placeholder="30"
            />
          </SettingControl>
        </SettingItem>

        <SettingItem theme={theme}>
          <SettingInfo>
            <SettingLabel theme={theme}>Kích thước file tối đa</SettingLabel>
            <SettingDescription theme={theme}>
              Dung lượng tối đa cho file upload (MB)
            </SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Input
              theme={theme}
              type="number"
              value={settings.maxFileSize}
              onChange={(e) => handleInputChange('maxFileSize', e.target.value)}
              placeholder="10"
            />
          </SettingControl>
        </SettingItem>
      </SettingsGrid>

      <InfoBox theme={theme} variant="info">
        <InfoText theme={theme}>
          💡 <strong>Lưu ý:</strong> Các cài đặt bảo mật sẽ được áp dụng ngay lập tức sau khi lưu.
        </InfoText>
      </InfoBox>

      <ActionButtons>
        <Button theme={theme} onClick={handleResetSettings}>
          🔄 Khôi phục mặc định
        </Button>
        <Button theme={theme} variant="primary" onClick={handleSaveSettings}>
          💾 Lưu thay đổi
        </Button>
      </ActionButtons>
    </SettingsSection>
  );

  const renderBackupSettings = () => (
    <SettingsSection theme={theme}>
      <SectionTitle theme={theme}>
        <span>💾</span>
        Sao lưu & Khôi phục
      </SectionTitle>
      
      <SettingsGrid>
        <SettingItem theme={theme}>
          <SettingInfo>
            <SettingLabel theme={theme}>Tự động sao lưu</SettingLabel>
            <SettingDescription theme={theme}>
              Bật tính năng tự động sao lưu dữ liệu
            </SettingDescription>
          </SettingInfo>
          <SettingControl>
            <ToggleSwitch checked={settings.autoBackup}>
              <input
                type="checkbox"
                checked={settings.autoBackup}
                onChange={() => handleToggle('autoBackup')}
              />
              <span />
            </ToggleSwitch>
          </SettingControl>
        </SettingItem>

        <SettingItem theme={theme}>
          <SettingInfo>
            <SettingLabel theme={theme}>Tần suất sao lưu</SettingLabel>
            <SettingDescription theme={theme}>
              Chu kỳ tự động sao lưu dữ liệu
            </SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Select
              theme={theme}
              value={settings.backupFrequency}
              onChange={(e) => handleInputChange('backupFrequency', e.target.value)}
              disabled={!settings.autoBackup}
            >
              <option value="hourly">Mỗi giờ</option>
              <option value="daily">Hàng ngày</option>
              <option value="weekly">Hàng tuần</option>
              <option value="monthly">Hàng tháng</option>
            </Select>
          </SettingControl>
        </SettingItem>

        <SettingItem theme={theme}>
          <SettingInfo>
            <SettingLabel theme={theme}>Sao lưu thủ công</SettingLabel>
            <SettingDescription theme={theme}>
              Tạo bản sao lưu ngay lập tức
            </SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Button
              theme={theme}
              variant="primary"
              onClick={() => showToast('info', 'Đang xử lý', 'Đang tạo bản sao lưu...')}
            >
              💾 Sao lưu ngay
            </Button>
          </SettingControl>
        </SettingItem>

        <SettingItem theme={theme}>
          <SettingInfo>
            <SettingLabel theme={theme}>Khôi phục dữ liệu</SettingLabel>
            <SettingDescription theme={theme}>
              Khôi phục từ bản sao lưu trước đó
            </SettingDescription>
          </SettingInfo>
          <SettingControl>
            <Button
              theme={theme}
              onClick={() => showToast('info', 'Thông báo', 'Chọn file backup để khôi phục')}
            >
              ♻️ Khôi phục
            </Button>
          </SettingControl>
        </SettingItem>
      </SettingsGrid>

      <InfoBox theme={theme} variant="danger">
        <InfoText theme={theme}>
          🚨 <strong>Cảnh báo:</strong> Khôi phục dữ liệu sẽ ghi đè lên toàn bộ dữ liệu hiện tại. Hãy chắc chắn trước khi thực hiện!
        </InfoText>
      </InfoBox>

      <ActionButtons>
        <Button theme={theme} variant="danger" onClick={() => showToast('warning', 'Cảnh báo', 'Xóa tất cả backup')}>
          🗑️ Xóa tất cả backup
        </Button>
      </ActionButtons>
    </SettingsSection>
  );

  return (
    <AdminLayout pageTitle="⚙️ Cài đặt">
      <Toast toast={toast} onClose={hideToast} />
      
      <PageContainer>
        {/* Welcome Card */}
        <WelcomeCard theme={theme}>
          <WelcomeContent>
            <WelcomeTitle theme={theme}>
              Cài đặt hệ thống ⚙️
            </WelcomeTitle>
            <WelcomeSubtitle theme={theme}>
              Quản lý và cấu hình các tùy chọn hệ thống
            </WelcomeSubtitle>
            <DateTime theme={theme}>
              <span>🕐</span>
              {formatDateTime(currentTime)} UTC | 👤 vinhsonvlog
            </DateTime>
          </WelcomeContent>
          <WelcomeIllustration>⚙️</WelcomeIllustration>
        </WelcomeCard>

        {/* Tabs */}
        <TabsContainer theme={theme}>
          <Tab
            theme={theme}
            active={activeTab === 'general'}
            onClick={() => setActiveTab('general')}
          >
            <span>⚙️</span>
            Chung
          </Tab>
          <Tab
            theme={theme}
            active={activeTab === 'security'}
            onClick={() => setActiveTab('security')}
          >
            <span>🔐</span>
            Bảo mật
          </Tab>
          <Tab
            theme={theme}
            active={activeTab === 'backup'}
            onClick={() => setActiveTab('backup')}
          >
            <span>💾</span>
            Sao lưu
          </Tab>
        </TabsContainer>

        {/* Content */}
        {activeTab === 'general' && renderGeneralSettings()}
        {activeTab === 'security' && renderSecuritySettings()}
        {activeTab === 'backup' && renderBackupSettings()}
      </PageContainer>
    </AdminLayout>
  );
};

export default AdminSettings;