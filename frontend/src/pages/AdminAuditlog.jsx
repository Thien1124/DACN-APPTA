import React, { useState } from 'react';
import styled from 'styled-components';
import {
  History,
  Person,
  Event,
  AccessTime,
  Download
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

const ActionBar = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
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
`;

const ExportButton = styled.button`
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

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${props => props.theme === 'dark'
    ? 'rgba(31, 41, 55, 0.8)'
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(10px);
  border-radius: 16px;
  overflow: hidden;
`;

const Th = styled.th`
  text-align: left;
  padding: 1rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-weight: 600;
  font-size: 0.875rem;
  border-bottom: 2px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  white-space: nowrap;
  
  svg {
    vertical-align: middle;
    margin-right: 0.5rem;
  }
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
`;

const mockLogs = [
  {
    id: 1,
    user: 'Admin',
    action: 'Tạo khóa học mới',
    timestamp: '2023-10-25 14:30:00'
  },
  {
    id: 2, 
    user: 'Admin',
    action: 'Cập nhật bài học',
    timestamp: '2023-10-25 15:15:00'
  },
  {
    id: 3,
    user: 'Admin', 
    action: 'Xóa bài tập',
    timestamp: '2023-10-25 16:00:00'
  }
];

const AdminAuditlog = () => {
  const [theme, setTheme] = useState('light');
  
  return (
    <AdminLayout pageTitle="Nhật ký">
      <PageHeader>
        <Title theme={theme}>
          <History /> Nhật ký hệ thống
        </Title>
      </PageHeader>

      <ActionBar>
        <ExportButton>
          <Download /> Xuất nhật ký
        </ExportButton>
      </ActionBar>

      <Table>
        <thead>
          <tr>
            <Th theme={theme}>
              <Person /> Người dùng
            </Th>
            <Th theme={theme}>
              <Event /> Hành động
            </Th>
            <Th theme={theme}>
              <AccessTime /> Thời gian
            </Th>
          </tr>
        </thead>
        <tbody>
          {mockLogs.map(log => (
            <tr key={log.id}>
              <Td theme={theme}>{log.user}</Td>
              <Td theme={theme}>{log.action}</Td>
              <Td theme={theme}>{log.timestamp}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </AdminLayout>
  );
};

export default AdminAuditlog;