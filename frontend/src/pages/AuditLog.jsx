import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
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
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  span:first-child {
    font-size: 3rem;
  }

  @media (max-width: 768px) {
    font-size: 2rem;
    
    span:first-child {
      font-size: 2.5rem;
    }
  }
`;

const PageSubtitle = styled.p`
  font-size: 1.125rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  margin-bottom: 2rem;
`;

const UserInfo = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

const UserInfoLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UserAvatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  flex-shrink: 0;
`;

const UserDetails = styled.div``;

const UserName = styled.div`
  font-size: 1.25rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
`;

const UserEmail = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

const UserInfoRight = styled.div`
  display: flex;
  gap: 2rem;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-around;
  }
`;

const InfoItem = styled.div`
  text-align: center;
`;

const InfoValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.color || (props.theme === 'dark' ? '#f9fafb' : '#1a1a1a')};
`;

const InfoLabel = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  margin-top: 0.25rem;
`;

const FilterSection = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FilterLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#e5e7eb' : '#374151'};
`;

const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 2px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #58CC02;
    box-shadow: 0 0 0 3px rgba(88, 204, 2, 0.1);
  }
`;

const FilterInput = styled.input`
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 2px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #58CC02;
    box-shadow: 0 0 0 3px rgba(88, 204, 2, 0.1);
  }
`;

const TimelineSection = styled.div`
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

const Timeline = styled.div`
  position: relative;
  padding-left: 3rem;

  &::before {
    content: '';
    position: absolute;
    left: 1rem;
    top: 0;
    bottom: 0;
    width: 2px;
    background: ${props => props.theme === 'dark' 
      ? 'linear-gradient(180deg, #58CC02 0%, #374151 100%)'
      : 'linear-gradient(180deg, #58CC02 0%, #e5e7eb 100%)'
    };
  }

  @media (max-width: 768px) {
    padding-left: 2rem;

    &::before {
      left: 0.5rem;
    }
  }
`;

const TimelineItem = styled.div`
  position: relative;
  margin-bottom: 2rem;
  animation: slideIn 0.5s ease;
  animation-delay: ${props => props.delay || '0s'};
  animation-fill-mode: both;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;

const TimelineIcon = styled.div`
  position: absolute;
  left: -2.5rem;
  top: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.color || '#58CC02'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  box-shadow: 0 4px 12px ${props => props.color || '#58CC02'}66;
  border: 3px solid ${props => props.theme === 'dark' ? '#1a1a1a' : '#f8fafc'};

  @media (max-width: 768px) {
    left: -1.75rem;
    width: 35px;
    height: 35px;
    font-size: 1rem;
  }
`;

const TimelineCard = styled.div`
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#f9fafb'};
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateX(5px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
`;

const TimelineHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const TimelineTitle = styled.div`
  font-weight: bold;
  font-size: 1.125rem;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  flex: 1;
`;

const TimelineTime = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  white-space: nowrap;
`;

const TimelineDescription = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#d1d5db' : '#6b7280'};
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const TimelineDetails = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const DetailBadge = styled.span`
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => props.color || 'rgba(88, 204, 2, 0.1)'};
  color: ${props => props.textColor || '#58CC02'};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
`;

const EmptyIcon = styled.div`
  font-size: 5rem;
  margin-bottom: 1rem;
  opacity: 0.5;
`;

const EmptyText = styled.div`
  font-size: 1.25rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-weight: 600;
`;

const LoadMoreButton = styled.button`
  width: 100%;
  padding: 1rem;
  margin-top: 2rem;
  border-radius: 12px;
  background: ${props => props.theme === 'dark' ? '#374151' : '#f3f4f6'};
  color: ${props => props.theme === 'dark' ? '#e5e7eb' : '#374151'};
  border: 2px solid ${props => props.theme === 'dark' ? '#4B5563' : '#e5e7eb'};
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.theme === 'dark' ? '#4B5563' : '#e5e7eb'};
    transform: translateY(-2px);
  }
`;

// ========== MOCK DATA ==========

const mockAuditLogs = [
  {
    id: 1,
    action: 'Đăng nhập',
    category: 'authentication',
    description: 'Đăng nhập thành công từ thiết bị Chrome on Windows',
    timestamp: '2025-10-08 14:03:22',
    ip: '192.168.1.100',
    device: 'Chrome on Windows',
    icon: '🔐',
    color: '#58CC02',
  },
  {
    id: 2,
    action: 'Cập nhật hồ sơ',
    category: 'profile',
    description: 'Cập nhật thông tin cá nhân: Thêm trường học và mục tiêu TOEIC 650',
    timestamp: '2025-10-08 13:45:10',
    details: 'Trường: HCMUS, Mục tiêu: TOEIC 650',
    icon: '👤',
    color: '#1CB0F6',
  },
  {
    id: 3,
    action: 'Hoàn thành bài học',
    category: 'learning',
    description: 'Hoàn thành Unit 3: Numbers với điểm 85/100',
    timestamp: '2025-10-08 12:30:45',
    score: 85,
    xp: '+50 XP',
    icon: '📚',
    color: '#8b5cf6',
  },
  {
    id: 4,
    action: 'Tạo flashcard deck',
    category: 'flashcard',
    description: 'Tạo bộ thẻ mới "TOEIC Vocabulary Part 5" với 50 thẻ',
    timestamp: '2025-10-08 11:15:30',
    cards: 50,
    icon: '🗂️',
    color: '#f59e0b',
  },
  {
    id: 5,
    action: 'Luyện tập',
    category: 'practice',
    description: 'Hoàn thành 30 phút luyện tập Listening Part 3',
    timestamp: '2025-10-08 10:00:00',
    duration: '30 phút',
    icon: '🎧',
    color: '#10b981',
  },
  {
    id: 6,
    action: 'Đạt streak',
    category: 'achievement',
    description: 'Đạt 7 ngày học liên tiếp và nhận huy hiệu 🔥',
    timestamp: '2025-10-08 09:00:00',
    streak: 7,
    badge: '🔥',
    icon: '🏆',
    color: '#FF9600',
  },
  {
    id: 7,
    action: 'Thi thử TOEIC',
    category: 'exam',
    description: 'Hoàn thành đề thi thử TOEIC L&R Full Test #5',
    timestamp: '2025-10-07 16:30:00',
    score: 620,
    time: '120 phút',
    icon: '📝',
    color: '#ef4444',
  },
  {
    id: 8,
    action: 'Bật 2FA',
    category: 'security',
    description: 'Kích hoạt xác thực hai yếu tố (2FA) qua email',
    timestamp: '2025-10-07 15:00:00',
    method: 'Email',
    icon: '🔒',
    color: '#6b7280',
  },
];

// ========== COMPONENT ==========

const AuditLog = () => {
  const { toast, showToast, hideToast } = useToast();
  const [theme, setTheme] = useState('light');
  const [logs] = useState(mockAuditLogs);
  const [displayedLogs, setDisplayedLogs] = useState([]);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsToShow, setItemsToShow] = useState(10);

  const user = {
    name: 'Vinh Son',
    email: 'vinhson@example.com',
    loginCount: 156,
    lastLogin: '2025-10-08 14:03:22',
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Filter logs
  useEffect(() => {
    let filtered = logs;

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(log => log.category === filterCategory);
    }

    // Filter by date
    if (filterDate) {
      filtered = filtered.filter(log => log.timestamp.startsWith(filterDate));
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setDisplayedLogs(filtered.slice(0, itemsToShow));
  }, [filterCategory, filterDate, searchTerm, logs, itemsToShow]);

  const handleLoadMore = () => {
    setItemsToShow(prev => prev + 10);
  };

  const handleLogClick = (log) => {
    showToast('info', 'Chi tiết hoạt động', log.description);
  };

  const getCategoryColor = (category) => {
    const colors = {
      authentication: '#58CC02',
      profile: '#1CB0F6',
      learning: '#8b5cf6',
      flashcard: '#f59e0b',
      practice: '#10b981',
      achievement: '#FF9600',
      exam: '#ef4444',
      security: '#6b7280',
    };
    return colors[category] || '#58CC02';
  };

  return (
    <PageWrapper theme={theme}>
      <Toast toast={toast} onClose={hideToast} />

      <Header
        theme={theme}
        onThemeToggle={toggleTheme}
        userName="vinhsonvlog"
        userEmail="vinhsonvlog@example.com"
        notificationCount={3}
        showNotification={true}
        showAvatar={true}
      />


      <DashboardContainer>
        {/* Page Header */}
        <PageTitle theme={theme}>
          <span>📋</span>
          Lịch sử hoạt động
        </PageTitle>
        <PageSubtitle theme={theme}>
          Theo dõi toàn bộ hoạt động của bạn trên hệ thống
        </PageSubtitle>

        {/* User Info */}
        <UserInfo theme={theme}>
          <UserInfoLeft>
            <UserAvatar>👤</UserAvatar>
            <UserDetails>
              <UserName theme={theme}>{user.name}</UserName>
              <UserEmail theme={theme}>{user.email}</UserEmail>
            </UserDetails>
          </UserInfoLeft>
          <UserInfoRight>
            <InfoItem>
              <InfoValue theme={theme} color="#58CC02">{user.loginCount}</InfoValue>
              <InfoLabel theme={theme}>Lần đăng nhập</InfoLabel>
            </InfoItem>
            <InfoItem>
              <InfoValue theme={theme} color="#1CB0F6">{logs.length}</InfoValue>
              <InfoLabel theme={theme}>Hoạt động</InfoLabel>
            </InfoItem>
          </UserInfoRight>
        </UserInfo>

        {/* Filters */}
        <FilterSection theme={theme}>
          <FilterGrid>
            <FilterGroup>
              <FilterLabel theme={theme}>Loại hoạt động</FilterLabel>
              <FilterSelect
                theme={theme}
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="authentication">🔐 Xác thực</option>
                <option value="profile">👤 Hồ sơ</option>
                <option value="learning">📚 Học tập</option>
                <option value="flashcard">🗂️ Flashcard</option>
                <option value="practice">🎧 Luyện tập</option>
                <option value="achievement">🏆 Thành tích</option>
                <option value="exam">📝 Thi cử</option>
                <option value="security">🔒 Bảo mật</option>
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel theme={theme}>Ngày</FilterLabel>
              <FilterInput
                theme={theme}
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel theme={theme}>Tìm kiếm</FilterLabel>
              <FilterInput
                theme={theme}
                type="text"
                placeholder="Tìm kiếm hoạt động..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </FilterGroup>
          </FilterGrid>
        </FilterSection>

        {/* Timeline */}
        <TimelineSection theme={theme}>
          {displayedLogs.length > 0 ? (
            <>
              <Timeline theme={theme}>
                {displayedLogs.map((log, index) => (
                  <TimelineItem key={log.id} delay={`${index * 0.05}s`}>
                    <TimelineIcon 
                      theme={theme}
                      color={getCategoryColor(log.category)}
                    >
                      {log.icon}
                    </TimelineIcon>
                    <TimelineCard 
                      theme={theme}
                      onClick={() => handleLogClick(log)}
                    >
                      <TimelineHeader theme={theme}>
                        <TimelineTitle theme={theme}>
                          {log.action}
                        </TimelineTitle>
                        <TimelineTime theme={theme}>
                          {log.timestamp}
                        </TimelineTime>
                      </TimelineHeader>
                      <TimelineDescription theme={theme}>
                        {log.description}
                      </TimelineDescription>
                      <TimelineDetails>
                        {log.ip && (
                          <DetailBadge 
                            color="rgba(107, 114, 128, 0.1)"
                            textColor="#6b7280"
                          >
                            IP: {log.ip}
                          </DetailBadge>
                        )}
                        {log.device && (
                          <DetailBadge 
                            color="rgba(28, 176, 246, 0.1)"
                            textColor="#1CB0F6"
                          >
                            {log.device}
                          </DetailBadge>
                        )}
                        {log.score && (
                          <DetailBadge 
                            color="rgba(88, 204, 2, 0.1)"
                            textColor="#58CC02"
                          >
                            Điểm: {log.score}
                          </DetailBadge>
                        )}
                        {log.xp && (
                          <DetailBadge 
                            color="rgba(139, 92, 246, 0.1)"
                            textColor="#8b5cf6"
                          >
                            {log.xp}
                          </DetailBadge>
                        )}
                        {log.cards && (
                          <DetailBadge 
                            color="rgba(245, 158, 11, 0.1)"
                            textColor="#f59e0b"
                          >
                            {log.cards} thẻ
                          </DetailBadge>
                        )}
                        {log.duration && (
                          <DetailBadge 
                            color="rgba(16, 185, 129, 0.1)"
                            textColor="#10b981"
                          >
                            {log.duration}
                          </DetailBadge>
                        )}
                        {log.streak && (
                          <DetailBadge 
                            color="rgba(255, 150, 0, 0.1)"
                            textColor="#FF9600"
                          >
                            {log.streak} ngày {log.badge}
                          </DetailBadge>
                        )}
                        {log.time && (
                          <DetailBadge 
                            color="rgba(239, 68, 68, 0.1)"
                            textColor="#ef4444"
                          >
                            {log.time}
                          </DetailBadge>
                        )}
                      </TimelineDetails>
                    </TimelineCard>
                  </TimelineItem>
                ))}
              </Timeline>

              {displayedLogs.length < logs.filter(log => {
                let filtered = true;
                if (filterCategory !== 'all') filtered = log.category === filterCategory;
                if (filterDate) filtered = filtered && log.timestamp.startsWith(filterDate);
                if (searchTerm) filtered = filtered && (log.action.toLowerCase().includes(searchTerm.toLowerCase()) || log.description.toLowerCase().includes(searchTerm.toLowerCase()));
                return filtered;
              }).length && (
                <LoadMoreButton theme={theme} onClick={handleLoadMore}>
                  Tải thêm hoạt động
                </LoadMoreButton>
              )}
            </>
          ) : (
            <EmptyState>
              <EmptyIcon>📭</EmptyIcon>
              <EmptyText theme={theme}>
                Không tìm thấy hoạt động nào
              </EmptyText>
            </EmptyState>
          )}
        </TimelineSection>
      </DashboardContainer>
    </PageWrapper>
  );
};

export default AuditLog;