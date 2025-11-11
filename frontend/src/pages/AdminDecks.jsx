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

  // ✅ Sửa handleCreateDeckWithAI với form đẹp hơn
  const handleCreateDeckWithAI = async () => {
    const { value: formValues } = await Swal.fire({
      title: '<span style="color: #667eea;">Tạo Deck với AI</span>',
      html: `
        <div style="text-align: left; max-height: 70vh; overflow-y: auto; padding: 0.5rem;">
          <!-- Tên Deck -->
          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: #1e293b; font-weight: 700; font-size: 0.9rem;">
              Tên Deck <span style="color: #ef4444;">*</span>
            </label>
            <input 
              id="swal-deck-name" 
              class="swal2-input"
              placeholder="VD: Common English Verbs"
              style="width: 100%; margin: 0; padding: 0.875rem; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 0.95rem; transition: all 0.3s;"
              onfocus="this.style.borderColor='#667eea'; this.style.boxShadow='0 0 0 3px rgba(102,126,234,0.1)';"
              onblur="this.style.borderColor='#e2e8f0'; this.style.boxShadow='none';"
            />
          </div>
          
          <!-- Mô tả -->
          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: #1e293b; font-weight: 700; font-size: 0.9rem;">
              Mô tả <span style="color: #ef4444;">*</span>
            </label>
            <textarea 
              id="swal-deck-description" 
              class="swal2-textarea"
              placeholder="VD: Các động từ thông dụng trong tiếng Anh..."
              rows="3"
              style="width: 100%; margin: 0; padding: 0.875rem; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 0.95rem; resize: vertical; transition: all 0.3s;"
              onfocus="this.style.borderColor='#667eea'; this.style.boxShadow='0 0 0 3px rgba(102,126,234,0.1)';"
              onblur="this.style.borderColor='#e2e8f0'; this.style.boxShadow='none';"
            ></textarea>
          </div>

          <!-- Category & Tags Row -->
          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
            <div>
              <label style="display: block; margin-bottom: 0.5rem; color: #1e293b; font-weight: 700; font-size: 0.9rem;">
                Category
              </label>
              <select id="swal-deck-category" class="swal2-select" style="width: 100%; margin: 0; padding: 0.875rem; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 0.95rem; background: white; cursor: pointer;">
                <option value="GENERAL">General - Tổng hợp</option>
                <option value="ACADEMIC">Academic - Học thuật</option>
                <option value="BUSINESS">Business - Kinh doanh</option>
                <option value="TRAVEL">Travel - Du lịch</option>
                <option value="FOOD">Food - Ẩm thực</option>
                <option value="HEALTH">Health - Y tế</option>
                <option value="TECHNOLOGY">Technology - Công nghệ</option>
                <option value="DAILY_LIFE">Daily Life - Cuộc sống</option>
              </select>
            </div>

            <div>
              <label style="display: block; margin-bottom: 0.5rem; color: #1e293b; font-weight: 700; font-size: 0.9rem;">
                Level
              </label>
              <select id="swal-deck-level" class="swal2-select" style="width: 100%; margin: 0; padding: 0.875rem; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 0.95rem; background: white; cursor: pointer;">
                <option value="A1">A1</option>
                <option value="A2">A2</option>
                <option value="B1" selected>B1</option>
                <option value="B2">B2</option>
                <option value="C1">C1</option>
                <option value="C2">C2</option>
              </select>
            </div>
          </div>

          <!-- Difficulty & Card Count -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
            <div>
              <label style="display: block; margin-bottom: 0.5rem; color: #1e293b; font-weight: 700; font-size: 0.9rem;">
                Difficulty
              </label>
              <select id="swal-deck-difficulty" class="swal2-select" style="width: 100%; margin: 0; padding: 0.875rem; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 0.95rem; background: white; cursor: pointer;">
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE" selected>Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>

            <div>
              <label style="display: block; margin-bottom: 0.5rem; color: #1e293b; font-weight: 700; font-size: 0.9rem;">
                Số thẻ tạo
              </label>
              <input 
                type="number" 
                id="swal-card-count" 
                class="swal2-input"
                value="10"
                min="5"
                max="20"
                style="width: 100%; margin: 0; padding: 0.875rem; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 0.95rem;"
              />
            </div>
          </div>

          <!-- AI Generation Mode -->
          <div style="margin-bottom: 1.5rem; padding: 1.25rem; background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%); border: 2px solid #667eea40; border-radius: 12px;">
            <label style="display: flex; align-items: center; margin-bottom: 0.75rem; cursor: pointer;">
              <input type="checkbox" id="swal-auto-generate" style="width: 20px; height: 20px; margin-right: 0.75rem; cursor: pointer; accent-color: #667eea;" checked />
              <span style="color: #1e293b; font-weight: 700; font-size: 1rem;">
                Tự động tạo flashcards với AI
              </span>
            </label>
            <p style="margin: 0 0 0 2rem; font-size: 0.875rem; color: #475569; line-height: 1.6;">
              AI sẽ tự động phân tích và tạo flashcards dựa trên tên và mô tả deck của bạn
            </p>
          </div>

          <!-- Manual Input Section -->
          <div id="manual-words-section" style="display: none; margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: #1e293b; font-weight: 700; font-size: 0.9rem;">
              Danh sách từ vựng
            </label>
            <textarea 
              id="swal-words-input" 
              class="swal2-textarea"
              placeholder="Nhập mỗi từ trên một dòng:&#10;beautiful&#10;amazing&#10;wonderful&#10;fantastic&#10;excellent"
              rows="8"
              style="width: 100%; margin: 0; padding: 0.875rem; border: 2px solid #e2e8f0; border-radius: 10px; font-family: 'Courier New', monospace; font-size: 0.9rem; resize: vertical;"
            ></textarea>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.75rem; padding: 0.75rem; background: #fef3c7; border-radius: 8px;">
              <span style="font-size: 1.25rem;">💡</span>
              <p style="margin: 0; font-size: 0.875rem; color: #92400e; font-weight: 600;">
                Tối đa 20 từ mỗi lần. Mỗi từ một dòng.
              </p>
            </div>
          </div>

          <!-- Tags (Optional) -->
          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; color: #1e293b; font-weight: 700; font-size: 0.9rem;">
              Tags (tùy chọn)
            </label>
            <input 
              id="swal-deck-tags" 
              class="swal2-input"
              placeholder="VD: vocabulary, beginner, daily"
              style="width: 100%; margin: 0; padding: 0.875rem; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 0.95rem;"
            />
            <p style="margin: 0.5rem 0 0 0; font-size: 0.8rem; color: #64748b;">
              Phân cách bằng dấu phẩy
            </p>
          </div>

          <!-- Image Option -->
          <div style="margin-bottom: 1.5rem; padding: 1.25rem; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; border-radius: 12px;">
            <label style="display: flex; align-items: center; cursor: pointer;">
              <input type="checkbox" id="swal-use-images-create" style="width: 18px; height: 18px; margin-right: 0.75rem; cursor: pointer; accent-color: #10b981;" />
              <span style="color: #166534; font-weight: 600; font-size: 0.875rem;">
                Tự động tạo hình ảnh minh họa bằng AI (DALL-E)
              </span>
            </label>
            <p style="margin: 0.5rem 0 0 2rem; font-size: 0.75rem; color: #15803d;">
              ⚠️ Yêu cầu OpenAI API key có billing. Nếu không có, flashcards sẽ được tạo không có ảnh.
            </p>
          </div>

          <script>
            const autoCheckbox = document.getElementById('swal-auto-generate');
            const manualSection = document.getElementById('manual-words-section');
            
            autoCheckbox.addEventListener('change', function(e) {
              manualSection.style.display = e.target.checked ? 'none' : 'block';
              
              // Animation
              if (!e.target.checked) {
                manualSection.style.animation = 'slideIn 0.3s ease';
              }
            });

            // Add animation keyframes
            const style = document.createElement('style');
            style.textContent = \`
              @keyframes slideIn {
                from {
                  opacity: 0;
                  transform: translateY(-10px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            \`;
            document.head.appendChild(style);
          </script>
        </div>
      `,
      width: '680px',
      padding: '2rem',
      background: '#ffffff',
      backdrop: 'rgba(0,0,0,0.4)',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: '<span style="font-size: 1.1rem;">✨ Tạo Deck với AI</span>',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#667eea',
      cancelButtonColor: '#94a3b8',
      buttonsStyling: true,
      customClass: {
        confirmButton: 'swal2-confirm-custom',
        cancelButton: 'swal2-cancel-custom'
      },
      didOpen: () => {
        // Add custom button styles
        const style = document.createElement('style');
        style.textContent = `
          .swal2-confirm-custom {
            padding: 0.875rem 2rem !important;
            font-weight: 700 !important;
            border-radius: 10px !important;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4) !important;
            transition: all 0.3s !important;
          }
          .swal2-confirm-custom:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5) !important;
          }
          .swal2-cancel-custom {
            padding: 0.875rem 2rem !important;
            font-weight: 600 !important;
            border-radius: 10px !important;
          }
        `;
        document.head.appendChild(style);
      },
      preConfirm: () => {
        const deckName = document.getElementById('swal-deck-name').value.trim();
        const deckDescription = document.getElementById('swal-deck-description').value.trim();
        const deckCategory = document.getElementById('swal-deck-category').value;
        const deckLevelSelect = document.getElementById('swal-deck-level');
        const deckLevel = deckLevelSelect ? deckLevelSelect.value : 'INTERMEDIATE';
        const deckDifficulty = document.getElementById('swal-deck-difficulty').value;
        const cardCount = parseInt(document.getElementById('swal-card-count').value) || 10;
        const autoGenerate = document.getElementById('swal-auto-generate').checked;
        const wordsInput = document.getElementById('swal-words-input')?.value || '';
        const tagsInput = document.getElementById('swal-deck-tags').value.trim();
        
        // Validation
        if (!deckName) {
          Swal.showValidationMessage('Vui lòng nhập tên deck');
          return false;
        }

        if (deckName.length < 3) {
          Swal.showValidationMessage('Tên deck phải có ít nhất 3 ký tự');
          return false;
        }

        if (!deckDescription) {
          Swal.showValidationMessage('Vui lòng nhập mô tả deck');
          return false;
        }

        if (deckDescription.length < 10) {
          Swal.showValidationMessage('Mô tả phải có ít nhất 10 ký tự');
          return false;
        }

        if (!autoGenerate && !wordsInput.trim()) {
          Swal.showValidationMessage('Vui lòng nhập danh sách từ hoặc chọn tự động tạo');
          return false;
        }

        if (cardCount < 5 || cardCount > 20) {
          Swal.showValidationMessage('Số thẻ phải từ 5 đến 20');
          return false;
        }

        // Parse tags
        const tags = tagsInput
          ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag)
          : [];
        
        return { 
          deckName, 
          deckDescription,
          deckCategory, 
          deckLevel, 
          deckDifficulty,
          cardCount,
          autoGenerate,
          wordsInput,
          tags
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
        cardCount,
        autoGenerate,
        wordsInput,
        tags
      } = formValues;

      try {
        setLoading(true);
        showToast('info', 'Đang xử lý', '🤖 Đang tạo deck...');

        // ✅ Step 1: Tạo deck - Khớp với POST /api/decks
        const deckData = {
          title: deckName,
          description: deckDescription,
          category: deckCategory,
          level: deckLevel,
          difficulty: deckDifficulty,
          tags: tags,
          isPublic: false
        };

        const deckResponse = await adminService.decks.create(deckData);
        console.log('✅ Create deck response:', deckResponse);
        
        if (!deckResponse?.success || !deckResponse?.data?._id) {
          throw new Error('Không thể tạo deck');
        }

        const newDeckId = deckResponse.data._id;

        // ✅ Step 2: Tạo flashcards với AI - Khớp với POST /api/ai/batch-create
        let words = [];
        
        if (autoGenerate) {
          try {
            // ✅ Truyền level vào generate function
            words = await generateWordsFromDeckInfo(
              deckName, 
              deckDescription, 
              deckCategory, 
              deckLevel, // ✅ Truyền level từ form
              cardCount
            );
            
            console.log(`✅ Auto generated ${words.length} words (level: ${deckLevel}) for ${cardCount} cards`);
          } catch (aiError) {
            console.error('❌ AI generation failed:', aiError);
            
            // ✅ Hiển thị lỗi chi tiết cho user
            await Swal.fire({
              icon: 'error',
              title: 'Không thể tạo từ vựng tự động',
              html: `
                <div style="text-align: left;">
                  <p><strong>Lỗi:</strong> ${aiError.message}</p>
                  <p style="margin-top: 1rem;">Vui lòng:</p>
                  <ul style="margin-top: 0.5rem;">
                    <li>Kiểm tra API key Gemini có hợp lệ không</li>
                    <li>Thử lại với tên/mô tả deck rõ ràng hơn</li>
                    <li>Hoặc bỏ check "Tự động tạo" và nhập từ thủ công</li>
                  </ul>
                </div>
              `,
              confirmButtonColor: '#ef4444',
              confirmButtonText: 'Đã hiểu',
              width: '600px'
            });
            
            setLoading(false);
            return; // ✅ Dừng tạo deck nếu AI fail
          }
        } else {
          // Parse manual input
          words = wordsInput
            .split('\n')
            .map(word => word.trim())
            .filter(word => word.length > 0)
            .slice(0, 20);
        }

        // ✅ Validate số lượng words
        if (words.length === 0) {
          // Cleanup empty deck
          try {
            await adminService.decks.delete(newDeckId);
          } catch (err) {
            console.error('Failed to cleanup deck:', err);
          }
          showToast('warning', 'Cảnh báo', 'Không có từ nào để tạo flashcard');
          setLoading(false);
          return;
        }

        // ✅ Log để debug
        console.log(`📊 Final words to create (${words.length}):`, words);

        showToast('info', 'Đang xử lý', `🤖 AI đang phân tích ${words.length} từ...`);

        // ✅ Option trong form để chọn có muốn thêm hình ảnh không
        const useImagesCheckbox = document.getElementById('swal-use-images-create');
        const useImages = useImagesCheckbox ? useImagesCheckbox.checked : true;

        // ✅ Dùng API khác nhau tùy vào có hình ảnh hay không
        let createResult;
        if (useImages) {
          console.log('🖼️ Calling batchCreateWithImages...');
          createResult = await geminiService.batchCreateWithImages(newDeckId, words);
        } else {
          console.log('📝 Calling batchCreate (no images)...');
          createResult = await geminiService.batchCreate(newDeckId, words);
        }

        console.log('✅ Batch create result:', createResult);

        if (!createResult?.success) {
          throw new Error(createResult?.message || 'Không thể tạo flashcards với AI');
        }
        
        const createdCount = Array.isArray(createResult.data)
          ? createResult.data.length
          : (createResult.data?.count || 0);

        // ✅ Check image generation status
        const imageStats = createResult.imageStats || {};
        const hasImageIssue = imageStats.attempted > 0 && imageStats.successful === 0;
        const billingLimitReached = imageStats.billingLimitReached; // ✅ Check billing flag

        // ✅ Kiểm tra có lỗi không
        const hasErrors = createResult.errors && createResult.errors.length > 0;
        const errorCount = hasErrors ? createResult.errors.length : 0;

        // ✅ Success modal với thông tin về ảnh
        await Swal.fire({
          icon: hasErrors ? 'warning' : (hasImageIssue ? 'warning' : 'success'),
          title: `<span style="color: ${hasErrors ? '#f59e0b' : (hasImageIssue ? '#f59e0b' : '#10b981')};">${hasErrors ? '⚠️ Hoàn thành với lỗi' : (billingLimitReached ? '⚠️ Tạo thành công (hết quota DALL-E)' : hasImageIssue ? '⚠️ Tạo thành công (không có ảnh)' : '🎉 Thành công!')}</span>`,
          html: `
            <div style="text-align: center;">
              <p style="font-size: 1.1rem; margin-bottom: 1rem; color: #1e293b;">
                Đã tạo deck <strong>"${deckName}"</strong> với ${createdCount} flashcards
              </p>
              <div style="padding: 1.5rem; background: #f0fdf4; border-radius: 12px; border: 2px solid #10b981; margin-bottom: 1rem;">
                <p style="font-size: 2.5rem; margin: 0; color: #166534;">${createdCount}</p>
                <p style="margin: 0.5rem 0 0 0; color: #16a34a; font-weight: 600; font-size: 1.1rem;">flashcards thành công</p>
              </div>
              
              ${billingLimitReached ? `
                <div style="padding: 1rem; background: #fef3c7; border-radius: 8px; border: 1px solid #f59e0b; margin-bottom: 1rem;">
                  <p style="color: #92400e; font-weight: 600; margin-bottom: 0.5rem;">
                    💳 DALL-E hết hạn mức thanh toán
                  </p>
                  <p style="color: #78350f; font-size: 0.875rem;">
                    OpenAI API đã hết quota cho tháng này. Flashcards đã được tạo thành công với đầy đủ thông tin nhưng không có hình ảnh minh họa.
                  </p>
                  <p style="color: #78350f; font-size: 0.875rem; margin-top: 0.5rem;">
                    💡 Bạn có thể thêm ảnh thủ công sau hoặc nạp thêm credit cho OpenAI.
                  </p>
                </div>
              ` : hasImageIssue ? `
                <div style="padding: 1rem; background: #fef3c7; border-radius: 8px; border: 1px solid #f59e0b; margin-bottom: 1rem;">
                  <p style="color: #92400e; font-weight: 600; margin-bottom: 0.5rem;">
                    📸 Không thể tạo hình ảnh với DALL-E
                  </p>
                  <p style="color: #78350f; font-size: 0.875rem;">
                    ${imageStats.note || 'DALL-E API không khả dụng hoặc hết quota. Flashcards đã được tạo thành công nhưng không có hình ảnh minh họa.'}
                  </p>
                  <p style="color: #78350f; font-size: 0.875rem; margin-top: 0.5rem;">
                    💡 Bạn có thể thêm ảnh thủ công sau.
                  </p>
                </div>
              ` : imageStats.successful > 0 ? `
                <div style="padding: 0.75rem; background: #d1fae5; border-radius: 8px; border: 1px solid #10b981; margin-bottom: 1rem;">
                  <p style="color: #065f46; font-size: 0.875rem; margin: 0;">
                    ✅ Đã tạo ${imageStats.successful}/${imageStats.attempted} ảnh DALL-E thành công
                  </p>
                </div>
              ` : ''}
              
              ${hasErrors ? `
                <div style="padding: 1rem; background: #fef3c7; border-radius: 8px; border: 1px solid #f59e0b; margin-bottom: 1rem;">
                  <p style="color: #92400e; font-weight: 600; margin-bottom: 0.5rem;">
                    ⚠️ ${errorCount} từ bị lỗi
                  </p>
                  <details style="text-align: left; margin-top: 0.5rem;">
                    <summary style="cursor: pointer; font-weight: 600; color: #92400e;">Xem chi tiết lỗi</summary>
                    <ul style="margin-top: 0.5rem; font-size: 0.875rem; color: #78350f;">
                      ${createResult.errors.map(err => `<li><strong>${err.word}</strong>: ${err.error}</li>`).join('')}
                    </ul>
                  </details>
                </div>
              ` : ''}
              
              <div style="padding: 1rem; background: #eff6ff; border-radius: 8px; border: 1px solid #bfdbfe;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; text-align: left; font-size: 0.9rem; color: #1e40af;">
                  <div>✅ Phiên âm đầy đủ</div>
                  <div>✅ Nghĩa tiếng Việt</div>
                  <div>✅ Ví dụ thực tế</div>
                  <div>✅ Từ đồng nghĩa</div>
                </div>
              </div>
            </div>
          `,
          confirmButtonColor: hasErrors || hasImageIssue ? '#f59e0b' : '#10b981',
          confirmButtonText: '👀 Xem deck',
          showCancelButton: true,
          cancelButtonText: 'Đóng',
          cancelButtonColor: '#94a3b8',
          width: '600px'
        }).then((result) => {
          if (result.isConfirmed) {
            navigate(`/admin/decks/${newDeckId}`);
          } else {
            fetchDecks();
          }
        });

      } catch (error) {
        console.error('❌ Create deck with AI error:', error);
        
        // ✅ Extract detailed error message
        let errorMessage = 'Không thể tạo deck với AI';
        
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        // ✅ Show detailed error
        await Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          html: `
            <div style="text-align: left;">
              <p style="color: #ef4444; font-weight: 600; margin-bottom: 1rem;">
                ${errorMessage}
              </p>
              <details style="margin-top: 1rem; padding: 0.75rem; background: #f3f4f6; border-radius: 8px;">
                <summary style="cursor: pointer; font-weight: 600;">Chi tiết kỹ thuật</summary>
                <pre style="margin-top: 0.5rem; font-size: 0.75rem; overflow-x: auto;">
${JSON.stringify(error.response?.data || error, null, 2)}
                </pre>
              </details>
              <p style="color: #6b7280; font-size: 0.875rem; margin-top: 1rem;">
                Vui lòng kiểm tra:
                <ul style="margin-top: 0.5rem;">
                  <li>API key Gemini có hợp lệ không</li>
                  <li>Từ vựng nhập vào có hợp lệ không</li>
                  <li>Backend logs để xem lỗi chi tiết</li>
                </ul>
              </p>
            </div>
          `,
          confirmButtonColor: '#ef4444',
          width: '600px'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // ✅ FIX: Helper function - Generate đúng số lượng từ với AI
  const generateWordsFromDeckInfo = async (name, description, category, level, count = 10) => {
    try {
      console.log(`🤖 Generating ${count} words for topic: ${name}, category: ${category}, level: ${level}`);
      
      // ✅ Truyền level từ form vào AI
      const result = await geminiService.generateVocabulary(
        `${name} - ${description}`, // topic (kết hợp tên và mô tả)
        category,
        level, // ✅ Sử dụng level từ deck thay vì fix INTERMEDIATE
        count
      );

      console.log('✅ AI vocabulary result:', result);

      if (result.success && result.data && Array.isArray(result.data)) {
        console.log(`✅ AI generated ${result.data.length} words:`, result.data);
        return result.data;
      }
      
      throw new Error('AI không thể tạo từ vựng. Vui lòng thử lại hoặc nhập thủ công.');

    } catch (error) {
      console.error('❌ AI generation error:', error);
      throw error;
    }
  };

  // ✅ FIX: Sửa handleGenerateAI với form đẹp hơn và AI-powered
  const handleGenerateAI = async (deck) => {
    const { value: formValues } = await Swal.fire({
      title: '<span style="color: #667eea;">Thêm Flashcards với AI</span>',
      html: `
        <div style="text-align: left; max-height: 70vh; overflow-y: auto; padding: 0.5rem;">
          <!-- Deck Info Display -->
          <div style="margin-bottom: 1.5rem; padding: 1rem; background: linear-gradient(135deg, #e0e7ff 0%, #f0f4ff 100%); border-radius: 12px; border: 2px solid #667eea;">
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
              <span style="font-size: 1.5rem;"></span>
              <div>
                <div style="font-weight: 700; color: #1e293b; font-size: 1.1rem;">${deck.title}</div>
                <div style="font-size: 0.875rem; color: #64748b; margin-top: 0.25rem;">
                  ${deck.description || 'Không có mô tả'} • ${deck.category || 'N/A'} • ${deck.level || 'N/A'}
                </div>
              </div>
            </div>
            <div style="display: flex; gap: 1rem; margin-top: 0.75rem; font-size: 0.875rem; color: #475569;">
              <span>${deck.totalCards || 0} thẻ hiện tại</span>
              <span>${deck.difficulty || 'INTERMEDIATE'}</span>
            </div>
          </div>

          <!-- Generation Mode -->
          <div style="margin-bottom: 1.5rem; padding: 1.25rem; background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%); border: 2px solid #667eea40; border-radius: 12px;">
            <label style="display: flex; align-items: center; margin-bottom: 0.75rem; cursor: pointer;">
              <input type="checkbox" id="swal-auto-generate-add" style="width: 20px; height: 20px; margin-right: 0.75rem; cursor: pointer; accent-color: #667eea;" checked />
              <span style="color: #1e293b; font-weight: 700; font-size: 1rem;">
                Tự động tạo flashcards với AI
              </span>
            </label>
            <p style="margin: 0 0 0.75rem 2rem; font-size: 0.875rem; color: #475569; line-height: 1.6;">
              AI sẽ phân tích chủ đề deck và tự động tạo từ vựng phù hợp
            </p>
            
            <!-- Count Selector -->
            <div style="margin-left: 2rem; display: flex; align-items: center; gap: 0.75rem;">
              <label style="font-size: 0.875rem; color: #64748b; font-weight: 600;">Số lượng:</label>
              <select id="swal-card-count-add" style="padding: 0.5rem 1rem; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 0.9rem; background: white; cursor: pointer; min-width: 100px;">
                <option value="5">5 thẻ</option>
                <option value="10" selected>10 thẻ</option>
                <option value="15">15 thẻ</option>
                <option value="20">20 thẻ</option>
              </select>
            </div>
          </div>

          <!-- Manual Input Section -->
          <div id="manual-words-section-add" style="display: none; margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.75rem; color: #1e293b; font-weight: 700; font-size: 0.9rem;">
              Danh sách từ vựng
            </label>
            <textarea 
              id="swal-words-input-add" 
              class="swal2-textarea"
              placeholder="Nhập mỗi từ trên một dòng:&#10;beautiful&#10;amazing&#10;wonderful&#10;fantastic&#10;excellent"
              rows="10"
              style="width: 100%; margin: 0; padding: 0.875rem; border: 2px solid #e2e8f0; border-radius: 10px; font-family: 'Courier New', monospace; font-size: 0.9rem; resize: vertical; transition: all 0.3s;"
              onfocus="this.style.borderColor='#667eea'; this.style.boxShadow='0 0 0 3px rgba(102,126,234,0.1)';"
              onblur="this.style.borderColor='#e2e8f0'; this.style.boxShadow='none';"
            ></textarea>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.75rem; padding: 0.75rem; background: #fef3c7; border-radius: 8px;">
              <span style="font-size: 1.25rem;"></span>
              <p style="margin: 0; font-size: 0.875rem; color: #92400e; font-weight: 600;">
                Tối đa 20 từ mỗi lần. Mỗi từ một dòng. AI sẽ tự động phân tích và tạo nghĩa, ví dụ, phát âm...
              </p>
            </div>
          </div>

          <!-- AI Features Info -->
          <div style="margin-top: 1.5rem; padding: 1rem; background: #f0fdf4; border: 2px solid #10b981; border-radius: 10px;">
            <div style="font-weight: 700; color: #166534; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-size: 1.25rem;"></span>
              AI sẽ tự động tạo:
            </div>
            <ul style="margin: 0.5rem 0 0 1.5rem; color: #15803d; font-size: 0.875rem; line-height: 1.8;">
              <li>Phiên âm (IPA) chuẩn xác</li>
              <li>Phân loại từ (noun, verb, adjective...)</li>
              <li>Nghĩa tiếng Anh và dịch tiếng Việt</li>
              <li>Câu ví dụ thực tế</li>
              <li>Từ đồng nghĩa và trái nghĩa</li>
              <li>Collocations phổ biến</li>
            </ul>
            
            <!--  NEW: Checkbox để thêm hình ảnh -->
            <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #d1fae5;">
              <label style="display: flex; align-items: center; cursor: pointer;">
                <input type="checkbox" id="swal-use-images-add" style="width: 18px; height: 18px; margin-right: 0.75rem; cursor: pointer; accent-color: #10b981;" checked />
                <span style="color: #166534; font-weight: 600; font-size: 0.875rem;">
                  Tự động tạo hình ảnh minh họa bằng AI (DALL-E)
                </span>
              </label>
              <p style="margin: 0.5rem 0 0 2rem; font-size: 0.75rem; color: #15803d;">
                ⚠️ Yêu cầu OpenAI API key có billing. Nếu không có, flashcards sẽ được tạo không có ảnh.
              </p>
            </div>
          </div>

          <script>
            const autoCheckbox = document.getElementById('swal-auto-generate-add');
            const manualSection = document.getElementById('manual-words-section-add');
            
            autoCheckbox.addEventListener('change', function(e) {
              manualSection.style.display = e.target.checked ? 'none' : 'block';
            });
          </script>
        </div>
      `,
      width: '680px',
      padding: '2rem',
      background: '#ffffff',
      backdrop: 'rgba(0,0,0,0.4)',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: '<span style="font-size: 1.1rem;">Tạo Flashcards với AI</span>',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#667eea',
      cancelButtonColor: '#94a3b8',
      buttonsStyling: true,
      customClass: {
        confirmButton: 'swal2-confirm-custom',
        cancelButton: 'swal2-cancel-custom'
      },
      didOpen: () => {
        // Add custom button styles
        const style = document.createElement('style');
        style.textContent = `
          .swal2-confirm-custom {
            padding: 0.875rem 2rem !important;
            font-weight: 700 !important;
            border-radius: 10px !important;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4) !important;
            transition: all 0.3s !important;
          }
          .swal2-confirm-custom:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5) !important;
          }
          .swal2-cancel-custom {
            padding: 0.875rem 2rem !important;
            font-weight: 600 !important;
            border-radius: 10px !important;
          }
        `;
        document.head.appendChild(style);
      },
      preConfirm: () => {
        const autoGenerate = document.getElementById('swal-auto-generate-add').checked;
        const cardCount = parseInt(document.getElementById('swal-card-count-add')?.value) || 10;
        const wordsInput = document.getElementById('swal-words-input-add')?.value || '';
        
        // Validation
        if (!autoGenerate && !wordsInput.trim()) {
          Swal.showValidationMessage('⚠️ Vui lòng nhập danh sách từ hoặc chọn tự động tạo');
          return false;
        }

        if (!autoGenerate) {
          const words = wordsInput.split('\n').map(w => w.trim()).filter(w => w);
          if (words.length === 0) {
            Swal.showValidationMessage('⚠️ Vui lòng nhập ít nhất một từ');
            return false;
          }
          if (words.length > 20) {
            Swal.showValidationMessage('⚠️ Tối đa 20 từ mỗi lần');
            return false;
          }
        }
        
        return { autoGenerate, cardCount, wordsInput };
      }
    });

    if (formValues) {
      const { autoGenerate, cardCount, wordsInput } = formValues;

      try {
        setAiLoading(deck._id);
        
        let words = [];
        
        if (autoGenerate) {
          // ✅ Auto generate với AI (không có fallback)
          words = await generateWordsFromDeckInfo(
            deck.title, 
            deck.description || '', 
            deck.category || 'GENERAL', 
            deck.level || 'B1', // ✅ Thêm level từ deck
            cardCount // ✅ Truyền cardCount vào vị trí count
          );
          
          console.log(`✅ Auto generated ${words.length} words for ${cardCount} cards`);
          
          if (words.length === 0) {
            showToast('warning', 'Cảnh báo', 'Không thể tạo từ tự động. Vui lòng thử lại hoặc nhập thủ công.');
            setAiLoading(null);
            return;
          }
        } else {
          // Parse manual input
          words = wordsInput
            .split('\n')
            .map(word => word.trim())
            .filter(word => word.length > 0)
            .slice(0, cardCount); // ✅ Limit theo cardCount
        }

        // ✅ Validate
        if (words.length === 0) {
          showToast('warning', 'Cảnh báo', 'Không có từ nào để tạo');
          setAiLoading(null);
          return;
        }

        // ✅ Final check
        console.log(`📊 Creating ${words.length} flashcards:`, words);

        showToast('info', 'Đang xử lý', `🤖 AI đang phân tích ${words.length} từ...`);

        // ✅ Call backend API: POST /api/ai/batch-create
        // Request: { deckId, words: [...] }
        // Response: { success: true, message: "...", data: [...flashcards] }
        const useImagesCheckbox = document.getElementById('swal-use-images-add');
        const useImages = useImagesCheckbox ? useImagesCheckbox.checked : true;

        let createResult;
        if (useImages) {
          console.log('🖼️ Calling batchCreateWithImages for existing deck...');
          createResult = await geminiService.batchCreateWithImages(deck._id, words);
        } else {
          console.log('📝 Calling batchCreate (no images) for existing deck...');
          createResult = await geminiService.batchCreate(deck._id, words);
        }

        // ✅ Validate response
        if (!createResult?.success) {
          throw new Error(createResult?.message || 'Không thể tạo flashcards với AI');
        }

        const createdCount = Array.isArray(createResult.data)
          ? createResult.data.length
          : (createResult.data?.count || 0);

        // ✅ Kiểm tra có lỗi không
        const hasErrors = createResult.errors && createResult.errors.length > 0;
        const errorCount = hasErrors ? createResult.errors.length : 0;

        // ✅ Success modal with error details
        await Swal.fire({
          icon: hasErrors ? 'warning' : 'success',
          title: `<span style="color: ${hasErrors ? '#f59e0b' : '#10b981'};">${hasErrors ? '⚠️ Hoàn thành với lỗi' : '🎉 Thành công!'}</span>`,
          html: `
            <div style="text-align: center;">
              <p style="font-size: 1.1rem; margin-bottom: 1rem; color: #1e293b;">
                Đã thêm flashcards vào deck <strong>"${deck.title}"</strong>
              </p>
              <div style="padding: 1.5rem; background: #f0fdf4; border-radius: 12px; border: 2px solid #10b981; margin-bottom: 1rem;">
                <p style="font-size: 2.5rem; margin: 0; color: #166534;">${createdCount}</p>
                <p style="margin: 0.5rem 0 0 0; color: #16a34a; font-weight: 600; font-size: 1.1rem;">flashcards thành công</p>
              </div>
              
              ${hasErrors ? `
                <div style="padding: 1rem; background: #fef3c7; border-radius: 8px; border: 1px solid #f59e0b; margin-bottom: 1rem;">
                  <p style="color: #92400e; font-weight: 600; margin-bottom: 0.5rem;">
                    ⚠️ ${errorCount} từ bị lỗi
                  </p>
                  <details style="text-align: left; margin-top: 0.5rem;">
                    <summary style="cursor: pointer; font-weight: 600; color: #92400e;">Xem chi tiết lỗi</summary>
                    <ul style="margin-top: 0.5rem; font-size: 0.875rem; color: #78350f;">
                      ${createResult.errors.map(err => `<li><strong>${err.word}</strong>: ${err.error}</li>`).join('')}
                    </ul>
                  </details>
                </div>
              ` : ''}
              
              <div style="padding: 1rem; background: #eff6ff; border-radius: 8px; border: 1px solid #bfdbfe;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; text-align: left; font-size: 0.9rem; color: #1e40af;">
                  <div>✅ Phiên âm đầy đủ</div>
                  <div>✅ Nghĩa tiếng Việt</div>
                  <div>✅ Ví dụ thực tế</div>
                  <div>✅ Từ đồng nghĩa</div>
                </div>
              </div>
            </div>
          `,
          confirmButtonColor: hasErrors ? '#f59e0b' : '#10b981',
          confirmButtonText: '👀 Xem deck',
          showCancelButton: true,
          cancelButtonText: 'Đóng',
          cancelButtonColor: '#94a3b8',
          width: '600px'
        }).then((result) => {
          if (result.isConfirmed) {
            navigate(`/admin/decks/${deck._id}`);
          } else {
            fetchDecks();
          }
        });

      } catch (error) {
        console.error('❌ Generate AI error:', error);
        
        await Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          html: `
            <div style="text-align: center;">
              <p style="color: #ef4444; font-weight: 600; margin-bottom: 0.5rem;">
                ${error.response?.data?.message || error.message || 'Không thể tạo flashcards'}
              </p>
              <p style="color: #6b7280; font-size: 0.875rem;">
                Vui lòng thử lại hoặc liên hệ hỗ trợ nếu lỗi vẫn tiếp diễn.
              </p>
            </div>
          `,
          confirmButtonColor: '#ef4444'
        });
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