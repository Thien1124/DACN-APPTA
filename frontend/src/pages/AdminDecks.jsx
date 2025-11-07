import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import { adminService } from '../services/adminService';
import { geminiService } from '../services/geminiService';
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
  Class,
  AutoAwesome,
  ChevronLeft,
  ChevronRight
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

const HeaderButtons = styled.div`
  display: flex;
  gap: 1rem;
`;

const CreateButton = styled.button`
  background: ${props => props.variant === 'ai' 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    : '#58CC02'
  };
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
    box-shadow: 0 8px 16px ${props => props.variant === 'ai'
      ? 'rgba(102, 126, 234, 0.4)'
      : 'rgba(88, 204, 2, 0.3)'
    };
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const DecksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
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
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  flex: 1;
  min-width: 80px;
  padding: 0.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  background: ${props => {
    if (props.variant === 'edit') return '#1CB0F6';
    if (props.variant === 'delete') return '#ef4444';
    if (props.variant === 'view') return '#8b5cf6';
    if (props.variant === 'ai') return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    return '#6b7280';
  }};
  color: white;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
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

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
`;

const PaginationButton = styled.button`
  background: ${props => props.theme === 'dark' ? '#374151' : '#f3f4f6'};
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  &:hover:not(:disabled) {
    background: #58CC02;
    color: white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PageInfo = styled.span`
  color: ${props => props.theme === 'dark' ? '#9ca3af' : '#6b7280'};
  font-weight: 600;
`;

// ========== COMPONENT ==========

const AdminDecks = () => {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [theme] = useState('light');
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(null);
  const [decks, setDecks] = useState([]);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    fetchDecks();
  }, []);

  // ✅ FIX: Sửa API call để khớp với backend
  const fetchDecks = async () => {
    try {
      setLoading(true);
      // ✅ Backend route: GET /api/decks/browse (public decks)
      // Hoặc GET /api/decks/my-decks (user's decks)
      const response = await adminService.decks.getAll(); 
      console.log('Admin decks response:', response);
      
      // ✅ Handle response format từ backend
      if (response.success && response.data) {
        setDecks(response.data.decks || response.data || []);
      } else {
        setDecks([]);
      }
    } catch (error) {
      console.error('Error fetching decks:', error);
      showToast('error', 'Lỗi', 'Không thể tải danh sách decks');
      setDecks([]);
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDecks = decks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(decks.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      text: `Bạn có chắc muốn xóa deck "${deck.title}"?`,
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
      showToast('success', 'Thành công', `Đã ${deck.isPublic ? 'ẩn' : 'công khai'} deck`);
      fetchDecks();
    } catch (error) {
      showToast('error', 'Lỗi', 'Không thể cập nhật trạng thái');
    }
  };

  // ✅ FIX: Sửa handleCreateDeckWithAI để khớp với backend API
  const handleCreateDeckWithAI = async () => {
    const { value: formValues } = await Swal.fire({
      title: '🤖 Tạo Deck với AI',
      html: `
        <div style="text-align: left;">
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">
              Tên Deck: *
            </label>
            <input 
              id="swal-deck-name" 
              class="swal2-input"
              placeholder="VD: Common English Verbs"
              style="width: 100%; margin: 0;"
            />
          </div>
          
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">
              Mô tả: *
            </label>
            <textarea 
              id="swal-deck-description" 
              class="swal2-textarea"
              placeholder="VD: Các động từ thông dụng trong tiếng Anh..."
              rows="2"
              style="width: 100%; margin: 0;"
            ></textarea>
          </div>

          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">
              Category:
            </label>
            <select id="swal-deck-category" class="swal2-select" style="width: 100%; margin: 0;">
              <option value="GENERAL">General - Tổng hợp</option>
              <option value="ACADEMIC">Academic - Học thuật</option>
              <option value="BUSINESS">Business - Kinh doanh</option>
              <option value="TRAVEL">Travel - Du lịch</option>
              <option value="FOOD">Food - Ẩm thực</option>
              <option value="HEALTH">Health - Y tế</option>
            </select>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
            <div>
              <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">
                Level:
              </label>
              <select id="swal-deck-level" class="swal2-select" style="width: 100%; margin: 0;">
                <option value="A1">A1 - Beginner</option>
                <option value="A2">A2 - Elementary</option>
                <option value="B1">B1 - Intermediate</option>
                <option value="B2">B2 - Upper Intermediate</option>
                <option value="C1">C1 - Advanced</option>
                <option value="C2">C2 - Mastery</option>
              </select>
            </div>

            <div>
              <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">
                Difficulty:
              </label>
              <select id="swal-deck-difficulty" class="swal2-select" style="width: 100%; margin: 0;">
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
          </div>

          <div style="margin-bottom: 1rem; padding: 1rem; background: #f3f4f6; border-radius: 8px;">
            <label style="display: flex; align-items: center; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">
              <input type="checkbox" id="swal-auto-generate" style="margin-right: 0.5rem;" checked />
              Tự động tạo flashcards với AI
            </label>
            <p style="margin: 0.5rem 0 0 1.5rem; font-size: 0.875rem; color: #6b7280;">
              ✨ AI sẽ tự động tạo 10 flashcards phù hợp với chủ đề
            </p>
          </div>

          <div id="manual-words-section" style="display: none; margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">
              Danh sách từ vựng (mỗi từ một dòng):
            </label>
            <textarea 
              id="swal-words-input" 
              class="swal2-textarea"
              placeholder="beautiful&#10;amazing&#10;wonderful&#10;fantastic&#10;excellent"
              rows="6"
              style="width: 100%; font-family: monospace; resize: vertical; margin: 0;"
            ></textarea>
            <p style="margin-top: 0.5rem; font-size: 0.875rem; color: #9ca3af;">
              💡 Tối đa 10 từ mỗi lần
            </p>
          </div>

          <script>
            document.getElementById('swal-auto-generate').addEventListener('change', function(e) {
              const manualSection = document.getElementById('manual-words-section');
              manualSection.style.display = e.target.checked ? 'none' : 'block';
            });
          </script>
        </div>
      `,
      width: '600px',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: '✨ Tạo với AI',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#667eea',
      preConfirm: () => {
        const deckName = document.getElementById('swal-deck-name').value;
        const deckDescription = document.getElementById('swal-deck-description').value;
        const deckCategory = document.getElementById('swal-deck-category').value;
        const deckLevel = document.getElementById('swal-deck-level').value;
        const deckDifficulty = document.getElementById('swal-deck-difficulty').value;
        const autoGenerate = document.getElementById('swal-auto-generate').checked;
        const wordsInput = document.getElementById('swal-words-input')?.value || '';
        
        if (!deckName.trim()) {
          Swal.showValidationMessage('⚠️ Vui lòng nhập tên deck');
          return false;
        }

        if (!deckDescription.trim()) {
          Swal.showValidationMessage('⚠️ Vui lòng nhập mô tả deck');
          return false;
        }

        if (!autoGenerate && !wordsInput.trim()) {
          Swal.showValidationMessage('⚠️ Vui lòng nhập danh sách từ hoặc chọn tự động tạo');
          return false;
        }
        
        return { 
          deckName, 
          deckDescription,
          deckCategory, 
          deckLevel, 
          deckDifficulty, 
          autoGenerate,
          wordsInput 
        };
      }
    });

    if (formValues) {
      const { 
        deckName, 
        deckDescription,
        deckCategory, 
        deckLevel, 
        deckDifficulty, 
        autoGenerate,
        wordsInput 
      } = formValues;

      try {
        setLoading(true);
        showToast('info', 'Đang xử lý', '🤖 Đang tạo deck...');

        // ✅ Step 1: Tạo deck mới - Khớp với backend POST /api/decks
        const deckData = {
          title: deckName,
          description: deckDescription,
          category: deckCategory,
          level: deckLevel,
          difficulty: deckDifficulty,
          isPublic: false
        };

        const deckResponse = await adminService.decks.create(deckData);
        console.log('Create deck response:', deckResponse);
        
        // ✅ Validate response
        if (!deckResponse?.success || !deckResponse?.data?._id) {
          throw new Error('Không thể tạo deck - response không hợp lệ');
        }

        const newDeckId = deckResponse.data._id;

        // ✅ Step 2: Tạo flashcards với AI
        let words = [];
        
        if (autoGenerate) {
          words = generateWordsFromDeckInfo(deckName, deckDescription, deckCategory, 10);
        } else {
          words = wordsInput
            .split('\n')
            .map(word => word.trim())
            .filter(word => word.length > 0)
            .slice(0, 10); // Limit to 10 words
        }

        if (words.length === 0) {
          try {
            await adminService.decks.delete(newDeckId);
          } catch (err) {
            console.error('Failed to cleanup empty deck:', err);
          }
          showToast('warning', 'Cảnh báo', 'Không có từ nào để tạo flashcard');
          setLoading(false);
          return;
        }

        showToast('info', 'Đang xử lý', `🤖 AI đang phân tích ${words.length} từ...`);

        // ✅ Call backend API: POST /api/ai/batch-create
        const createResult = await geminiService.batchCreate(newDeckId, words);
        console.log('Batch create result:', createResult);

        // ✅ Validate kết quả theo backend response format
        if (!createResult?.success) {
          throw new Error(createResult?.message || 'Không thể tạo flashcards với AI');
        }

        // ✅ Backend trả về: { success: true, message: "...", data: [flashcards] }
        const createdCount = Array.isArray(createResult.data) 
          ? createResult.data.length 
          : (createResult.data?.count || 0);
        
        showToast(
          'success',
          'Thành công',
          `✅ Đã tạo deck "${deckName}" với ${createdCount} flashcards`
        );
        
        await fetchDecks();
        
        setTimeout(() => {
          navigate(`/admin/decks/${newDeckId}`);
        }, 1500);

      } catch (error) {
        console.error('Create deck with AI error:', error);
        showToast(
          'error',
          'Lỗi',
          error.response?.data?.message || error.message || 'Không thể tạo deck với AI'
        );
      } finally {
        setLoading(false);
      }
    }
  };

  // Helper function: Generate words từ deck info
  const generateWordsFromDeckInfo = (name, description, category, count = 10) => {
    // Tạo từ khóa dựa vào category và tên deck
    const categoryKeywords = {
      'GENERAL': ['hello', 'goodbye', 'please', 'thank', 'sorry', 'help', 'yes', 'no', 'maybe', 'okay'],
      'ACADEMIC': ['study', 'learn', 'research', 'analyze', 'conclude', 'hypothesis', 'theory', 'experiment', 'data', 'evidence'],
      'BUSINESS': ['negotiate', 'contract', 'proposal', 'deadline', 'revenue', 'profit', 'strategy', 'marketing', 'sales', 'budget'],
      'TRAVEL': ['airport', 'hotel', 'reservation', 'passport', 'luggage', 'destination', 'ticket', 'boarding', 'departure', 'arrival'],
      'FOOD': ['restaurant', 'menu', 'order', 'delicious', 'recipe', 'ingredients', 'cooking', 'breakfast', 'lunch', 'dinner'],
      'HEALTH': ['doctor', 'hospital', 'medicine', 'treatment', 'symptom', 'diagnosis', 'patient', 'healthy', 'exercise', 'nutrition']
    };

    // Lấy từ khóa từ category
    let words = categoryKeywords[category] || categoryKeywords['GENERAL'];

    // Nếu tên deck có từ đặc biệt, ưu tiên từ đó
    const nameWords = name.toLowerCase().split(/\s+/);
    const descWords = description.toLowerCase().split(/\s+/);
    
    // Lọc các từ tiếng Anh hợp lệ
    const relevantWords = [...nameWords, ...descWords].filter(w => 
      w.length > 3 && /^[a-z]+$/.test(w)
    );

    // Kết hợp và lấy unique
    words = [...new Set([...relevantWords, ...words])];

    return words.slice(0, count);
  };

  // ✅ FIX: Sửa handleGenerateAI để khớp với backend API
  const handleGenerateAI = async (deck) => {
    const { value: formValues } = await Swal.fire({
      title: '🤖 Thêm Flashcards với AI',
      html: `
        <div style="text-align: left;">
          <p style="margin-bottom: 1rem; padding: 0.75rem; background: #e0e7ff; border-radius: 8px; color: #374151;">
            📚 Deck: <strong>${deck.title}</strong>
          </p>

          <div style="margin-bottom: 1rem;">
            <label style="display: flex; align-items: center; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">
              <input type="checkbox" id="swal-auto-generate-add" style="margin-right: 0.5rem;" checked />
              Tự động tạo flashcards
            </label>
            <p style="margin: 0.5rem 0 0 1.5rem; font-size: 0.875rem; color: #6b7280;">
              ✨ AI sẽ tạo 10 flashcards dựa vào chủ đề của deck
            </p>
          </div>

          <div id="manual-words-section-add" style="display: none;">
            <label style="display: block; margin-bottom: 0.5rem; color: #374151; font-weight: 600;">
              Danh sách từ vựng (mỗi từ một dòng):
            </label>
            <textarea 
              id="swal-words-input-add" 
              class="swal2-textarea"
              placeholder="beautiful&#10;amazing&#10;wonderful"
              rows="8"
              style="width: 100%; font-family: monospace; resize: vertical;"
            ></textarea>
            <p style="margin-top: 0.5rem; font-size: 0.875rem; color: #9ca3af;">
              💡 Tối đa 10 từ mỗi lần
            </p>
          </div>

          <script>
            document.getElementById('swal-auto-generate-add').addEventListener('change', function(e) {
              const manualSection = document.getElementById('manual-words-section-add');
              manualSection.style.display = e.target.checked ? 'none' : 'block';
            });
          </script>
        </div>
      `,
      width: '500px',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: '✨ Tạo flashcards',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#667eea',
      preConfirm: () => {
        const autoGenerate = document.getElementById('swal-auto-generate-add').checked;
        const wordsInput = document.getElementById('swal-words-input-add')?.value || '';
        
        if (!autoGenerate && !wordsInput.trim()) {
          Swal.showValidationMessage('⚠️ Vui lòng nhập danh sách từ hoặc chọn tự động tạo');
          return false;
        }
        
        return { autoGenerate, wordsInput };
      }
    });

    if (formValues) {
      const { autoGenerate, wordsInput } = formValues;

      try {
        setAiLoading(deck._id);
        
        let words = [];
        
        if (autoGenerate) {
          words = generateWordsFromDeckInfo(
            deck.title, 
            deck.description || '', 
            deck.category || 'GENERAL', 
            10
          );
        } else {
          words = wordsInput
            .split('\n')
            .map(word => word.trim())
            .filter(word => word.length > 0)
            .slice(0, 10);
        }

        if (words.length === 0) {
          showToast('warning', 'Cảnh báo', 'Không có từ nào để tạo');
          setAiLoading(null);
          return;
        }

        showToast('info', 'Đang xử lý', `🤖 AI đang phân tích ${words.length} từ...`);

        // ✅ Call backend API: POST /api/ai/batch-create
        const createResult = await geminiService.batchCreate(deck._id, words);
        console.log('Add AI flashcards result:', createResult);

        // ✅ Validate theo backend response
        if (!createResult?.success) {
          throw new Error(createResult?.message || 'Không thể tạo flashcards');
        }

        const createdCount = Array.isArray(createResult.data)
          ? createResult.data.length
          : (createResult.data?.count || 0);

        showToast(
          'success',
          'Thành công',
          `✅ Đã thêm ${createdCount} flashcards vào deck`
        );
        
        await fetchDecks();

      } catch (error) {
        console.error('Generate AI error:', error);
        showToast(
          'error',
          'Lỗi',
          error.response?.data?.message || error.message || 'Không thể tạo flashcards'
        );
      } finally {
        setAiLoading(null);
      }
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
        <HeaderButtons>
          <CreateButton variant="ai" onClick={handleCreateDeckWithAI}>
            <AutoAwesome />
            Tạo Deck + AI
          </CreateButton>
          <CreateButton onClick={handleCreate}>
            <Add />
            Tạo deck mới
          </CreateButton>
        </HeaderButtons>
      </PageHeader>

      {decks.length === 0 ? (
        <EmptyState theme={theme}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗂️</div>
          <div>Chưa có deck nào</div>
          <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Nhấn nút "Tạo deck mới" hoặc "Tạo Deck + AI" để bắt đầu
          </div>
        </EmptyState>
      ) : (
        <>
          <DecksGrid>
            {currentDecks.map((deck) => (
              <DeckCard key={deck._id} theme={theme}>
                <DeckIcon>🎴</DeckIcon>
                
                <DeckTitle theme={theme}>{deck.title}</DeckTitle>
                <DeckDescription theme={theme}>
                  {deck.description || 'Không có mô tả'}
                </DeckDescription>
                
                <DeckStats theme={theme}>
                  <Stat theme={theme}>
                    <Class sx={{ fontSize: 18 }} />
                    {deck.category || 'N/A'}
                  </Stat>
                  <Stat theme={theme}>
                    <Style sx={{ fontSize: 18 }} />
                    {deck.totalCards || 0} thẻ
                  </Stat>
                </DeckStats>

                <StatusBadge published={deck.isPublic}>
                  {deck.isPublic ? 'Công khai' : 'Nháp'}
                </StatusBadge>

                <ActionButtons>
                  <ActionButton variant="view" onClick={() => handleView(deck._id)}>
                    <Visibility sx={{ fontSize: 18 }} /> Xem
                  </ActionButton>
                  <ActionButton variant="edit" onClick={() => handleEdit(deck._id)}>
                    <Edit sx={{ fontSize: 18 }} /> Sửa
                  </ActionButton>
                  
                  <ActionButton 
                    variant="ai" 
                    onClick={() => handleGenerateAI(deck)}
                    disabled={aiLoading === deck._id}
                  >
                    <AutoAwesome sx={{ fontSize: 18 }} />
                    {aiLoading === deck._id ? 'Đang tạo...' : 'AI'}
                  </ActionButton>

                  <ActionButton 
                    variant="toggle" 
                    onClick={() => handleTogglePublish(deck)}
                    style={{ background: deck.isPublic ? '#f59e0b' : '#10b981' }}
                  >
                    {deck.isPublic ? (
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

          {totalPages > 1 && (
            <PaginationContainer>
              <PaginationButton
                theme={theme}
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                <ChevronLeft /> Trước
              </PaginationButton>
              
              <PageInfo theme={theme}>
                Trang {currentPage} / {totalPages}
              </PageInfo>
              
              <PaginationButton
                theme={theme}
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Sau <ChevronRight />
              </PaginationButton>
            </PaginationContainer>
          )}
        </>
      )}
    </AdminLayout>
  );
};

export default AdminDecks;