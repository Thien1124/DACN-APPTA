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
  background: ${props => props.color || '#f59e0b'}22;
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

const ActionsSection = styled.div`
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

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ActionCard = styled.div`
  padding: 2rem;
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#f9fafb'};
  border-radius: 16px;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.theme === 'dark' ? '#374151' : '#f3f4f6'};
    transform: translateY(-5px);
  }
`;

const ActionIcon = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  background: ${props => props.color || '#f59e0b'}22;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
`;

const ActionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.5rem;
`;

const ActionDescription = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  margin-bottom: 1.5rem;
  line-height: 1.5;
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  border: none;
  font-weight: bold;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
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
    if (props.variant === 'success') {
      return `
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
      `;
    }
    if (props.variant === 'danger') {
      return `
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        color: white;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }
      `;
    }
    return `
      background: ${props.theme === 'dark' ? '#374151' : '#e5e7eb'};
      color: ${props.theme === 'dark' ? '#e5e7eb' : '#374151'};
      
      &:hover {
        background: ${props.theme === 'dark' ? '#4B5563' : '#d1d5db'};
      }
    `;
  }}
`;

const BackupsList = styled.div`
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

const BackupItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#f9fafb'};
  border-radius: 16px;
  margin-bottom: 1rem;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.theme === 'dark' ? '#374151' : '#f3f4f6'};
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
`;

const BackupInfo = styled.div`
  flex: 1;
`;

const BackupName = styled.div`
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 1rem;
  margin-bottom: 0.5rem;
`;

const BackupMeta = styled.div`
  display: flex;
  gap: 1.5rem;
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const BackupActions = styled.div`
  display: flex;
  gap: 0.75rem;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const BackupButton = styled.button`
  padding: 0.5rem 1rem;
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
        background: rgba(245, 158, 11, 0.1);
        color: #f59e0b;
        
        &:hover {
          background: rgba(245, 158, 11, 0.2);
          transform: translateY(-2px);
        }
      `;
    }
    if (props.variant === 'success') {
      return `
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
        
        &:hover {
          background: rgba(16, 185, 129, 0.2);
          transform: translateY(-2px);
        }
      `;
    }
    if (props.variant === 'danger') {
      return `
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
        
        &:hover {
          background: rgba(239, 68, 68, 0.2);
          transform: translateY(-2px);
        }
      `;
    }
    return '';
  }}
`;

const AlertBox = styled.div`
  padding: 1.5rem;
  border-radius: 16px;
  background: ${props => {
    if (props.variant === 'warning') return 'rgba(245, 158, 11, 0.1)';
    if (props.variant === 'danger') return 'rgba(239, 68, 68, 0.1)';
    if (props.variant === 'success') return 'rgba(16, 185, 129, 0.1)';
    return 'rgba(28, 176, 246, 0.1)';
  }};
  border-left: 4px solid ${props => {
    if (props.variant === 'warning') return '#f59e0b';
    if (props.variant === 'danger') return '#ef4444';
    if (props.variant === 'success') return '#10b981';
    return '#1CB0F6';
  }};
  margin-bottom: 2rem;
`;

const AlertText = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#d1d5db' : '#4b5563'};
  line-height: 1.6;
  margin: 0;

  strong {
    color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  }
`;

// ========== MOCK DATA ==========

const mockBackups = [
  {
    id: 1,
    name: 'backup_2025-10-13_14-00-00.sql',
    size: '2.45 GB',
    date: '2025-10-13 14:00:00 UTC',
    type: 'Auto',
    status: 'completed',
  },
  {
    id: 2,
    name: 'backup_2025-10-12_14-00-00.sql',
    size: '2.43 GB',
    date: '2025-10-12 14:00:00 UTC',
    type: 'Auto',
    status: 'completed',
  },
  {
    id: 3,
    name: 'backup_manual_2025-10-11.sql',
    size: '2.40 GB',
    date: '2025-10-11 10:30:00 UTC',
    type: 'Manual',
    status: 'completed',
  },
  {
    id: 4,
    name: 'backup_2025-10-10_14-00-00.sql',
    size: '2.38 GB',
    date: '2025-10-10 14:00:00 UTC',
    type: 'Auto',
    status: 'completed',
  },
];

// ========== COMPONENT ==========

const AdminBackup = () => {
  const { toast, showToast, hideToast } = useToast();
  const [theme] = useState('light');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [backups] = useState(mockBackups);

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

  const stats = {
    total: backups.length,
    size: '9.66 GB',
    lastBackup: '1h ago',
    nextBackup: 'in 23h',
  };

  const handleCreateBackup = () => {
    Swal.fire({
      title: '💾 Tạo Backup',
      text: 'Bạn có chắc muốn tạo bản sao lưu ngay bây giờ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '💾 Tạo backup',
      cancelButtonText: 'Hủy',
      showLoaderOnConfirm: true,
      preConfirm: () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 2000);
        });
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: 'success',
          title: 'Hoàn thành!',
          text: 'Backup đã được tạo thành công',
          confirmButtonColor: '#f59e0b',
        });
        showToast('success', 'Thành công!', 'Backup mới đã được tạo');
      }
    });
  };

  const handleRestoreBackup = (backup) => {
    Swal.fire({
      title: '⚠️ Xác nhận khôi phục?',
      html: `
        <div style="text-align:left;">
          <p style="margin-bottom:1rem;color:#ef4444;font-weight:bold;">🚨 CẢNH BÁO QUAN TRỌNG!</p>
          <p style="margin-bottom:1rem;color:#6b7280;">Bạn đang chuẩn bị khôi phục dữ liệu từ:</p>
          <div style="padding:1rem;background:#f9fafb;border-radius:8px;margin-bottom:1rem;">
            <strong>${backup.name}</strong><br>
            <small>Kích thước: ${backup.size} | Ngày: ${backup.date}</small>
          </div>
          <p style="color:#ef4444;font-size:0.875rem;">⚠️ Hành động này sẽ GHI ĐÈ toàn bộ dữ liệu hiện tại và KHÔNG THỂ HOÀN TÁC!</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '♻️ Khôi phục',
      cancelButtonText: 'Hủy',
      width: 600,
    }).then((result) => {
      if (result.isConfirmed) {
        showToast('info', 'Đang xử lý', 'Đang khôi phục dữ liệu...');
        setTimeout(() => {
          showToast('success', 'Hoàn thành!', 'Dữ liệu đã được khôi phục');
        }, 2000);
      }
    });
  };

  const handleDownloadBackup = (backup) => {
    showToast('info', 'Đang tải', `Đang tải xuống ${backup.name}...`);
    setTimeout(() => {
      showToast('success', 'Hoàn thành!', 'File đã được tải xuống');
    }, 1500);
  };

  const handleDeleteBackup = (backup) => {
    Swal.fire({
      title: 'Xác nhận xóa?',
      text: `Bạn có chắc muốn xóa backup "${backup.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '🗑️ Xóa',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        showToast('success', 'Đã xóa!', `Backup ${backup.name} đã được xóa`);
      }
    });
  };

  const handleScheduleBackup = () => {
    Swal.fire({
      title: '⏰ Lên lịch Backup',
      html: `
        <div style="display:flex;flex-direction:column;gap:1rem;text-align:left;">
          <label>
            <span style="font-weight:600;color:#1e293b;display:block;margin-bottom:0.5rem;">⏰ Tần suất</span>
            <select id="backupFrequency" class="swal2-select" style="margin:0;width:100%;">
              <option value="hourly">Mỗi giờ</option>
              <option value="daily" selected>Hàng ngày</option>
              <option value="weekly">Hàng tuần</option>
              <option value="monthly">Hàng tháng</option>
            </select>
          </label>
          <label>
            <span style="font-weight:600;color:#1e293b;display:block;margin-bottom:0.5rem;">🕐 Thời gian</span>
            <input id="backupTime" type="time" class="swal2-input" value="14:00" style="margin:0;width:100%;">
          </label>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '💾 Lưu lịch',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#6b7280',
      width: 500,
    }).then((result) => {
      if (result.isConfirmed) {
        showToast('success', 'Đã lưu!', 'Lịch backup tự động đã được cập nhật');
      }
    });
  };

  const handleDeleteAllBackups = () => {
    Swal.fire({
      title: '🚨 XÓA TẤT CẢ BACKUP?',
      html: `
        <div style="text-align:left;">
          <p style="color:#ef4444;font-weight:bold;margin-bottom:1rem;">⚠️ CẢNH BÁO CỰC KỲ NGUY HIỂM!</p>
          <p style="color:#6b7280;margin-bottom:1rem;">Bạn đang chuẩn bị xóa TẤT CẢ ${backups.length} backup (${stats.size}).</p>
          <p style="color:#ef4444;font-size:0.875rem;">🚨 Hành động này KHÔNG THỂ HOÀN TÁC!</p>
        </div>
      `,
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '🗑️ XÓA TẤT CẢ',
      cancelButtonText: 'Hủy',
      width: 600,
    }).then((result) => {
      if (result.isConfirmed) {
        showToast('success', 'Đã xóa!', 'Tất cả backup đã được xóa');
      }
    });
  };

  return (
    <AdminLayout pageTitle="💾 Backup">
      <Toast toast={toast} onClose={hideToast} />
      
      <PageContainer>
        {/* Welcome Card */}
        <WelcomeCard theme={theme}>
          <WelcomeContent>
            <WelcomeTitle theme={theme}>
              Sao lưu & Khôi phục 💾
            </WelcomeTitle>
            <WelcomeSubtitle theme={theme}>
              Quản lý backup dữ liệu hệ thống
            </WelcomeSubtitle>
            <DateTime theme={theme}>
              <span>🕐</span>
              {formatDateTime(currentTime)} UTC | 👤 vinhsonvlog
            </DateTime>
          </WelcomeContent>
          <WelcomeIllustration>💾</WelcomeIllustration>
        </WelcomeCard>

        {/* Stats */}
        <StatsGrid>
          <StatCard theme={theme}>
            <StatIcon color="#f59e0b">💾</StatIcon>
            <StatValue theme={theme}>{stats.total}</StatValue>
            <StatLabel theme={theme}>Tổng backup</StatLabel>
          </StatCard>

          <StatCard theme={theme}>
            <StatIcon color="#8b5cf6">📊</StatIcon>
            <StatValue theme={theme}>{stats.size}</StatValue>
            <StatLabel theme={theme}>Tổng dung lượng</StatLabel>
          </StatCard>

          <StatCard theme={theme}>
            <StatIcon color="#10b981">✅</StatIcon>
            <StatValue theme={theme}>{stats.lastBackup}</StatValue>
            <StatLabel theme={theme}>Backup cuối</StatLabel>
          </StatCard>

          <StatCard theme={theme}>
            <StatIcon color="#1CB0F6">⏰</StatIcon>
            <StatValue theme={theme}>{stats.nextBackup}</StatValue>
            <StatLabel theme={theme}>Backup tiếp theo</StatLabel>
          </StatCard>
        </StatsGrid>

        {/* Alert */}
        <AlertBox theme={theme} variant="info">
          <AlertText theme={theme}>
            💡 <strong>Lưu ý:</strong> Backup tự động sẽ được thực hiện hàng ngày lúc 14:00 UTC. Các backup cũ hơn 30 ngày sẽ tự động bị xóa.
          </AlertText>
        </AlertBox>

        {/* Actions */}
        <ActionsSection theme={theme}>
          <SectionTitle theme={theme}>
            <span>⚡</span>
            Hành động nhanh
          </SectionTitle>
          
          <ActionsGrid>
            <ActionCard theme={theme}>
              <ActionIcon color="#f59e0b">💾</ActionIcon>
              <ActionTitle theme={theme}>Tạo Backup</ActionTitle>
              <ActionDescription theme={theme}>
                Tạo bản sao lưu toàn bộ dữ liệu ngay lập tức
              </ActionDescription>
              <ActionButton variant="primary" onClick={handleCreateBackup}>
                💾 Backup ngay
              </ActionButton>
            </ActionCard>

            <ActionCard theme={theme}>
              <ActionIcon color="#10b981">♻️</ActionIcon>
              <ActionTitle theme={theme}>Khôi phục</ActionTitle>
              <ActionDescription theme={theme}>
                Khôi phục dữ liệu từ backup trước đó
              </ActionDescription>
              <ActionButton variant="success" onClick={() => showToast('info', 'Thông báo', 'Chọn backup để khôi phục')}>
                ♻️ Khôi phục
              </ActionButton>
            </ActionCard>

            <ActionCard theme={theme}>
              <ActionIcon color="#1CB0F6">⏰</ActionIcon>
              <ActionTitle theme={theme}>Lên lịch</ActionTitle>
              <ActionDescription theme={theme}>
                Cấu hình backup tự động theo lịch
              </ActionDescription>
              <ActionButton onClick={handleScheduleBackup}>
                ⏰ Cài đặt lịch
              </ActionButton>
            </ActionCard>
          </ActionsGrid>
        </ActionsSection>

        {/* Backups List */}
        <BackupsList theme={theme}>
          <SectionTitle theme={theme}>
            <span>📋</span>
            Danh sách Backup
          </SectionTitle>

          {backups.map(backup => (
            <BackupItem key={backup.id} theme={theme}>
              <BackupInfo>
                <BackupName theme={theme}>
                  💾 {backup.name}
                </BackupName>
                <BackupMeta theme={theme}>
                  <span>📊 {backup.size}</span>
                  <span>📅 {backup.date}</span>
                  <span>
                    {backup.type === 'Auto' ? '⚡ Tự động' : '👤 Thủ công'}
                  </span>
                  <span style={{ color: '#10b981' }}>✅ {backup.status}</span>
                </BackupMeta>
              </BackupInfo>
              
              <BackupActions>
                <BackupButton
                  variant="success"
                  onClick={() => handleRestoreBackup(backup)}
                  title="Khôi phục"
                >
                  ♻️ Restore
                </BackupButton>
                <BackupButton
                  variant="primary"
                  onClick={() => handleDownloadBackup(backup)}
                  title="Tải xuống"
                >
                  📥 Download
                </BackupButton>
                <BackupButton
                  variant="danger"
                  onClick={() => handleDeleteBackup(backup)}
                  title="Xóa"
                >
                  🗑️ Delete
                </BackupButton>
              </BackupActions>
            </BackupItem>
          ))}

          <AlertBox theme={theme} variant="danger" style={{ marginTop: '2rem', marginBottom: 0 }}>
            <AlertText theme={theme}>
              🚨 <strong>Vùng nguy hiểm:</strong> Xóa tất cả backup sẽ KHÔNG THỂ HOÀN TÁC. Hãy chắc chắn trước khi thực hiện!
            </AlertText>
          </AlertBox>

          <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
            <ActionButton
              variant="danger"
              onClick={handleDeleteAllBackups}
              style={{ maxWidth: '300px' }}
            >
              🗑️ Xóa tất cả backup
            </ActionButton>
          </div>
        </BackupsList>
      </PageContainer>
    </AdminLayout>
  );
};

export default AdminBackup;