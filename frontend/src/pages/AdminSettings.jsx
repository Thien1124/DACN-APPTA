import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  Settings,
  Palette,
  Notifications,
  Security,
  Language,
  Storage,
  CloudUpload,
  Save
} from '@mui/icons-material';
import AdminLayout from '../layouts/AdminLayout';

const PageHeader = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Card = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid ${props => props.theme === 'dark'
    ? 'rgba(75, 85, 99, 0.3)'
    : 'rgba(229, 231, 235, 0.5)'
  };
  margin-bottom: 2rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SettingGroup = styled.div`
  margin-bottom: 2rem;
`;

const Setting = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 0;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};

  &:last-child {
    border-bottom: none;
  }
`;

const SettingLabel = styled.div`
  font-weight: 500;
`;

const SaveButton = styled.button`
  background: #58CC02;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(88, 204, 2, 0.3);
  }
`;

const AdminSettings = () => {
  const [theme, setTheme] = useState('light');
  
  return (
    <AdminLayout pageTitle="Cài đặt">
      <PageHeader>
        <Title theme={theme}>
          <Settings /> Cài đặt hệ thống
        </Title>
      </PageHeader>

      <Card theme={theme}>
        <SettingGroup>
          <SectionTitle theme={theme}>
            <Palette /> Giao diện
          </SectionTitle>
          <Setting theme={theme}>
            <SettingLabel>Giao diện tối</SettingLabel>
            <input type="checkbox" />
          </Setting>
        </SettingGroup>

        <SettingGroup>
          <SectionTitle theme={theme}>
            <Notifications /> Thông báo
          </SectionTitle>
          <Setting theme={theme}>
            <SettingLabel>Email thông báo</SettingLabel>
            <input type="checkbox" />
          </Setting>
        </SettingGroup>

        <SettingGroup>
          <SectionTitle theme={theme}>
            <Security /> Bảo mật
          </SectionTitle>
          <Setting theme={theme}>
            <SettingLabel>Xác thực 2 yếu tố</SettingLabel>
            <input type="checkbox" />
          </Setting>
        </SettingGroup>

        <SettingGroup>
          <SectionTitle theme={theme}>
            <Language /> Ngôn ngữ
          </SectionTitle>
          <Setting theme={theme}>
            <SettingLabel>Ngôn ngữ hệ thống</SettingLabel>
            <select>
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </Setting>
        </SettingGroup>

        <SettingGroup>
          <SectionTitle theme={theme}>
            <Storage /> Sao lưu & Khôi phục
          </SectionTitle>
          <Setting theme={theme}>
            <SettingLabel>Tự động sao lưu</SettingLabel>
            <input type="checkbox" />
          </Setting>
          <Setting theme={theme}>
            <SettingLabel>Tải lên bản sao lưu</SettingLabel>
            <button>
              <CloudUpload /> Tải lên
            </button>
          </Setting>
        </SettingGroup>

        <SaveButton>
          <Save /> Lưu thay đổi
        </SaveButton>
      </Card>
    </AdminLayout>
  );
};

export default AdminSettings;