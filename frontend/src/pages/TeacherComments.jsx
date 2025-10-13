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
    transform: translateY(-2px);
  }
`;

const CommentsList = styled.div`
  display: grid;
  gap: 1.5rem;
`;

const CommentCard = styled.div`
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

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UserAvatar = styled.div`
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: ${props => props.color || 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const UserName = styled.div`
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 1rem;
`;

const CommentMeta = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  flex-wrap: wrap;
`;

const StatusBadge = styled.span`
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: bold;
  background: ${props => {
    if (props.status === 'pending') return 'rgba(245, 158, 11, 0.2)';
    if (props.status === 'replied') return 'rgba(16, 185, 129, 0.2)';
    return 'rgba(156, 163, 175, 0.2)';
  }};
  color: ${props => {
    if (props.status === 'pending') return '#f59e0b';
    if (props.status === 'replied') return '#10b981';
    return '#6b7280';
  }};
  text-transform: uppercase;
`;

const CommentContent = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#d1d5db' : '#4b5563'};
  line-height: 1.6;
  margin-bottom: 1rem;
  padding: 1rem;
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#f9fafb'};
  border-radius: 12px;
`;

const CommentLocation = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ReplySection = styled.div`
  padding: 1rem;
  background: ${props => props.theme === 'dark' ? '#111827' : '#ffffff'};
  border-radius: 12px;
  margin-bottom: 1rem;
`;

const ReplyLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  text-transform: uppercase;
  margin-bottom: 0.5rem;
`;

const ReplyContent = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#d1d5db' : '#4b5563'};
  line-height: 1.6;
`;

const CommentActions = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;

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
    if (props.variant === 'secondary') {
      return `
        background: rgba(139, 92, 246, 0.1);
        color: #8b5cf6;
        &:hover { background: rgba(139, 92, 246, 0.2); }
      `;
    }
    if (props.variant === 'danger') {
      return `
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
        &:hover { background: rgba(239, 68, 68, 0.2); }
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

const mockComments = [
  {
    id: 1,
    userName: 'Nguyen Van A',
    userAvatar: '👨',
    userColor: 'linear-gradient(135deg, #58CC02 0%, #45a302 100%)',
    content: 'Thầy ơi, em không hiểu phần giải thích về Present Perfect trong bài học. Có thể giải thích thêm về cách dùng "since" và "for" được không ạ?',
    location: 'Bài học: Present Perfect Tense',
    timestamp: '2025-10-13 10:30:00 UTC',
    status: 'pending',
    reply: null,
  },
  {
    id: 2,
    userName: 'Tran Thi B',
    userAvatar: '👩',
    userColor: 'linear-gradient(135deg, #1CB0F6 0%, #0891b2 100%)',
    content: 'Thầy cho em hỏi câu số 15 trong quiz Grammar Test #5 có vẻ đáp án sai ạ. Em chọn đáp án B nhưng bị sai, trong khi em tra trên sách thì đáp án B đúng ạ.',
    location: 'Quiz: Grammar Test #5 - Question 15',
    timestamp: '2025-10-13 09:15:00 UTC',
    status: 'replied',
    reply: 'Chào bạn! Cảm ơn bạn đã phản hồi. Thầy đã kiểm tra lại và phát hiện đáp án đúng thực sự là B. Thầy đã cập nhật lại trong hệ thống. Cảm ơn bạn nhiều nhé! 😊',
  },
  {
    id: 3,
    userName: 'Le Van C',
    userAvatar: '🧑',
    userColor: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    content: 'Em muốn biết thêm về cách phát âm của các từ trong TOEIC Vocabulary deck. Có audio file không ạ?',
    location: 'Deck: TOEIC Vocabulary 500',
    timestamp: '2025-10-13 08:45:00 UTC',
    status: 'pending',
    reply: null,
  },
  {
    id: 4,
    userName: 'Pham Thi D',
    userAvatar: '👧',
    userColor: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    content: 'Thầy ơi, em đã hoàn thành bài tập nhưng chưa thấy kết quả. Có vấn đề gì không ạ?',
    location: 'Bài tập: TOEIC Reading Practice',
    timestamp: '2025-10-12 16:20:00 UTC',
    status: 'replied',
    reply: 'Chào em! Có vẻ có lỗi kỹ thuật nhỏ. Thầy đã kiểm tra và thấy bài của em đã được chấm: 95/100 điểm. Xuất sắc! Keep up the good work! 🎉',
  },
];

// ========== COMPONENT ==========

const TeacherComments = () => {
  const { toast, showToast, hideToast } = useToast();
  const [theme] = useState('light');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [comments, setComments] = useState(mockComments);
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
    total: comments.length,
    pending: comments.filter(c => c.status === 'pending').length,
    replied: comments.filter(c => c.status === 'replied').length,
    today: comments.filter(c => c.timestamp.includes('2025-10-13')).length,
  };

  const filteredComments = comments.filter(comment => {
    if (filter === 'all') return true;
    if (filter === 'pending') return comment.status === 'pending';
    if (filter === 'replied') return comment.status === 'replied';
    return true;
  });

  const handleReply = (comment) => {
    Swal.fire({
      title: `💬 Trả lời ${comment.userName}`,
      html: `
        <div style="text-align:left;margin-bottom:1rem;">
          <p style="color:#6b7280;font-size:0.875rem;margin-bottom:0.5rem;">Câu hỏi:</p>
          <div style="padding:1rem;background:#f9fafb;border-radius:8px;color:#4b5563;font-size:0.875rem;">
            ${comment.content}
          </div>
        </div>
        <textarea id="replyText" class="swal2-textarea" placeholder="Nhập câu trả lời của bạn..." style="width:100%;min-height:120px;"></textarea>
      `,
      showCancelButton: true,
      confirmButtonText: '📤 Gửi trả lời',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#8b5cf6',
      cancelButtonColor: '#6b7280',
      width: 600,
      preConfirm: () => {
        const reply = document.getElementById('replyText').value.trim();
        if (!reply) {
          Swal.showValidationMessage('Vui lòng nhập nội dung trả lời');
          return false;
        }
        return reply;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        setComments(comments.map(c => 
          c.id === comment.id ? { ...c, status: 'replied', reply: result.value } : c
        ));
        showToast('success', 'Đã gửi!', 'Trả lời đã được gửi đến học viên');
      }
    });
  };

  const handleView = (comment) => {
    showToast('info', 'Xem chi tiết', `Xem chi tiết comment từ ${comment.userName}`);
  };

  const handleDelete = (comment) => {
    Swal.fire({
      title: 'Xác nhận xóa?',
      text: `Xóa comment từ ${comment.userName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        setComments(comments.filter(c => c.id !== comment.id));
        showToast('success', 'Đã xóa!', 'Comment đã được xóa');
      }
    });
  };

  return (
    <TeacherLayout pageTitle="💬 Nhận xét">
      <Toast toast={toast} onClose={hideToast} />
      
      <PageContainer>
        <WelcomeCard theme={theme}>
          <WelcomeContent>
            <WelcomeTitle theme={theme}>
              Quản lý nhận xét 💬
            </WelcomeTitle>
            <WelcomeSubtitle theme={theme}>
              Xem và trả lời câu hỏi từ học viên
            </WelcomeSubtitle>
            <DateTime theme={theme}>
              <span>🕐</span>
              {formatDateTime(currentTime)} UTC | 👤 vinhsonvlog
            </DateTime>
          </WelcomeContent>
          <WelcomeIllustration>💬</WelcomeIllustration>
        </WelcomeCard>

        <StatsGrid>
          <StatCard theme={theme}>
            <StatIcon color="#8b5cf6">💬</StatIcon>
            <StatValue theme={theme}>{stats.total}</StatValue>
            <StatLabel theme={theme}>Tổng comments</StatLabel>
          </StatCard>

          <StatCard theme={theme}>
            <StatIcon color="#f59e0b">⏳</StatIcon>
            <StatValue theme={theme}>{stats.pending}</StatValue>
            <StatLabel theme={theme}>Chờ trả lời</StatLabel>
          </StatCard>

          <StatCard theme={theme}>
            <StatIcon color="#10b981">✅</StatIcon>
            <StatValue theme={theme}>{stats.replied}</StatValue>
            <StatLabel theme={theme}>Đã trả lời</StatLabel>
          </StatCard>

          <StatCard theme={theme}>
            <StatIcon color="#1CB0F6">📅</StatIcon>
            <StatValue theme={theme}>{stats.today}</StatValue>
            <StatLabel theme={theme}>Hôm nay</StatLabel>
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
              active={filter === 'pending'}
              onClick={() => setFilter('pending')}
            >
              ⏳ Chờ trả lời
            </FilterButton>
            <FilterButton
              theme={theme}
              active={filter === 'replied'}
              onClick={() => setFilter('replied')}
            >
              ✅ Đã trả lời
            </FilterButton>
          </FilterButtons>
        </ControlBar>

        {filteredComments.length > 0 ? (
          <CommentsList>
            {filteredComments.map(comment => (
              <CommentCard key={comment.id} theme={theme}>
                <CommentHeader>
                  <UserInfo>
                    <UserAvatar color={comment.userColor}>
                      {comment.userAvatar}
                    </UserAvatar>
                    <UserDetails>
                      <UserName theme={theme}>{comment.userName}</UserName>
                      <CommentMeta theme={theme}>
                        <span>🕐 {comment.timestamp}</span>
                        <StatusBadge status={comment.status}>
                          {comment.status === 'pending' ? 'Chờ trả lời' : 'Đã trả lời'}
                        </StatusBadge>
                      </CommentMeta>
                    </UserDetails>
                  </UserInfo>
                </CommentHeader>

                <CommentLocation theme={theme}>
                  <span>📍</span>
                  {comment.location}
                </CommentLocation>

                <CommentContent theme={theme}>
                  {comment.content}
                </CommentContent>

                {comment.reply && (
                  <ReplySection theme={theme}>
                    <ReplyLabel theme={theme}>📤 Trả lời của bạn:</ReplyLabel>
                    <ReplyContent theme={theme}>{comment.reply}</ReplyContent>
                  </ReplySection>
                )}

                <CommentActions>
                  {comment.status === 'pending' ? (
                    <ActionButton
                      variant="primary"
                      onClick={() => handleReply(comment)}
                    >
                      💬 Trả lời
                    </ActionButton>
                  ) : (
                    <ActionButton
                      variant="secondary"
                      onClick={() => handleReply(comment)}
                    >
                      ✏️ Chỉnh sửa trả lời
                    </ActionButton>
                  )}
                  <ActionButton
                    variant="secondary"
                    onClick={() => handleView(comment)}
                  >
                    👁️ Xem chi tiết
                  </ActionButton>
                  <ActionButton
                    variant="danger"
                    onClick={() => handleDelete(comment)}
                  >
                    🗑️ Xóa
                  </ActionButton>
                </CommentActions>
              </CommentCard>
            ))}
          </CommentsList>
        ) : (
          <EmptyState theme={theme}>
            <EmptyIcon>💬</EmptyIcon>
            <EmptyText theme={theme}>
              Không có nhận xét nào
            </EmptyText>
          </EmptyState>
        )}
      </PageContainer>
    </TeacherLayout>
  );
};

export default TeacherComments;