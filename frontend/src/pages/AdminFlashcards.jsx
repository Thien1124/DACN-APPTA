import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import { adminService } from '../services/adminService';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import Swal from 'sweetalert2';
import {
  Style,
  Add,
  FileCopy,
  Edit,
  Delete,
  NavigateBefore,
  NavigateNext,
  CardMembership
} from '@mui/icons-material';

// ========== STYLED COMPONENTS ==========

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const CreateButton = styled.button`
  background: ${props => props.variant === 'bulk' ? '#8b5cf6' : '#58CC02'};
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

const FilterBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  border-radius: 12px;
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 0.875rem;
  cursor: pointer;
  min-width: 200px;

  &:focus {
    outline: none;
    border-color: #58CC02;
  }
`;

const FlashcardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const FlashcardCard = styled.div`
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
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0,0,0,0.15);
  }
`;

const CardFront = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  text-align: center;
  margin-bottom: 1rem;
  padding: 1rem;
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#f9fafb'};
  border-radius: 8px;
`;

const CardBack = styled.div`
  font-size: 1.125rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  text-align: center;
  padding: 1rem;
  background: ${props => props.theme === 'dark' ? '#111827' : '#ffffff'};
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const CardInfo = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  text-align: center;
  margin-bottom: 1rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
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

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
`;

const PageButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid ${props => props.active ? '#58CC02' : '#e5e7eb'};
  background: ${props => props.active ? '#58CC02' : 'transparent'};
  color: ${props => props.active ? 'white' : '#6b7280'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.active ? '#45a302' : '#f3f4f6'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// ========== COMPONENT ==========

const AdminFlashcards = () => {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [theme] = useState('light');
  const [loading, setLoading] = useState(true);
  const [flashcards, setFlashcards] = useState([]);
  const [decks, setDecks] = useState([]);
  const [deckFilter, setDeckFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchFlashcards();
  }, [deckFilter, currentPage]);

  const fetchData = async () => {
    try {
      const decksResponse = await adminService.decks.getAll();
      setDecks(decksResponse.data || []);
    } catch (error) {
      console.error('Error fetching decks:', error);
    }
  };

  const fetchFlashcards = async () => {
    try {
      setLoading(true);
      let response;
      
      if (deckFilter !== 'all') {
        response = await adminService.flashcards.getByDeck(deckFilter);
      } else {
        response = await adminService.flashcards.getAll();
      }
      
      const allFlashcards = response.data || [];
      setTotalPages(Math.ceil(allFlashcards.length / itemsPerPage));
      
      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      setFlashcards(allFlashcards.slice(start, end));
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      showToast('error', 'Lỗi', 'Không thể tải danh sách flashcards');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    navigate('/admin/flashcards/create');
  };

  const handleBulkCreate = () => {
    navigate('/admin/flashcards/bulk-create');
  };

  const handleEdit = (flashcardId) => {
    navigate(`/admin/flashcards/edit/${flashcardId}`);
  };

  const handleDelete = async (flashcard) => {
    const result = await Swal.fire({
      title: 'Xác nhận xóa?',
      text: `Bạn có chắc muốn xóa flashcard này?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        await adminService.flashcards.delete(flashcard._id);
        showToast('success', 'Thành công', 'Đã xóa flashcard');
        fetchFlashcards();
      } catch (error) {
        showToast('error', 'Lỗi', error.response?.data?.message || 'Không thể xóa flashcard');
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout pageTitle="Quản lý Flashcards">
        <LoadingText theme={theme}>Đang tải dữ liệu...</LoadingText>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Quản lý Flashcards">
      <Toast toast={toast} onClose={hideToast} />

      <PageHeader>
        <Title theme={theme}>
          <Style sx={{ mr: 1 }} /> Flashcards ({flashcards.length})
        </Title>
        <ButtonGroup>
          <CreateButton onClick={handleCreate}>
            <Add />
            Tạo flashcard
          </CreateButton>
          <CreateButton variant="bulk" onClick={handleBulkCreate}>
            <FileCopy />
            Tạo hàng loạt
          </CreateButton>
        </ButtonGroup>
      </PageHeader>

      <FilterBar>
        <FilterSelect
          theme={theme}
          value={deckFilter}
          onChange={(e) => {
            setDeckFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="all">Tất cả decks</option>
          {decks.map(deck => (
            <option key={deck._id} value={deck._id}>
              {deck.name}
            </option>
          ))}
        </FilterSelect>
      </FilterBar>

      {flashcards.length === 0 ? (
        <EmptyState theme={theme}>
          <CardMembership sx={{ fontSize: 48, mb: 2, color: theme === 'dark' ? '#9ca3af' : '#6b7280' }} />
          <div>Chưa có flashcard nào</div>
          <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Nhấn nút "Tạo flashcard" để bắt đầu
          </div>
        </EmptyState>
      ) : (
        <>
          <FlashcardsGrid>
            {flashcards.map((flashcard) => (
              <FlashcardCard key={flashcard._id} theme={theme}>
                <CardFront theme={theme}>
                  {flashcard.front}
                </CardFront>
                <CardBack theme={theme}>
                  {flashcard.back}
                </CardBack>
                <CardInfo theme={theme}>
                  Deck: {flashcard.deck?.title || flashcard.deck?.name || 'N/A'}
                </CardInfo>
                <ActionButtons>
                  <ActionButton variant="edit" onClick={() => handleEdit(flashcard._id)}>
                    <Edit sx={{ fontSize: 18 }} /> Sửa
                  </ActionButton>
                  <ActionButton variant="delete" onClick={() => handleDelete(flashcard)}>
                    <Delete sx={{ fontSize: 18 }} /> Xóa
                  </ActionButton>
                </ActionButtons>
              </FlashcardCard>
            ))}
          </FlashcardsGrid>

          {totalPages > 1 && (
            <Pagination>
              <PageButton
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <NavigateBefore /> Trước
              </PageButton>
              {[...Array(totalPages)].map((_, index) => (
                <PageButton
                  key={index + 1}
                  active={currentPage === index + 1}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </PageButton>
              ))}
              <PageButton
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Sau <NavigateNext />
              </PageButton>
            </Pagination>
          )}
        </>
      )}
    </AdminLayout>
  );
};

export default AdminFlashcards;