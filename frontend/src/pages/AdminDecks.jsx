import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import { adminService } from '../services/adminService';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import Swal from 'sweetalert2';
import {
  Folder,
  Add,
  Visibility,
  Edit,
  Delete,
  Public,
  VisibilityOff,
  Style,
  Class
} from '@mui/icons-material';

// ========== STYLED COMPONENTS ==========

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
`;

const CreateButton = styled.button`
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
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(88, 204, 2, 0.3);
  }
`;

const DecksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
`;

const DeckCard = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0,0,0,0.15);
  }
`;

const DeckIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const DeckTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.5rem;
`;

const DeckDescription = styled.p`
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-size: 0.875rem;
  margin-bottom: 1rem;
  line-height: 1.6;
`;

const DeckStats = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const Stat = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => props.published ? '#10b981' : '#f59e0b'};
  color: white;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => {
    if (props.variant === 'edit') return '#1CB0F6';
    if (props.variant === 'delete') return '#ef4444';
    if (props.variant === 'view') return '#8b5cf6';
    return '#6b7280';
  }};
  color: white;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

// ========== COMPONENT ==========

const AdminDecks = () => {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [theme] = useState('light');
  const [loading, setLoading] = useState(true);
  const [decks, setDecks] = useState([]);

  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    try {
      setLoading(true);
      const response = await adminService.decks.getAll();
      setDecks(response.data || []);
    } catch (error) {
      console.error('Error fetching decks:', error);
      showToast('error', 'Lỗi', 'Không thể tải danh sách decks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    navigate('/admin/decks/create');
  };

  const handleEdit = (deckId) => {
    navigate(`/admin/decks/edit/${deckId}`);
  };

  const handleView = (deckId) => {
    navigate(`/admin/decks/${deckId}`);
  };

  const handleDelete = async (deck) => {
    const result = await Swal.fire({
      title: 'Xác nhận xóa?',
      text: `Bạn có chắc muốn xóa deck "${deck.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        await adminService.decks.delete(deck._id);
        showToast('success', 'Thành công', 'Đã xóa deck');
        fetchDecks();
      } catch (error) {
        showToast('error', 'Lỗi', error.response?.data?.message || 'Không thể xóa deck');
      }
    }
  };

  const handleTogglePublish = async (deck) => {
    try {
      await adminService.decks.togglePublish(deck._id);
      showToast('success', 'Thành công', `Đã ${deck.isPublished ? 'ẩn' : 'công khai'} deck`);
      fetchDecks();
    } catch (error) {
      showToast('error', 'Lỗi', 'Không thể cập nhật trạng thái');
    }
  };

  if (loading) {
    return (
      <AdminLayout pageTitle="Quản lý Decks">
        <LoadingText theme={theme}>Đang tải dữ liệu...</LoadingText>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Quản lý Decks">
      <Toast toast={toast} onClose={hideToast} />

      <PageHeader>
        <Title theme={theme}>
          <Folder sx={{ mr: 1 }} /> Decks ({decks.length})
        </Title>
        <CreateButton onClick={handleCreate}>
          <Add />
          Tạo deck mới
        </CreateButton>
      </PageHeader>

      {decks.length === 0 ? (
        <EmptyState theme={theme}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗂️</div>
          <div>Chưa có deck nào</div>
          <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Nhấn nút "Tạo deck mới" để bắt đầu
          </div>
        </EmptyState>
      ) : (
        <DecksGrid>
          {decks.map((deck) => (
            <DeckCard key={deck._id} theme={theme}>
              <DeckIcon>🎴</DeckIcon>
              
              <DeckTitle theme={theme}>{deck.name}</DeckTitle>
              <DeckDescription theme={theme}>
                {deck.description || 'Không có mô tả'}
              </DeckDescription>
              
              <DeckStats theme={theme}>
                <Stat theme={theme}>
                  <Class sx={{ fontSize: 18 }} />
                  {deck.course?.title || 'N/A'}
                </Stat>
                <Stat theme={theme}>
                  <Style sx={{ fontSize: 18 }} />
                  {deck.flashcards?.length || 0} thẻ
                </Stat>
              </DeckStats>

              <StatusBadge published={deck.isPublished}>
                {deck.isPublished ? 'Công khai' : 'Nháp'}
              </StatusBadge>

              <ActionButtons>
                <ActionButton variant="view" onClick={() => handleView(deck._id)}>
                  <Visibility sx={{ fontSize: 18 }} /> Xem
                </ActionButton>
                <ActionButton variant="edit" onClick={() => handleEdit(deck._id)}>
                  <Edit sx={{ fontSize: 18 }} /> Sửa
                </ActionButton>
                <ActionButton 
                  variant="toggle" 
                  onClick={() => handleTogglePublish(deck)}
                  style={{ background: deck.isPublished ? '#f59e0b' : '#10b981' }}
                >
                  {deck.isPublished ? (
                    <><VisibilityOff sx={{ fontSize: 18 }} /> Ẩn</>
                  ) : (
                    <><Public sx={{ fontSize: 18 }} /> Công khai</>
                  )}
                </ActionButton>
                <ActionButton variant="delete" onClick={() => handleDelete(deck)}>
                  <Delete sx={{ fontSize: 18 }} />
                </ActionButton>
              </ActionButtons>
            </DeckCard>
          ))}
        </DecksGrid>
      )}
    </AdminLayout>
  );
};

export default AdminDecks;