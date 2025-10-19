import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import LeftSidebar from '../components/LeftSidebar';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import api from '../utils/api';

const NotificationsSettings = () => {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [notifications, setNotifications] = useState({
    productUpdates: true,
    newFollower: true,
    friendActivity: true,
    weeklyProgress: true,
    specialOffers: true,
    researchOpportunities: true,
    dailyReminder: true,
    reminderTime: '17:00'
  });

  // Fetch notification settings from backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/users/notification-settings');
        if (response.data.success) {
          setNotifications(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching notification settings:', error);
      }
    };

    fetchSettings();
  }, []);

  const handleToggle = async (key) => {
    const newValue = !notifications[key];
    
    setNotifications(prev => ({
      ...prev,
      [key]: newValue
    }));

    try {
      setLoading(true);
      await api.put('/users/notification-settings', {
        [key]: newValue
      });
      showToast('success', 'Đã lưu!', 'Cài đặt thông báo đã được cập nhật');
    } catch (error) {
      // Rollback on error
      setNotifications(prev => ({
        ...prev,
        [key]: !newValue
      }));
      showToast('error', 'Lỗi!', error.message || 'Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeChange = async (value) => {
    setNotifications(prev => ({
      ...prev,
      reminderTime: value
    }));

    try {
      setLoading(true);
      await api.put('/users/notification-settings', {
        reminderTime: value
      });
      showToast('success', 'Đã lưu!', `Thời gian nhắc nhở: ${value}`);
    } catch (error) {
      showToast('error', 'Lỗi!', error.message || 'Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <Toast toast={toast} onClose={hideToast} />
      
      <ContentWrapper>
        <LeftArea>
          <LeftSidebar active="settings" />
        </LeftArea>

        <RightArea>
          <Container>
            <HeaderSection>
              <BackButton onClick={() => navigate('/settings')}>
                ← Quay lại
              </BackButton>
              <Title>Thông báo</Title>
              <Subtitle>Quản lý cách bạn nhận thông báo từ chúng tôi</Subtitle>
            </HeaderSection>

            <Section>
              <SectionTitle>Tổng quan</SectionTitle>
              <SectionSubtitle>Email</SectionSubtitle>
              
              <SettingItem>
                <SettingLabel>Cập nhật sản phẩm + mẹo học tập</SettingLabel>
                <Toggle>
                  <ToggleInput
                    type="checkbox"
                    checked={notifications.productUpdates}
                    onChange={() => handleToggle('productUpdates')}
                    disabled={loading}
                  />
                  <ToggleSlider checked={notifications.productUpdates} />
                </Toggle>
              </SettingItem>

              <SettingItem>
                <SettingLabel>Người theo dõi mới</SettingLabel>
                <Toggle>
                  <ToggleInput
                    type="checkbox"
                    checked={notifications.newFollower}
                    onChange={() => handleToggle('newFollower')}
                    disabled={loading}
                  />
                  <ToggleSlider checked={notifications.newFollower} />
                </Toggle>
              </SettingItem>

              <SettingItem>
                <SettingLabel>Hoạt động của bạn bè</SettingLabel>
                <Toggle>
                  <ToggleInput
                    type="checkbox"
                    checked={notifications.friendActivity}
                    onChange={() => handleToggle('friendActivity')}
                    disabled={loading}
                  />
                  <ToggleSlider checked={notifications.friendActivity} />
                </Toggle>
              </SettingItem>

              <SettingItem>
                <SettingLabel>Tiến độ theo tuần</SettingLabel>
                <Toggle>
                  <ToggleInput
                    type="checkbox"
                    checked={notifications.weeklyProgress}
                    onChange={() => handleToggle('weeklyProgress')}
                    disabled={loading}
                  />
                  <ToggleSlider checked={notifications.weeklyProgress} />
                </Toggle>
              </SettingItem>

              <SettingItem>
                <SettingLabel>Khuyến mãi đặc biệt</SettingLabel>
                <Toggle>
                  <ToggleInput
                    type="checkbox"
                    checked={notifications.specialOffers}
                    onChange={() => handleToggle('specialOffers')}
                    disabled={loading}
                  />
                  <ToggleSlider checked={notifications.specialOffers} />
                </Toggle>
              </SettingItem>

              <SettingItem>
                <SettingLabel>Cơ hội tham gia nghiên cứu</SettingLabel>
                <Toggle>
                  <ToggleInput
                    type="checkbox"
                    checked={notifications.researchOpportunities}
                    onChange={() => handleToggle('researchOpportunities')}
                    disabled={loading}
                  />
                  <ToggleSlider checked={notifications.researchOpportunities} />
                </Toggle>
              </SettingItem>
            </Section>

            <Section>
              <SectionTitle>Thông báo nhắc hàng ngày</SectionTitle>
              <SectionSubtitle>Email</SectionSubtitle>
              
              <SettingItem>
                <SettingLabel>Nhắc nhở luyện tập</SettingLabel>
                <Toggle>
                  <ToggleInput
                    type="checkbox"
                    checked={notifications.dailyReminder}
                    onChange={() => handleToggle('dailyReminder')}
                    disabled={loading}
                  />
                  <ToggleSlider checked={notifications.dailyReminder} />
                </Toggle>
              </SettingItem>

              <SettingItem>
                <SettingLabel>Thời gian nhắc nhở</SettingLabel>
                <Select
                  value={notifications.reminderTime}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  disabled={!notifications.dailyReminder || loading}
                >
                  <option value="07:00">07:00</option>
                  <option value="09:00">09:00</option>
                  <option value="12:00">12:00</option>
                  <option value="17:00">17:00</option>
                  <option value="19:00">19:00</option>
                  <option value="21:00">21:00</option>
                </Select>
              </SettingItem>
            </Section>
          </Container>
        </RightArea>
      </ContentWrapper>
    </PageWrapper>
  );
};

export default NotificationsSettings;

/* Styled Components */
const PageWrapper = styled.div`
  min-height: 100vh;
  background: #f8fafc;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex: 1;
`;

const LeftArea = styled.aside`
  width: 280px;
  border-right: 1px solid #eef2f6;
  background: #fff;
  
  @media (max-width: 968px) {
    display: none;
  }
`;

const RightArea = styled.main`
  flex: 1;
  padding: 2.5rem;
  display: flex;
  justify-content: center;
  overflow-y: auto;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const Container = styled.div`
  width: 100%;
  max-width: 900px;
`;

const HeaderSection = styled.div`
  margin-bottom: 2rem;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #1CB0F6;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.5rem 0;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    color: #0d9ed8;
    transform: translateX(-4px);
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #6b7280;
`;

const Section = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(229, 231, 235, 0.5);
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const SectionSubtitle = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1.5rem;
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 0;
  border-bottom: 1px solid rgba(229, 231, 235, 0.5);

  &:last-child {
    border-bottom: none;
  }
`;

const SettingLabel = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
`;

const Toggle = styled.div`
  position: relative;
  width: 50px;
  height: 28px;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:disabled + span {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => props.checked ? '#1CB0F6' : '#ccc'};
  transition: 0.4s;
  border-radius: 34px;

  &:before {
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
    transform: ${props => props.checked ? 'translateX(22px)' : 'translateX(0)'};
  }
`;

const Select = styled.select`
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  background: #ffffff;
  color: #374151;
  font-size: 1rem;
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;

  &:focus {
    border-color: #1CB0F6;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;