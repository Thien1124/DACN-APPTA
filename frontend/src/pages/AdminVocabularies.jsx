import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import { adminService } from '../services/adminService';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import Swal from 'sweetalert2';

import {
  Translate,
  Add,
  FileCopy,
  Search,
  VolumeUp,
  Edit,
  Delete,
  NavigateBefore,
  NavigateNext,
  AutoAwesome as AiIcon,
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
  background: ${props => {
    if (props.variant === 'bulk') return '#8b5cf6';
    if (props.variant === 'ai') return '#1CB0F6';
    return '#58CC02';
  }};
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
    box-shadow: ${props => {
      if (props.variant === 'bulk') return '0 8px 16px rgba(139, 92, 246, 0.3)';
      if (props.variant === 'ai') return '0 8px 16px rgba(28, 176, 246, 0.3)';
      return '0 8px 16px rgba(88, 204, 2, 0.3)';
    }};
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 300px;
  padding: 0.75rem 1rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  border-radius: 12px;
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: #58CC02;
  }
`;

const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  border-radius: 12px;
  background: ${props => props.theme === 'dark' ? '#1f2937' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  font-size: 0.875rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #58CC02;
  }
`;

const TableContainer = styled.div`
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
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 1rem;
  border-bottom: 2px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-weight: 600;
  font-size: 0.875rem;
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#374151' : '#e5e7eb'};
  color: ${props => props.theme === 'dark' ? '#d1d5db' : '#4b5563'};
  font-size: 0.875rem;
`;

const VocabWord = styled.div`
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 0.25rem;
`;

const VocabMeaning = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
`;

const VocabPronunciation = styled.div`
  font-size: 0.75rem;
  color: #1CB0F6;
  font-style: italic;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => {
    if (props.variant === 'edit') return '#1CB0F6';
    if (props.variant === 'delete') return '#ef4444';
    if (props.variant === 'audio') return '#8b5cf6';
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
  margin-top: 1.5rem;
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

const AdminVocabularies = () => {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [theme] = useState('light');
  const [loading, setLoading] = useState(true);
  const [vocabularies, setVocabularies] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [lessonFilter, setLessonFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLessons();
    fetchVocabularies();
  }, []);

  useEffect(() => {
    fetchVocabularies();
  }, [currentPage, lessonFilter, searchTerm]);

  const fetchLessons = async () => {
    try {
      const response = await adminService.lessons.getAll();
      setLessons(response.data || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };

  const fetchVocabularies = async () => {
    try {
      setLoading(true);
      
      let response;
      if (lessonFilter !== 'all') {
        response = await adminService.vocabularies.getByLesson(lessonFilter);
      } else {
        response = await adminService.vocabularies.getAll();
      }

      let vocabs = response.data || [];

      // Filter by search term
      if (searchTerm) {
        vocabs = vocabs.filter(v => 
          v.word?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.meaning?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Pagination
      const itemsPerPage = 20;
      const total = Math.ceil(vocabs.length / itemsPerPage);
      setTotalPages(total);
      
      const startIndex = (currentPage - 1) * itemsPerPage;
      const paginatedVocabs = vocabs.slice(startIndex, startIndex + itemsPerPage);
      
      setVocabularies(paginatedVocabs);
    } catch (error) {
      console.error('Error fetching vocabularies:', error);
      showToast('error', 'Lỗi', 'Không thể tải danh sách từ vựng');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    navigate('/admin/vocabularies/create');
  };

  const handleBulkCreate = () => {
    navigate('/admin/vocabularies/bulk-create');
  };

  const handleAICreate = () => {
    navigate('/admin/vocabularies/ai-create');
  };

  const handleEdit = (vocabId) => {
    navigate(`/admin/vocabularies/edit/${vocabId}`);
  };

  const handleDelete = async (vocab) => {
    const result = await Swal.fire({
      title: 'Xác nhận xóa?',
      text: `Bạn có chắc muốn xóa từ vựng "${vocab.word}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        await adminService.vocabularies.delete(vocab._id);
        showToast('success', 'Thành công', 'Đã xóa từ vựng');
        fetchVocabularies();
      } catch (error) {
        showToast('error', 'Lỗi', error.response?.data?.message || 'Không thể xóa từ vựng');
      }
    }
  };

  const handlePlayAudio = (audioUrl) => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(err => {
        showToast('error', 'Lỗi', 'Không thể phát audio');
      });
    } else {
      showToast('warning', 'Thông báo', 'Từ vựng này chưa có audio');
    }
  };

  if (loading) {
    return (
      <AdminLayout pageTitle="Quản lý Từ vựng">
        <LoadingText theme={theme}>Đang tải dữ liệu...</LoadingText>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Quản lý Từ vựng">
      <Toast toast={toast} onClose={hideToast} />

      <PageHeader>
        <Title theme={theme}>
          <Translate sx={{ mr: 1 }} /> Từ vựng ({vocabularies.length})
        </Title>
        <ButtonGroup>
          <CreateButton onClick={handleCreate}>
            <Add />
            Thêm từ mới
          </CreateButton>
          <CreateButton variant="bulk" onClick={handleBulkCreate}>
            <FileCopy />
            Thêm hàng loạt
          </CreateButton>
          <CreateButton variant="ai" onClick={handleAICreate}>
            <AiIcon sx={{ fontSize: 20 }} />
            Tạo AI từ vựng
          </CreateButton>
        </ButtonGroup>
      </PageHeader>

      <FilterBar>
        <SearchInput
          theme={theme}
          type="text"
          placeholder="Tìm kiếm từ vựng hoặc nghĩa..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FilterSelect
          theme={theme}
          value={lessonFilter}
          onChange={(e) => {
            setLessonFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="all">Tất cả bài học</option>
          {lessons.map(lesson => (
            <option key={lesson._id} value={lesson._id}>
              {lesson.title}
            </option>
          ))}
        </FilterSelect>
      </FilterBar>

      {vocabularies.length === 0 ? (
        <EmptyState theme={theme}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
          <div>Chưa có từ vựng nào</div>
          <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Nhấn nút "Thêm từ mới" để bắt đầu
          </div>
        </EmptyState>
      ) : (
        <TableContainer theme={theme}>
          <Table>
            <thead>
              <tr>
                <Th theme={theme}>Từ vựng</Th>
                <Th theme={theme}>Bài học</Th>
                <Th theme={theme}>Ví dụ</Th>
                <Th theme={theme}>Hành động</Th>
              </tr>
            </thead>
            <tbody>
              {vocabularies.map((vocab) => (
                <tr key={vocab._id}>
                  <Td theme={theme}>
                    <VocabWord theme={theme}>{vocab.word}</VocabWord>
                    <VocabPronunciation>{vocab.pronunciation}</VocabPronunciation>
                    <VocabMeaning theme={theme}>{vocab.meaning}</VocabMeaning>
                  </Td>
                  <Td theme={theme}>{vocab.lesson?.title || '-'}</Td>
                  <Td theme={theme}>
                    <div style={{ maxWidth: '300px', fontSize: '0.75rem' }}>
                      {vocab.exampleSentence || '-'}
                    </div>
                  </Td>
                  <Td theme={theme}>
                    <ActionButtons>
                      {vocab.audioUrl && (
                        <ActionButton 
                          variant="audio" 
                          onClick={() => handlePlayAudio(vocab.audioUrl)}
                          title="Phát audio"
                        >
                          <VolumeUp sx={{ fontSize: 18 }} />
                        </ActionButton>
                      )}
                      <ActionButton 
                        variant="edit" 
                        onClick={() => handleEdit(vocab._id)}
                        title="Sửa"
                      >
                        <Edit sx={{ fontSize: 18 }} />
                      </ActionButton>
                      <ActionButton 
                        variant="delete" 
                        onClick={() => handleDelete(vocab)}
                        title="Xóa"
                      >
                        <Delete sx={{ fontSize: 18 }} />
                      </ActionButton>
                    </ActionButtons>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>

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
        </TableContainer>
      )}
    </AdminLayout>
  );
};

export default AdminVocabularies;