import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Swal from 'sweetalert2';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import TeacherLayout from '../layouts/TeacherLayout';

// ========== STYLED COMPONENTS ==========
// ✅ XÓA: PageWrapper, Header (đã có trong TeacherLayout)

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 1rem;
  flex-wrap: wrap;
`;

const PageTitleSection = styled.div``;

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
`;

const CreateButton = styled.button`
  padding: 1rem 2rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  border: none;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
  }

  span:first-child {
    font-size: 1.5rem;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;

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
  animation: slideUp 0.6s ease;
  animation-delay: ${props => props.delay || '0s'};
  animation-fill-mode: both;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: ${props => props.color || '#58CC02'}22;
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

const TabsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  overflow-x: auto;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #8b5cf6;
    border-radius: 2px;
  }
`;

const Tab = styled.button`
  padding: 1rem 1.5rem;
  border: none;
  background: none;
  color: ${props => {
    if (props.active) return '#8b5cf6';
    return props.theme === 'dark' ? '#9ca3af' : '#6b7280';
  }};
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 3px solid ${props => props.active ? '#8b5cf6' : 'transparent'};
  white-space: nowrap;

  &:hover {
    color: #8b5cf6;
  }
`;

const ClassesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ClassCard = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 0;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };
  transition: all 0.3s ease;
  cursor: pointer;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  }
`;

const ClassHeader = styled.div`
  background: ${props => props.color || 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'};
  padding: 2rem;
  color: white;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 150px;
    height: 150px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    transform: translate(30%, -30%);
  }
`;

const ClassTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 1;
`;

const ClassSubject = styled.div`
  font-size: 0.875rem;
  opacity: 0.9;
  position: relative;
  z-index: 1;
`;

const ClassBody = styled.div`
  padding: 1.5rem;
`;

const ClassInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: ${props => props.theme === 'dark' ? '#d1d5db' : '#4b5563'};
  font-size: 0.875rem;

  span:first-child {
    font-size: 1.25rem;
  }
`;

const ClassCode = styled.div`
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#f9fafb'};
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CodeLabel = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  margin-bottom: 0.25rem;
`;

const CodeValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-family: 'Courier New', monospace;
`;

const CopyButton = styled.button`
  background: rgba(139, 92, 246, 0.1);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  color: #8b5cf6;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;

  &:hover {
    background: rgba(139, 92, 246, 0.2);
    transform: scale(1.05);
  }
`;

const ClassActions = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
`;

const ActionButton = styled.button`
  padding: 0.75rem;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

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
  margin-bottom: 1rem;
`;

const EmptySubtext = styled.div`
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#6b7280' : '#9ca3af'};
`;

// ========== MOCK DATA ==========

const mockClasses = [
  {
    id: 1,
    name: 'TOEIC Basic - Morning Class',
    subject: 'TOEIC Preparation',
    code: 'ABC123',
    students: 28,
    maxStudents: 30,
    lessons: 12,
    assignments: 8,
    createdDate: '2025-01-15',
    status: 'active',
    color: 'linear-gradient(135deg, #58CC02 0%, #45a302 100%)',
  },
  {
    id: 2,
    name: 'Business English Advanced',
    subject: 'Business Communication',
    code: 'XYZ789',
    students: 15,
    maxStudents: 20,
    lessons: 8,
    assignments: 5,
    createdDate: '2025-02-01',
    status: 'active',
    color: 'linear-gradient(135deg, #1CB0F6 0%, #0891b2 100%)',
  },
  {
    id: 3,
    name: 'IELTS Speaking Practice',
    subject: 'IELTS Preparation',
    code: 'DEF456',
    students: 20,
    maxStudents: 25,
    lessons: 10,
    assignments: 6,
    createdDate: '2025-01-20',
    status: 'active',
    color: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  },
  {
    id: 4,
    name: 'Grammar Foundation',
    subject: 'English Grammar',
    code: 'GHI321',
    students: 12,
    maxStudents: 15,
    lessons: 6,
    assignments: 4,
    createdDate: '2025-02-10',
    status: 'draft',
    color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  },
];

// ========== COMPONENT ==========

const TeacherClassroom = () => {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [theme] = useState('light');
  const [activeTab, setActiveTab] = useState('all');
  const [classes, setClasses] = useState(mockClasses);

  const stats = {
    totalClasses: classes.length,
    activeClasses: classes.filter(c => c.status === 'active').length,
    totalStudents: classes.reduce((sum, c) => sum + c.students, 0),
    totalLessons: classes.reduce((sum, c) => sum + c.lessons, 0),
  };

  const filteredClasses = classes.filter(c => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return c.status === 'active';
    if (activeTab === 'draft') return c.status === 'draft';
    return true;
  });

  const handleCreateClass = () => {
    Swal.fire({
      title: '',
      html: `
        <div style="display:flex;flex-direction:column;gap:1.5rem;text-align:left;">
          <div style="
            border-radius:22px;
            padding:1.75rem;
            background:linear-gradient(135deg, rgba(139,92,246,0.16) 0%, rgba(124,58,237,0.18) 100%);
            border:1px solid rgba(139,92,246,0.35);
            box-shadow:0 12px 30px rgba(15,23,42,0.12);
          ">
            <div style="display:flex;align-items:flex-start;gap:1rem;">
              <span style="font-size:2.5rem;line-height:1;">🎓</span>
              <div>
                <h2 style="margin:0;font-size:1.6rem;color:#0f172a;font-weight:700;">Tạo lớp học mới</h2>
                <p style="margin:0.35rem 0 0;font-size:0.95rem;color:#475569;line-height:1.6;">
                  Nhập thông tin bên dưới để bắt đầu quản lý lớp học của bạn.
                </p>
              </div>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.25rem;">
            <label style="display:flex;flex-direction:column;gap:0.45rem;font-weight:600;color:#1e293b;">
              <span style="display:flex;align-items:center;gap:0.45rem;font-size:0.9rem;letter-spacing:0.02em;text-transform:uppercase;color:#64748b;">
                <span>🏫</span> Tên lớp học *
              </span>
              <input id="className" class="swal2-input" placeholder="VD: TOEIC Basic" style="
                width:100%;margin:0;border-radius:14px;border:2px solid rgba(148,163,184,0.35);padding:0.85rem 1rem;font-size:0.95rem;
              ">
            </label>

            <label style="display:flex;flex-direction:column;gap:0.45rem;font-weight:600;color:#1e293b;">
              <span style="display:flex;align-items:center;gap:0.45rem;font-size:0.9rem;letter-spacing:0.02em;text-transform:uppercase;color:#64748b;">
                <span>📘</span> Môn học *
              </span>
              <input id="subject" class="swal2-input" placeholder="VD: TOEIC Preparation" style="
                width:100%;margin:0;border-radius:14px;border:2px solid rgba(148,163,184,0.35);padding:0.85rem 1rem;font-size:0.95rem;
              ">
            </label>
          </div>

          <label style="display:flex;flex-direction:column;gap:0.45rem;font-weight:600;color:#1e293b;">
            <span style="display:flex;align-items:center;gap:0.45rem;font-size:0.9rem;letter-spacing:0.02em;text-transform:uppercase;color:#64748b;">
              <span>👥</span> Số học viên tối đa
            </span>
            <input id="maxStudents" type="number" placeholder="30" value="30" style="
              width:100%;margin:0;border-radius:14px;border:2px solid rgba(148,163,184,0.35);padding:0.85rem 1rem;font-size:1rem;
            ">
          </label>

          <label style="display:flex;flex-direction:column;gap:0.45rem;font-weight:600;color:#1e293b;">
            <span style="display:flex;align-items:center;gap:0.45rem;font-size:0.9rem;letter-spacing:0.02em;text-transform:uppercase;color:#64748b;">
              <span>📝</span> Mô tả lớp học
            </span>
            <textarea id="description" class="swal2-textarea" placeholder="Nhập mô tả..." style="
              width:100%;margin:0;min-height:110px;border-radius:16px;border:2px solid rgba(148,163,184,0.35);padding:1rem 1.1rem;font-size:0.95rem;
            "></textarea>
          </label>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: '✨ Tạo lớp',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#8b5cf6',
      cancelButtonColor: '#94a3b8',
      width: 680,
      background: '#f8fafc',
      preConfirm: () => {
        const className = document.getElementById('className').value.trim();
        const subject = document.getElementById('subject').value.trim();
        const maxStudents = document.getElementById('maxStudents').value;
        const description = document.getElementById('description').value.trim();

        if (!className || !subject) {
          Swal.showValidationMessage('Vui lòng điền đầy đủ thông tin bắt buộc');
          return false;
        }

        return { className, subject, maxStudents, description };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const newClass = {
          id: classes.length + 1,
          name: result.value.className,
          subject: result.value.subject,
          code: Math.random().toString(36).substring(2, 8).toUpperCase(),
          students: 0,
          maxStudents: parseInt(result.value.maxStudents, 10) || 30,
          lessons: 0,
          assignments: 0,
          createdDate: new Date().toISOString().split('T')[0],
          status: 'active',
          color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        };

        setClasses([...classes, newClass]);

        Swal.fire({
          icon: 'success',
          title: '🎉 Tạo lớp thành công!',
          html: `
            <p>Lớp <strong>${result.value.className}</strong> đã sẵn sàng.</p>
            <div style="padding:1rem;border-radius:14px;background:rgba(139,92,246,0.12);border:1px dashed rgba(139,92,246,0.45);
              font-family:'Courier New',monospace;font-size:1.4rem;letter-spacing:0.15em;color:#6b21a8;text-align:center;margin:1rem 0;">
              ${newClass.code}
            </div>
            <p style="font-size:0.95rem;color:#475569;">Chia sẻ mã này với học viên để họ tham gia lớp.</p>
          `,
          confirmButtonColor: '#8b5cf6',
        });
      }
    });
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    showToast('success', 'Đã sao chép!', `Mã lớp "${code}" đã được sao chép`);
  };

  const handleInviteStudents = (classItem) => {
    const inviteLink = `https://englishmaster.com/join/${classItem.code}`;
    
    Swal.fire({
      title: '📨 Mời học viên',
      html: `
        <div style="text-align: left;">
          <h4 style="margin-bottom: 1rem;">Lớp: ${classItem.name}</h4>
          
          <div style="background: #f3f4f6; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
            <strong>Mã lớp:</strong>
            <div style="font-family: monospace; font-size: 1.5rem; color: #8b5cf6; margin: 0.5rem 0;">
              ${classItem.code}
            </div>
            <button id="copyCodeBtn" style="background: #8b5cf6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-weight: bold;">
              📋 Sao chép mã
            </button>
          </div>

          <div style="background: #f3f4f6; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
            <strong>Link mời:</strong>
            <div style="font-size: 0.875rem; color: #1CB0F6; margin: 0.5rem 0; word-break: break-all;">
              ${inviteLink}
            </div>
            <button id="copyLinkBtn" style="background: #1CB0F6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-weight: bold;">
              🔗 Sao chép link
            </button>
          </div>

          <div style="margin-top: 1rem;">
            <strong>Hoặc mời qua email:</strong>
            <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
              <input id="emailInput" type="email" placeholder="student@example.com" style="flex: 1; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px;">
              <button id="sendEmailBtn" style="background: #8b5cf6; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: bold;">
                📧 Gửi
              </button>
            </div>
          </div>
        </div>
      `,
      showConfirmButton: false,
      showCloseButton: true,
      width: '600px',
      didOpen: () => {
        document.getElementById('copyCodeBtn').addEventListener('click', () => {
          navigator.clipboard.writeText(classItem.code);
          showToast('success', 'Đã sao chép!', 'Mã lớp đã được sao chép');
        });
        
        document.getElementById('copyLinkBtn').addEventListener('click', () => {
          navigator.clipboard.writeText(inviteLink);
          showToast('success', 'Đã sao chép!', 'Link mời đã được sao chép');
        });
        
        document.getElementById('sendEmailBtn').addEventListener('click', () => {
          const email = document.getElementById('emailInput').value;
          if (email && /\S+@\S+\.\S+/.test(email)) {
            showToast('success', 'Đã gửi!', `Email mời đã được gửi đến ${email}`);
            document.getElementById('emailInput').value = '';
          } else {
            showToast('error', 'Lỗi!', 'Vui lòng nhập email hợp lệ');
          }
        });
      }
    });
  };

  const handleManageClass = (classItem) => {
    navigate(`/teacher/class/${classItem.id}`);
  };

  const handleViewStudents = (classItem) => {
    Swal.fire({
      title: `👥 Danh sách học viên - ${classItem.name}`,
      html: `
        <div style="text-align: left;">
          <p><strong>Số lượng:</strong> ${classItem.students}/${classItem.maxStudents} học viên</p>
          <div style="margin-top: 1rem;">
            <p style="color: #6b7280; font-size: 0.875rem;">Danh sách học viên sẽ được hiển thị ở đây...</p>
          </div>
        </div>
      `,
      icon: 'info',
      confirmButtonColor: '#8b5cf6',
    });
  };

  return (
    <TeacherLayout pageTitle="🎓 Quản lý lớp học">
      <Toast toast={toast} onClose={hideToast} />

      {/* Page Header - BỎ PageTitle vì đã có trong TeacherLayout */}
      <PageHeader>
        <PageTitleSection>
          <PageSubtitle theme={theme}>
            Tạo và quản lý các lớp học của bạn
          </PageSubtitle>
        </PageTitleSection>
        <CreateButton onClick={handleCreateClass}>
          <span>➕</span>
          Tạo lớp mới
        </CreateButton>
      </PageHeader>

      {/* Stats */}
      <StatsGrid>
        <StatCard theme={theme} delay="0.1s">
          <StatIcon color="#8b5cf6">🎓</StatIcon>
          <StatValue theme={theme}>{stats.totalClasses}</StatValue>
          <StatLabel theme={theme}>Tổng lớp học</StatLabel>
        </StatCard>

        <StatCard theme={theme} delay="0.2s">
          <StatIcon color="#10b981">✅</StatIcon>
          <StatValue theme={theme}>{stats.activeClasses}</StatValue>
          <StatLabel theme={theme}>Đang hoạt động</StatLabel>
        </StatCard>

        <StatCard theme={theme} delay="0.3s">
          <StatIcon color="#1CB0F6">👥</StatIcon>
          <StatValue theme={theme}>{stats.totalStudents}</StatValue>
          <StatLabel theme={theme}>Tổng học viên</StatLabel>
        </StatCard>

        <StatCard theme={theme} delay="0.4s">
          <StatIcon color="#58CC02">📚</StatIcon>
          <StatValue theme={theme}>{stats.totalLessons}</StatValue>
          <StatLabel theme={theme}>Bài học</StatLabel>
        </StatCard>
      </StatsGrid>

      {/* Tabs */}
      <TabsContainer theme={theme}>
        <Tab
          theme={theme}
          active={activeTab === 'all'}
          onClick={() => setActiveTab('all')}
        >
          📋 Tất cả ({classes.length})
        </Tab>
        <Tab
          theme={theme}
          active={activeTab === 'active'}
          onClick={() => setActiveTab('active')}
        >
          ✅ Đang hoạt động ({classes.filter(c => c.status === 'active').length})
        </Tab>
        <Tab
          theme={theme}
          active={activeTab === 'draft'}
          onClick={() => setActiveTab('draft')}
        >
          📝 Nháp ({classes.filter(c => c.status === 'draft').length})
        </Tab>
      </TabsContainer>

      {/* Classes Grid */}
      {filteredClasses.length > 0 ? (
        <ClassesGrid>
          {filteredClasses.map(classItem => (
            <ClassCard key={classItem.id} theme={theme}>
              <ClassHeader color={classItem.color}>
                <ClassTitle>{classItem.name}</ClassTitle>
                <ClassSubject>{classItem.subject}</ClassSubject>
              </ClassHeader>

              <ClassBody>
                <ClassInfo>
                  <InfoItem theme={theme}>
                    <span>👥</span>
                    <span>{classItem.students}/{classItem.maxStudents} học viên</span>
                  </InfoItem>
                  <InfoItem theme={theme}>
                    <span>📚</span>
                    <span>{classItem.lessons} bài học</span>
                  </InfoItem>
                  <InfoItem theme={theme}>
                    <span>📝</span>
                    <span>{classItem.assignments} bài tập</span>
                  </InfoItem>
                  <InfoItem theme={theme}>
                    <span>📅</span>
                    <span>Tạo ngày {classItem.createdDate}</span>
                  </InfoItem>
                </ClassInfo>

                <ClassCode theme={theme}>
                  <div>
                    <CodeLabel theme={theme}>Mã lớp</CodeLabel>
                    <CodeValue theme={theme}>{classItem.code}</CodeValue>
                  </div>
                  <CopyButton onClick={() => handleCopyCode(classItem.code)}>
                    📋 Sao chép
                  </CopyButton>
                </ClassCode>

                <ClassActions>
                  <ActionButton
                    theme={theme}
                    variant="primary"
                    onClick={() => handleManageClass(classItem)}
                  >
                    <span>⚙️</span>
                    Quản lý
                  </ActionButton>
                  <ActionButton
                    theme={theme}
                    variant="secondary"
                    onClick={() => handleInviteStudents(classItem)}
                  >
                    <span>📨</span>
                    Mời học viên
                  </ActionButton>
                  <ActionButton
                    theme={theme}
                    onClick={() => handleViewStudents(classItem)}
                  >
                    <span>👥</span>
                    Xem học viên
                  </ActionButton>
                  <ActionButton
                    theme={theme}
                    onClick={() => showToast('info', 'Thông báo', 'Tính năng đang phát triển')}
                  >
                    <span>📊</span>
                    Thống kê
                  </ActionButton>
                </ClassActions>
              </ClassBody>
            </ClassCard>
          ))}
        </ClassesGrid>
      ) : (
        <EmptyState>
          <EmptyIcon>📚</EmptyIcon>
          <EmptyText theme={theme}>
            Chưa có lớp học nào
          </EmptyText>
          <EmptySubtext theme={theme}>
            Nhấn "Tạo lớp mới" để bắt đầu tạo lớp học đầu tiên
          </EmptySubtext>
        </EmptyState>
      )}
    </TeacherLayout>
  );
};

export default TeacherClassroom;