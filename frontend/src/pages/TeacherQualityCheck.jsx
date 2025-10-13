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
`;

const WelcomeIllustration = styled.div`
  font-size: 5rem;
  z-index: 1;
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

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  }
`;

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: ${props => props.color || '#8b5cf6'}22;
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

const ControlBar = styled.div`
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

const FilterButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 10px;
  border: 2px solid ${props => {
    if (props.active) return '#8b5cf6';
    return props.theme === 'dark' ? '#374151' : '#e5e7eb';
  }};
  background: ${props => {
    if (props.active) return 'rgba(139, 92, 246, 0.1)';
    return 'transparent';
  }};
  color: ${props => {
    if (props.active) return '#8b5cf6';
    return props.theme === 'dark' ? '#9ca3af' : '#6b7280';
  }};
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #8b5cf6;
  }
`;

const ActionButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  }
`;

const IssuesList = styled.div`
  display: grid;
  gap: 1.5rem;
`;

const IssueCard = styled.div`
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

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
`;

const IssueHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const IssueInfo = styled.div`
  flex: 1;
`;

const IssueTitle = styled.div`
  font-size: 1.125rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const IssueMeta = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  flex-wrap: wrap;
`;

const SeverityBadge = styled.span`
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: bold;
  background: ${props => {
    if (props.severity === 'critical') return 'rgba(239, 68, 68, 0.2)';
    if (props.severity === 'high') return 'rgba(245, 158, 11, 0.2)';
    if (props.severity === 'medium') return 'rgba(59, 130, 246, 0.2)';
    return 'rgba(156, 163, 175, 0.2)';
  }};
  color: ${props => {
    if (props.severity === 'critical') return '#ef4444';
    if (props.severity === 'high') return '#f59e0b';
    if (props.severity === 'medium') return '#3b82f6';
    return '#6b7280';
  }};
  text-transform: uppercase;
`;

const IssueDescription = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#d1d5db' : '#4b5563'};
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const IssueDetails = styled.div`
  padding: 1rem;
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#f9fafb'};
  border-radius: 12px;
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  line-height: 1.6;
  font-family: 'Courier New', monospace;
  margin-bottom: 1rem;
`;

const IssueActions = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const IssueButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;

  ${props => {
    if (props.variant === 'fix') {
      return `
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
        &:hover { background: rgba(16, 185, 129, 0.2); }
      `;
    }
    if (props.variant === 'ignore') {
      return `
        background: rgba(156, 163, 175, 0.1);
        color: #6b7280;
        &:hover { background: rgba(156, 163, 175, 0.2); }
      `;
    }
    if (props.variant === 'view') {
      return `
        background: rgba(139, 92, 246, 0.1);
        color: #8b5cf6;
        &:hover { background: rgba(139, 92, 246, 0.2); }
      `;
    }
    return '';
  }}
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  border-radius: 20px;
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

// ========== MOCK DATA ==========

const mockIssues = [
  {
    id: 1,
    icon: '❌',
    title: 'Lỗi chính tả trong flashcard',
    severity: 'high',
    type: 'spelling',
    content: 'Deck: TOEIC Vocabulary | Card: "accomodate"',
    description: 'Từ "accomodate" sai chính tả, đúng phải là "accommodate" (2 chữ c, 2 chữ m)',
    location: 'Deck: TOEIC Vocabulary 500 > Card #234',
    createdAt: '2025-10-13 10:30:00',
  },
  {
    id: 2,
    icon: '⚠️',
    title: 'Ngữ pháp không chính xác',
    severity: 'critical',
    type: 'grammar',
    content: 'Quiz: Grammar Test #5 | Question #12',
    description: 'Câu trả lời đúng bị đánh dấu sai. "He don\'t like" -> "He doesn\'t like"',
    location: 'Quiz Bank > Grammar Test #5 > Question 12',
    createdAt: '2025-10-13 09:15:00',
  },
  {
    id: 3,
    icon: '🔤',
    title: 'Phiên âm thiếu',
    severity: 'medium',
    type: 'phonetic',
    content: 'Wordbank: 15 từ chưa có phiên âm',
    description: 'Có 15 từ vựng trong wordbank chưa có thông tin phiên âm IPA',
    location: 'Wordbank > Business English section',
    createdAt: '2025-10-13 08:00:00',
  },
  {
    id: 4,
    icon: '🖼️',
    title: 'Hình ảnh bị lỗi',
    severity: 'medium',
    type: 'media',
    content: 'Lesson: Present Perfect | Image không load',
    description: 'Hình minh họa trong bài học không hiển thị được (404 error)',
    location: 'Lessons > Grammar Basics > Present Perfect',
    createdAt: '2025-10-12 16:45:00',
  },
];

// ========== COMPONENT ==========

const TeacherQualityCheck = () => {
  const { toast, showToast, hideToast } = useToast();
  const [theme] = useState('light');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [issues, setIssues] = useState(mockIssues);
  const [filter, setFilter] = useState('all');

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

  const stats = {
    total: issues.length,
    critical: issues.filter(i => i.severity === 'critical').length,
    high: issues.filter(i => i.severity === 'high').length,
    medium: issues.filter(i => i.severity === 'medium').length,
  };

  const filteredIssues = issues.filter(issue => {
    if (filter === 'all') return true;
    if (filter === 'critical') return issue.severity === 'critical';
    if (filter === 'high') return issue.severity === 'high';
    if (filter === 'medium') return issue.severity === 'medium';
    return true;
  });

  const handleRunCheck = () => {
    showToast('info', 'Đang kiểm tra', 'Đang quét toàn bộ nội dung...');
    setTimeout(() => {
      showToast('success', 'Hoàn thành!', 'Đã tìm thấy 4 vấn đề cần xem xét');
    }, 2000);
  };

  const handleFixIssue = (issue) => {
    Swal.fire({
      title: 'Tự động sửa?',
      text: `Sửa lỗi: ${issue.title}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '✅ Sửa ngay',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        setIssues(issues.filter(i => i.id !== issue.id));
        showToast('success', 'Đã sửa!', 'Vấn đề đã được khắc phục');
      }
    });
  };

  const handleIgnoreIssue = (issue) => {
    setIssues(issues.filter(i => i.id !== issue.id));
    showToast('info', 'Đã bỏ qua', 'Vấn đề đã được đánh dấu bỏ qua');
  };

  const handleViewDetails = (issue) => {
    showToast('info', 'Chi tiết', `Xem chi tiết: ${issue.title}`);
  };

  return (
    <TeacherLayout pageTitle="✅ Kiểm tra chất lượng">
      <Toast toast={toast} onClose={hideToast} />
      
      <PageContainer>
        <WelcomeCard theme={theme}>
          <WelcomeContent>
            <WelcomeTitle theme={theme}>
              Kiểm tra chất lượng nội dung ✅
            </WelcomeTitle>
            <WelcomeSubtitle theme={theme}>
              Quét và phát hiện lỗi trong bài học, flashcards, quiz
            </WelcomeSubtitle>
            <DateTime theme={theme}>
              <span>🕐</span>
              {formatDateTime(currentTime)} UTC | 👤 vinhsonvlog
            </DateTime>
          </WelcomeContent>
          <WelcomeIllustration>✅</WelcomeIllustration>
        </WelcomeCard>

        <StatsGrid>
          <StatCard theme={theme}>
            <StatIcon color="#8b5cf6">📋</StatIcon>
            <StatValue theme={theme}>{stats.total}</StatValue>
            <StatLabel theme={theme}>Tổng vấn đề</StatLabel>
          </StatCard>

          <StatCard theme={theme}>
            <StatIcon color="#ef4444">🚨</StatIcon>
            <StatValue theme={theme}>{stats.critical}</StatValue>
            <StatLabel theme={theme}>Nghiêm trọng</StatLabel>
          </StatCard>

          <StatCard theme={theme}>
            <StatIcon color="#f59e0b">⚠️</StatIcon>
            <StatValue theme={theme}>{stats.high}</StatValue>
            <StatLabel theme={theme}>Cao</StatLabel>
          </StatCard>

          <StatCard theme={theme}>
            <StatIcon color="#3b82f6">ℹ️</StatIcon>
            <StatValue theme={theme}>{stats.medium}</StatValue>
            <StatLabel theme={theme}>Trung bình</StatLabel>
          </StatCard>
        </StatsGrid>

        <ControlBar theme={theme}>
          <FilterButtons>
            <FilterButton
              theme={theme}
              active={filter === 'all'}
              onClick={() => setFilter('all')}
            >
              Tất cả
            </FilterButton>
            <FilterButton
              theme={theme}
              active={filter === 'critical'}
              onClick={() => setFilter('critical')}
            >
              🚨 Nghiêm trọng
            </FilterButton>
            <FilterButton
              theme={theme}
              active={filter === 'high'}
              onClick={() => setFilter('high')}
            >
              ⚠️ Cao
            </FilterButton>
            <FilterButton
              theme={theme}
              active={filter === 'medium'}
              onClick={() => setFilter('medium')}
            >
              ℹ️ Trung bình
            </FilterButton>
          </FilterButtons>
          
          <ActionButton onClick={handleRunCheck}>
            🔍 Quét lại toàn bộ
          </ActionButton>
        </ControlBar>

        {filteredIssues.length > 0 ? (
          <IssuesList>
            {filteredIssues.map(issue => (
              <IssueCard key={issue.id} theme={theme}>
                <IssueHeader>
                  <IssueInfo>
                    <IssueTitle theme={theme}>
                      <span>{issue.icon}</span>
                      {issue.title}
                      <SeverityBadge severity={issue.severity}>
                        {issue.severity}
                      </SeverityBadge>
                    </IssueTitle>
                    <IssueMeta theme={theme}>
                      <span>📍 {issue.location}</span>
                      <span>🕐 {issue.createdAt}</span>
                    </IssueMeta>
                  </IssueInfo>
                </IssueHeader>

                <IssueDescription theme={theme}>
                  {issue.description}
                </IssueDescription>

                <IssueDetails theme={theme}>
                  {issue.content}
                </IssueDetails>

                <IssueActions>
                  <IssueButton
                    variant="fix"
                    onClick={() => handleFixIssue(issue)}
                  >
                    ✅ Tự động sửa
                  </IssueButton>
                  <IssueButton
                    variant="view"
                    onClick={() => handleViewDetails(issue)}
                  >
                    👁️ Xem chi tiết
                  </IssueButton>
                  <IssueButton
                    variant="ignore"
                    onClick={() => handleIgnoreIssue(issue)}
                  >
                    ⏭️ Bỏ qua
                  </IssueButton>
                </IssueActions>
              </IssueCard>
            ))}
          </IssuesList>
        ) : (
          <EmptyState theme={theme}>
            <EmptyIcon>✅</EmptyIcon>
            <EmptyText theme={theme}>
              Không có vấn đề nào được tìm thấy!
            </EmptyText>
          </EmptyState>
        )}
      </PageContainer>
    </TeacherLayout>
  );
};

export default TeacherQualityCheck;