import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  History,
  AccessTime, 
  Event,
  Download,
  FilterList
} from '@mui/icons-material';
import LeftSidebar from '../components/LeftSidebar';
import { auditService } from '../services/auditService';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';

const PageWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${props => props.theme === 'dark' 
    ? 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2d2d2d 100%)'
    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e0 100%)'
  };
`;

const MainContent = styled.div`
  flex: 1;
  margin-left: 280px;
  padding: 2rem;
  min-width: 0;
`;

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
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const FilterButton = styled.button`
  background: ${props => props.theme === 'dark' ? '#374151' : '#f3f4f6'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1f2937'};
  border: none;
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    background: ${props => props.theme === 'dark' ? '#4B5563' : '#e5e7eb'};
  }
`;

const ExportButton = styled(FilterButton)`
  background: #58CC02;
  color: white;

  &:hover {
    background: #45a302;
    box-shadow: 0 8px 16px rgba(88, 204, 2, 0.3);
  }
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

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
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

const ActivityBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    switch (props.type) {
      case 'lesson': return '#1CB0F6';
      case 'exercise': return '#58CC02';
      case 'achievement': return '#f59e0b';
      default: return '#6b7280';
    }
  }};
  color: white;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  background: ${props => props.disabled ? '#e5e7eb' : '#58CC02'};
  color: ${props => props.disabled ? '#6b7280' : 'white'};
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};

  &:hover {
    background: ${props => props.disabled ? '#e5e7eb' : '#45a302'};
  }
`;

// Mock data
const mockActivities = [
  {
    id: 1,
    type: 'lesson',
    action: 'Hoàn thành bài học "Chào hỏi cơ bản"',
    timestamp: '2023-10-25 14:30:00'
  },
  {
    id: 2,
    type: 'exercise', 
    action: 'Đạt 100% bài tập "Từ vựng gia đình"',
    timestamp: '2023-10-25 15:15:00'
  },
  {
    id: 3,
    type: 'achievement',
    action: 'Đạt thành tích "Siêu sao 7 ngày"',
    timestamp: '2023-10-25 16:00:00'
  }
];

const AuditLog = () => {
  const [theme] = useState('light');
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({
    action: '',
    status: '',
    startDate: '',
    endDate: ''
  });
  const [filter, setFilter] = useState({
    days: 7
  });
  const { toast, showToast, hideToast } = useToast();
  
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await auditService.getLogs({
        page: pagination.page,
        limit: pagination.limit,
        days: filter.days,
        ...filters
      });

      if (response.success) {
        setActivities(response.data.logs);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      showToast('error', 'Lỗi', 'Không thể tải lịch sử hoạt động');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [pagination.page, filters, filter.days]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
    setPagination(prev => ({
      ...prev,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handleExport = async () => {
    try {
      const response = await auditService.getAuditLogs({ 
        days: filter.days,
        export: true 
      });
      
      // Create and download file
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-log-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showToast('success', 'Thành công', 'Đã xuất lịch sử hoạt động');
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      showToast('error', 'Lỗi', 'Không thể xuất lịch sử hoạt động');
    }
  };

  return (
    <PageWrapper theme={theme}>
      <Toast toast={toast} onClose={hideToast} />
      <LeftSidebar />
      <MainContent>
        <PageHeader>
          <Title theme={theme}>
            <History /> Lịch sử hoạt động
          </Title>
        </PageHeader>

        <ActionBar>
          <FilterButton theme={theme} onClick={() => setFilter({ ...filter, days: filter.days === 7 ? 30 : 7 })}>
            <FilterList /> {filter.days} ngày gần nhất
          </FilterButton>
          <ExportButton onClick={handleExport}>
            <Download /> Xuất lịch sử
          </ExportButton>
        </ActionBar>

        <Card theme={theme}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>Đang tải...</div>
          ) : activities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              Chưa có hoạt động nào
            </div>
          ) : (
            <>
              <Table>
                <thead>
                  <tr>
                    <Th theme={theme}>Hoạt động</Th>
                    <Th theme={theme}>Trạng thái</Th>
                    <Th theme={theme}>Thời gian</Th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map(activity => (
                    <tr key={activity._id}>
                      <Td theme={theme}>{activity.action}</Td>
                      <Td theme={theme}>
                        <ActivityBadge type={activity.status}>
                          {activity.status}
                        </ActivityBadge>
                      </Td>
                      <Td theme={theme}>
                        {new Date(activity.createdAt).toLocaleString('vi-VN')}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* Pagination */}
              <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                {Array.from({ length: pagination.pages }, (_, i) => (
                  <Button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    disabled={pagination.page === i + 1}
                    style={{ margin: '0 0.25rem' }}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
            </>
          )}
        </Card>
      </MainContent>
    </PageWrapper>
  );
};

export default AuditLog;