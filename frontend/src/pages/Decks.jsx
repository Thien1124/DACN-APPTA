import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
import {
  Book,
  School,
  Business,
  MenuBook,
  Restaurant,
  LocalHospital,
  AutoAwesome,
  Add,
  Edit,
  Delete,
  RateReview,
  Public,
  Lock,
  ContentCopy,
  Share,
  GetApp,
  Archive,
  Favorite,
  FavoriteBorder,
  Notifications,
  NotificationsOff,
  Whatshot, // Thêm cho tab Thịnh hành
} from "@mui/icons-material";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import { useToast } from "../hooks/useToast";
import { deckService } from "../services/deckService";
import { deckPreviewService } from "../services/deckPreviewService";
import { deckManagementService } from "../services/deckManagementService";
import { geminiService } from "../services/geminiService";

// Update PageWrapper and add FormWrapper
const PageWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${(props) =>
    props.theme === "dark"
      ? "linear-gradient(135deg, #1a1f2c 0%, #2d3748 50%, #4a5568 100%)"
      : "linear-gradient(135deg, #EBF4FF 0%, #E6FFFA 50%, #F0FFF4 100%)"};
`;
// Thêm sau ActionButton
const PublicBadge = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${(props) =>
    props.$isPublic
      ? "linear-gradient(135deg, #58CC02 0%, #45a302 100%)"
      : "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)"};
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  svg {
    font-size: 14px;
  }
`;
// Thêm sau AddButton
const HeaderButtons = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const AIButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #1cb0f6 0%, #0e8ac9 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(28, 176, 246, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(28, 176, 246, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;
const ToggleButton = styled.button`
  padding: 0.4rem 0.75rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
  background: ${(props) =>
    props.$isPublic
      ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
      : "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)"};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  svg {
    font-size: 16px;
  }
`;
const PageLayout = styled.div`
  display: flex;
  width: 100%;
  position: relative;
`;

const FormWrapper = styled.div`
  flex: 1;
  margin-left: 280px; // LeftSidebar width
  margin-right: 340px; // Increase RightSidebar margin
  padding: 0 20px; // Add padding
  min-width: 0; // Prevent content from overflowing
`;

// Update MainContent styling
const MainContent = styled.div`
  padding: 2.5rem;
  min-width: 0;
  animation: fadeIn 0.5s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: ${(props) => (props.theme === "dark" ? "#f9fafb" : "#1a1a1a")};
  margin-bottom: 2rem;
`;

// Update TopicsGrid for better responsiveness
const TopicsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(300px, 1fr)
  ); // More responsive grid
  gap: 1.5rem;
  width: 100%;
`;

// Make TopicCard more compact
const TopicCard = styled.div`
  background: ${(props) =>
    props.theme === "dark" ? "rgba(31, 41, 55, 0.95)" : "white"};
  border-radius: 20px;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid ${(props) => (props.$isPublic ? "#58CC02" : "#e5e7eb")};
  display: flex;
  flex-direction: column;
  height: fit-content;
  min-height: 180px;
  max-width: 100%;
  position: relative;

  /* Thêm hiệu ứng cho deck riêng tư */
  opacity: ${(props) => (props.$isPublic ? 1 : 0.85)};

  &:hover {
    transform: translateY(-4px);
    border-color: #58cc02;
    box-shadow: 0 8px 24px rgba(88,204,2,0.15);
  }
`;

const TopicIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #58cc02;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  color: white;
`;

const TopicName = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${(props) => (props.theme === "dark" ? "#f9fafb" : "#1a1a1a")};
  margin-bottom: 0.5rem;
`;

const TopicDescription = styled.p`
  font-size: 0.875rem;
  color: ${(props) => (props.theme === "dark" ? "#9ca3af" : "#6b7280")};
  margin-bottom: 1rem;
`;

const TopicStats = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: ${(props) => (props.theme === "dark" ? "#9ca3af" : "#6b7280")};
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  width: 100%; // Take full width
  padding-right: 2rem; // Add padding to prevent overlap
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #58cc02 0%, #45a302 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(88, 204, 2, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;
// Add this with other styled components in Topics.jsx
const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${(props) => (props.primary ? "#58CC02" : "#e5e7eb")};
  color: ${(props) => (props.primary ? "white" : "#374151")};

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: ${(props) => (props.theme === "dark" ? "#1f2937" : "white")};
  padding: 2rem;
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

// Add styled checkbox
const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  accent-color: #58CC02;
`;

const CheckboxLabel = styled.label`
  font-size: 0.875rem;
  color: ${(props) => (props.theme === "dark" ? "#f9fafb" : "#1f2937")};
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 1px solid
    ${(props) => (props.theme === "dark" ? "#4b5563" : "#e5e7eb")};
  border-radius: 8px;
  background: ${(props) => (props.theme === "dark" ? "#374151" : "white")};
  color: ${(props) => (props.theme === "dark" ? "#f9fafb" : "#1f2937")};
`;

const Select = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid
    ${(props) => (props.theme === "dark" ? "#4b5563" : "#e5e7eb")};
  border-radius: 8px;
  background: ${(props) => (props.theme === "dark" ? "#374151" : "white")};
  color: ${(props) => (props.theme === "dark" ? "#f9fafb" : "#1f2937")};
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`;

// Make TopicActions more compact
const TopicActions = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr); // Giữ nguyên 2 cột
  gap: 0.5rem;
  margin-top: 1rem;

  /* Cho nút cuối cùng chiếm full width nếu lẻ */
  > :last-child:nth-child(odd) {
    grid-column: span 2;
  }
`;

const ActionButton = styled.button.withConfig({
  shouldComponentUpdate: true,
  shouldForwardProp: (prop) => !["variant"].includes(prop),
})`
  padding: 0.4rem 0.75rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
  background: ${(props) => {
    switch (props.variant) {
      case "ai":
        return "#1CB0F6";
      case "review":
        return "#FF9500"; // ← Thêm màu cam cho review
      case "edit":
        return "#FFA116";
      case "delete":
        return "#dc2626";
      default:
        return "#58CC02";
    }
  }};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  svg {
    font-size: 16px;
  }
`;

const Decks = () => {
  const [theme] = useState("light");
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editingDeck, setEditingDeck] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "GENERAL",
    level: "A1",
    difficulty: "BEGINNER",
    tags: [],
    isPublic: true,
    imageUrl: "/images/default-deck.png",
  });

  // ========== NEW STATE ==========
  const [publicDecks, setPublicDecks] = useState([]);
  const [trendingDecks, setTrendingDecks] = useState([]);
  const [favoriteDecks, setFavoriteDecks] = useState([]);
  const [subscribedDecks, setSubscribedDecks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("my-decks"); // my-decks, public, trending, favorites, subscribed
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Update fetchTopics to use getMyDecks
  const fetchTopics = async () => {
    try {
      setLoading(true);
      const response = await deckService.getMyDecks();
      setTopics(response.data || []);
    } catch (error) {
      console.error("Fetch decks error:", error);
      showToast(
        "error",
        "Lỗi",
        error.message || "Không thể tải danh sách bộ thẻ"
      );
    } finally {
      setLoading(false);
    }
  };

  // ========== NEW FETCH FUNCTIONS ==========

  // Fetch public decks
  const fetchPublicDecks = async (page = 1) => {
    const token = localStorage.getItem('token');
    if (!token) {
      showToast("warning", "Cần đăng nhập", "Vui lòng đăng nhập để xem bộ thẻ công khai");
      setPublicDecks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await deckService.getPublicDecks(page, 20);
      console.log("fetchPublicDecks response:", res);

      const payload = res?.data ?? res;
      const maybeArray =
        Array.isArray(payload) ? payload :
        Array.isArray(payload?.items) ? payload.items :
        Array.isArray(payload?.decks) ? payload.decks :
        Array.isArray(res) ? res : [];

      const decks = maybeArray;

      const publicOnly = decks.filter((d) => {
        if (typeof d.isPublic === "boolean") return d.isPublic;
        if (typeof d.isPublic === "string") return d.isPublic === "true" || d.isPublic === "1";
        return true;
      });

      console.log("Normalized public decks:", publicOnly);

      setPublicDecks(publicOnly);
      setTotalPages(
        payload?.pagination?.totalPages ??
        payload?.totalPages ??
        res?.pagination?.totalPages ??
        1
      );
      setCurrentPage(page);
    } catch (error) {
      console.error("Fetch public decks error:", error);
      if (error.response?.status === 403) {
        showToast("warning", "Cần đăng nhập", "Vui lòng đăng nhập để xem bộ thẻ công khai");
        setPublicDecks([]);
      } else {
        showToast("error", "Lỗi", "Không thể tải bộ thẻ công khai");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch trending decks
  const fetchTrendingDecks = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      showToast("warning", "Cần đăng nhập", "Vui lòng đăng nhập để xem bộ thẻ thịnh hành");
      setTrendingDecks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await deckService.getTrendingDecks(20);
      if (response.success) {
        setTrendingDecks(response.data);
      }
    } catch (error) {
      console.error("Fetch trending decks error:", error);
      if (error.response?.status === 403) {
        showToast("warning", "Cần đăng nhập", "Vui lòng đăng nhập để xem bộ thẻ thịnh hành");
        setTrendingDecks([]);
      } else {
        showToast("error", "Lỗi", "Không thể tải bộ thẻ thịnh hành");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch favorite decks
  const fetchFavoriteDecks = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      showToast("warning", "Cần đăng nhập", "Vui lòng đăng nhập để xem bộ thẻ yêu thích");
      setFavoriteDecks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await deckService.getFavoriteDecks();
      if (response.success) {
        setFavoriteDecks(response.data);
      }
    } catch (error) {
      console.error("Fetch favorite decks error:", error);
      if (error.response?.status === 403) {
        showToast("warning", "Cần đăng nhập", "Vui lòng đăng nhập để xem bộ thẻ yêu thích");
        setFavoriteDecks([]);
      } else {
        showToast("error", "Lỗi", "Không thể tải bộ thẻ yêu thích");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch subscribed decks
  const fetchSubscribedDecks = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      showToast("warning", "Cần đăng nhập", "Vui lòng đăng nhập để xem bộ thẻ đã đăng ký");
      setSubscribedDecks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await deckService.getSubscribedDecks();
      if (response.success) {
        setSubscribedDecks(response.data);
      }
    } catch (error) {
      console.error("Fetch subscribed decks error:", error);
      if (error.response?.status === 403) {
        showToast("warning", "Cần đăng nhập", "Vui lòng đăng nhập để xem bộ thẻ đã đăng ký");
        setSubscribedDecks([]);
      } else {
        showToast("error", "Lỗi", "Không thể tải bộ thẻ đã đăng ký");
      }
    } finally {
      setLoading(false);
    }
  };

  // Search decks
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      showToast("warning", "Cảnh báo", "Vui lòng nhập từ khóa tìm kiếm");
      return;
    }

    try {
      setLoading(true);
      const response = await deckService.searchDecks(searchQuery);
      if (response.success) {
        setPublicDecks(response.data);
        setActiveTab("public");
      }
    } catch (error) {
      console.error("Search decks error:", error);
      showToast("error", "Lỗi", "Không thể tìm kiếm bộ thẻ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
    // Fix: Remove API calls from initial useEffect to prevent 403 errors when not logged in
    // fetchPublicDecks(1);
    // fetchTrendingDecks();
    // fetchFavoriteDecks();
    // fetchSubscribedDecks();
  }, []);

  // Load data based on active tab
  useEffect(() => {
    switch (activeTab) {
      case "my-decks":
        fetchTopics();
        break;
      case "public":
        fetchPublicDecks(1);
        break;
      case "trending":
        fetchTrendingDecks();
        break;
      case "favorites":
        fetchFavoriteDecks();
        break;
      case "subscribed":
        fetchSubscribedDecks();
        break;
      default:
        break;
    }
  }, [activeTab]);

  const handleTopicClick = (topicId) => {
    navigate(`/topics/${encodeURIComponent(topicId)}`);
  };

  const handleAddTopic = () => {
    setShowModal(true);
  };
  const handleNavigateToAI = () => {
    // Navigate đến AI Generator để tạo deck mới
    navigate("/ai-flashcards", {
      state: {
        isNewDeck: true, // Flag để biết là tạo deck mới
      },
    });
  };
  const handleEdit = (deck) => {
    setEditingDeck(deck);
    setFormData({
      title: deck.title,
      description: deck.description,
      category: deck.category,
      level: deck.level,
      difficulty: deck.difficulty,
      isPublic: deck.isPublic,
      imageUrl: deck.imageUrl,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDeck(null);
    setFormData({
      title: "",
      description: "",
      category: "GENERAL",
      level: "A1",
      difficulty: "BEGINNER",
      tags: [],
      isPublic: true,
      imageUrl: "/images/default-deck.png",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Update handleSubmit to handle both create and edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (editingDeck) {
        response = await deckService.update(editingDeck._id, formData);
        showToast("success", "Thành công", "✅ Đã cập nhật bộ thẻ thành công");
      } else {
        response = await deckService.create(formData);
        showToast("success", "Thành công", "✅ Đã tạo bộ thẻ mới thành công");
      }

      if (response.success) {
        fetchTopics();
        handleCloseModal();
      }
    } catch (error) {
      console.error("Save deck error:", error);
      showToast("error", "Lỗi", error.message || "Không thể lưu bộ thẻ");
    }
  };

  // Sửa handleGenerateAI để bỏ kiểm tra role
  const handleGenerateAI = async (deck) => {
    const token = localStorage.getItem('token');
    if (!token) {
      showToast("warning", "Cần đăng nhập", "Vui lòng đăng nhập để sử dụng tính năng AI");
      return;
    }

    try {
      showToast("info", "Đang xử lý", "🤖 AI đang phân tích và tạo từ vựng...");

      // Bước 1: Generate danh sách từ từ deck title
      const words = generateWordsFromTitle(deck.title, 5); // Tạo 5 từ mặc định

      // Bước 2: Dùng batchAnalyze để phân tích
      const analyzeResult = await geminiService.batchAnalyze(words);

      if (!analyzeResult.success) {
        throw new Error(analyzeResult.message || 'Không thể phân tích từ vựng');
      }

      // Bước 3: Dùng batchCreate để tạo flashcards
      const createResult = await geminiService.batchCreate(deck._id, words);

      if (!createResult.success) {
        throw new Error(createResult.message || 'Không thể tạo flashcards');
      }

      showToast(
        "success",
        "Thành công",
        `✅ Đã tạo ${createResult.data.length} flashcards cho bộ "${deck.title}"`
      );
      fetchTopics(); // Refresh để cập nhật số lượng thẻ

    } catch (error) {
      console.error("Generate AI error:", error);
      showToast(
        "error",
        "Lỗi",
        error.message || "Không thể tạo từ vựng tự động"
      );
    }
  };

  // Helper: Generate danh sách từ từ deck title
  const generateWordsFromTitle = (title, count = 5) => {
    // Logic đơn giản: split title và lấy keywords
    // Trong thực tế, có thể dùng AI để generate từ liên quan
    
    const commonWords = [
      'beautiful', 'amazing', 'wonderful', 'fantastic', 'excellent',
      'important', 'necessary', 'essential', 'crucial', 'vital',
      'interesting', 'fascinating', 'exciting', 'thrilling', 'amusing',
      'difficult', 'challenging', 'complex', 'complicated', 'hard',
      'easy', 'simple', 'straightforward', 'clear', 'obvious'
    ];

    // Shuffle và lấy count từ
    const shuffled = [...commonWords].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // Thêm sau hàm handleDelete
  const handleTogglePublic = async (deck) => {
    try {
      const newPublicStatus = !deck.isPublic;

      await deckService.update(deck._id, {
        isPublic: newPublicStatus,
      });

      showToast(
        "success",
        "Thành công",
        newPublicStatus
          ? "🌍 Đã công khai bộ thẻ - Mọi người có thể xem và học"
          : "🔒 Đã ẩn bộ thẻ - Chỉ bạn mới xem được"
      );

      fetchTopics();
    } catch (error) {
      console.error("Toggle public error:", error);
      showToast(
        "error",
        "Lỗi",
        error.message || "Không thể thay đổi trạng thái"
      );
    }
  };
  const handleReview = (deckId) => {
    navigate(`/flashcards/review/${deckId}`);
    // Optionally increment study count
    deckService.incrementStudy(deckId).catch(console.error);
  };

  // Add delete functionality
  const handleDelete = async (deckId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bộ thẻ này?")) {
      try {
        await deckService.delete(deckId);
        showToast("success", "Thành công", "✅ Đã xóa bộ thẻ thành công");
        fetchTopics();
      } catch (error) {
        console.error("Delete deck error:", error);
        showToast("error", "Lỗi", error.message || "Không thể xóa bộ thẻ");
      }
    }
  };
  const handleViewReviews = (deckId) => {
    navigate(`/decks/${deckId}/reviews`);
  };

  // ========== DECK MANAGEMENT FUNCTIONS ==========

  // Clone deck
  const handleCloneDeck = async (deck) => {
    try {
      showToast("info", "Đang xử lý", "🔄 Đang sao chép bộ thẻ...");

      const result = await deckManagementService.cloneDeck(deck._id);

      if (result.success) {
        showToast("success", "Thành công", `✅ Đã sao chép bộ thẻ "${result.data.title}"`);
        fetchTopics(); // Refresh deck list
      }
    } catch (error) {
      console.error("Clone deck error:", error);
      showToast("error", "Lỗi", error.response?.data?.message || "Không thể sao chép bộ thẻ");
    }
  };

  // Share deck
  const handleShareDeck = async (deck) => {
    try {
      const shareSettings = {
        allowClone: true,
        allowDownload: true,
        requireLogin: false,
      };

      const result = await deckManagementService.shareDeck(deck._id, shareSettings);

      if (result.success) {
        const shareUrl = `${window.location.origin}/decks/shared/${result.data.shareToken}`;

        // Copy to clipboard
        await navigator.clipboard.writeText(shareUrl);

        showToast(
          "success",
          "Đã sao chép link",
          "🔗 Link chia sẻ đã được sao chép vào clipboard"
        );
      }
    } catch (error) {
      console.error("Share deck error:", error);
      showToast("error", "Lỗi", error.response?.data?.message || "Không thể chia sẻ bộ thẻ");
    }
  };

  // Export deck
  const handleExportDeck = async (deck, format = 'json') => {
    try {
      showToast("info", "Đang xử lý", `📥 Đang xuất bộ thẻ dạng ${format.toUpperCase()}...`);

      const blob = await deckManagementService.exportDeck(deck._id, format);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${deck.title}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast("success", "Thành công", `✅ Đã xuất bộ thẻ "${deck.title}"`);
    } catch (error) {
      console.error("Export deck error:", error);
      showToast("error", "Lỗi", error.response?.data?.message || "Không thể xuất bộ thẻ");
    }
  };

  // Archive deck
  const handleArchiveDeck = async (deck) => {
    try {
      const result = await deckManagementService.archiveDeck(deck._id);

      if (result.success) {
        showToast("success", "Thành công", `📦 Đã lưu trữ bộ thẻ "${deck.title}"`);
        fetchTopics();
      }
    } catch (error) {
      console.error("Archive deck error:", error);
      showToast("error", "Lỗi", error.response?.data?.message || "Không thể lưu trữ bộ thẻ");
    }
  };

  // View deck preview
  const handleViewPreview = async (deckId) => {
    try {
      const preview = await deckPreviewService.getDeckPreview(deckId);

      if (preview.success) {
        // Navigate to preview page or show modal
        navigate(`/decks/${deckId}/preview`);
      }
    } catch (error) {
      console.error("View preview error:", error);
      showToast("error", "Lỗi", error.response?.data?.message || "Không thể xem trước bộ thẻ");
    }
  };

  // Get deck stats
  const handleViewStats = async (deckId) => {
    try {
      const stats = await deckPreviewService.getDeckStats(deckId);

      if (stats.success) {
        // Show stats in modal or navigate to stats page
        console.log("Deck stats:", stats.data);
        showToast(
          "info",
          "Thống kê",
          `📊 Tổng lượt xem: ${stats.data.totalViews}, Lượt học: ${stats.data.totalStudies}`
        );
      }
    } catch (error) {
      console.error("View stats error:", error);
      showToast("error", "Lỗi", error.response?.data?.message || "Không thể xem thống kê");
    }
  };

  // ========== NEW HANDLERS ==========

  // Favorite/Unfavorite deck
  const handleToggleFavorite = async (deck) => {
    try {
      if (deck.isFavorited) {
        await deckService.unfavoriteDeck(deck._id);
        showToast("success", "Đã bỏ yêu thích", "💔 Đã xóa khỏi danh sách yêu thích");
      } else {
        await deckService.favoriteDeck(deck._id);
        showToast("success", "Đã yêu thích", "❤️ Đã thêm vào danh sách yêu thích");
      }

      // Refresh current tab
      switch (activeTab) {
        case "public":
          fetchPublicDecks(currentPage);
          break;
        case "trending":
          fetchTrendingDecks();
          break;
        case "favorites":
          fetchFavoriteDecks();
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Toggle favorite error:", error);
      showToast("error", "Lỗi", "Không thể thực hiện thao tác");
    }
  };

  // Subscribe/Unsubscribe deck
  const handleToggleSubscribe = async (deck) => {
    try {
      if (deck.isSubscribed) {
        await deckService.unsubscribeDeck(deck._id);
        showToast("success", "Đã hủy đăng ký", "🔕 Không còn nhận cập nhật từ bộ thẻ này");
      } else {
        await deckService.subscribeDeck(deck._id);
        showToast("success", "Đã đăng ký", "🔔 Bạn sẽ nhận thông báo khi có cập nhật mới");
      }

      // Refresh current tab
      switch (activeTab) {
        case "public":
          fetchPublicDecks(currentPage);
          break;
        case "subscribed":
          fetchSubscribedDecks();
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Toggle subscribe error:", error);
      showToast("error", "Lỗi", "Không thể thực hiện thao tác");
    }
  };

  // Clone deck (enhanced)
  const handleCloneDeckEnhanced = async (deck) => {
    try {
      showToast("info", "Đang xử lý", "🔄 Đang sao chép bộ thẻ...");

      const newTitle = `${deck.title} (Sao chép)`;
      const result = await deckService.cloneDeck(deck._id, newTitle, false);

      if (result.success) {
        showToast("success", "Thành công", `✅ Đã sao chép bộ thẻ "${newTitle}"`);
        fetchTopics(); // Refresh my decks
      }
    } catch (error) {
      console.error("Clone deck error:", error);
      showToast("error", "Lỗi", error.message || "Không thể sao chép bộ thẻ");
    }
  };

  // Get current deck list based on active tab
  const getCurrentDeckList = () => {
    switch (activeTab) {
      case "my-decks":
        return topics;
      case "public":
        return publicDecks;
      case "trending":
        return trendingDecks;
      case "favorites":
        return favoriteDecks;
      case "subscribed":
        return subscribedDecks;
      default:
        return [];
    }
  };

  return (
    <PageWrapper theme={theme}>
      <LeftSidebar />
      <PageLayout>
        <FormWrapper>
          <MainContent>
            <HeaderSection>
              <Title theme={theme}>Chủ Đề</Title>
              <HeaderButtons>
                {/* Search Bar */}
                <Input
                  theme={theme}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="🔍 Tìm kiếm bộ thẻ..."
                  style={{ width: '300px' }}
                />
                <AIButton onClick={handleNavigateToAI}>
                  <AutoAwesome /> Tạo bằng AI
                </AIButton>
                <AddButton onClick={handleAddTopic}>
                  <Add /> Thêm chủ đề mới
                </AddButton>
              </HeaderButtons>
            </HeaderSection>

            {/* Tab Navigation */}
            <TabContainer>
              <Tab active={activeTab === "my-decks"} onClick={() => setActiveTab("my-decks")}>
                <MenuBook sx={{ fontSize: 18, marginRight: 1 }} /> Bộ thẻ của tôi
              </Tab>
              <Tab active={activeTab === "public"} onClick={() => setActiveTab("public")}>
                <Public sx={{ fontSize: 18, marginRight: 1 }} /> Công khai
              </Tab>
              <Tab active={activeTab === "trending"} onClick={() => setActiveTab("trending")}>
                <Whatshot sx={{ fontSize: 18, marginRight: 1 }} /> Thịnh hành
              </Tab>
              <Tab active={activeTab === "favorites"} onClick={() => setActiveTab("favorites")}>
                <Favorite sx={{ fontSize: 18, marginRight: 1 }} /> Yêu thích
              </Tab>
              <Tab active={activeTab === "subscribed"} onClick={() => setActiveTab("subscribed")}>
                <Notifications sx={{ fontSize: 18, marginRight: 1 }} /> Đã đăng ký
              </Tab>
            </TabContainer>

            {loading ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <div>Đang tải dữ liệu...</div>
              </div>
            ) : getCurrentDeckList().length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <div>Chưa có bộ thẻ nào</div>
              </div>
            ) : (
              <TopicsGrid>
                {getCurrentDeckList().map((deck) => (
                  <TopicCard
                    key={deck._id}
                    theme={theme}
                    $isPublic={deck.isPublic}
                  >
                    <PublicBadge $isPublic={deck.isPublic}>
                      {deck.isPublic ? (
                        <>
                          <Public sx={{ fontSize: 14 }} />
                          Công khai
                        </>
                      ) : (
                        <>
                          <Lock sx={{ fontSize: 14 }} />
                          Riêng tư
                        </>
                      )}
                    </PublicBadge>

                    <TopicIcon>{getTopicIcon(deck.category)}</TopicIcon>
                    <TopicName theme={theme}>{deck.title}</TopicName>
                    <TopicDescription theme={theme}>
                      {deck.description || "Không có mô tả"}
                    </TopicDescription>
                    <TopicStats theme={theme}>
                      <span>{deck.flashcards?.length || 0} thẻ</span>
                      <span>•</span>
                      <span>{deck.category}</span>
                      {activeTab !== "my-decks" && (
                        <>
                          <span>•</span>
                          <span>👁️ {deck.viewCount || 0}</span>
                          <span>•</span>
                          <span>📖 {deck.studyCount || 0}</span>
                        </>
                      )}
                    </TopicStats>

                    <TopicActions>
                      {/* Ôn tập */}
                      <ActionButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReview(deck._id);
                        }}
                      >
                        <MenuBook sx={{ fontSize: 18 }} /> Ôn tập
                      </ActionButton>

                      {/* Sao chép */}
                      <ActionButton
                        variant="ai"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCloneDeckEnhanced(deck);
                        }}
                      >
                        <ContentCopy sx={{ fontSize: 18 }} /> Sao chép
                      </ActionButton>

                      {/* Favorite - Only for public/trending tabs */}
                      {(activeTab === "public" || activeTab === "trending") && (
                        <ActionButton
                          variant={deck.isFavorited ? "delete" : "review"}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(deck);
                          }}
                        >
                          {deck.isFavorited ? (
                            <>
                              <Favorite sx={{ fontSize: 18 }} /> Bỏ thích
                            </>
                          ) : (
                            <>
                              <FavoriteBorder sx={{ fontSize: 18 }} /> Yêu thích
                            </>
                          )}
                        </ActionButton>
                      )}

                      {/* Subscribe - Only for public decks not owned by user */}
                      {activeTab === "public" && deck.creator !== "currentUserId" && (
                        <ActionButton
                          variant="ai"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSubscribe(deck);
                          }}
                        >
                          {deck.isSubscribed ? (
                            <>
                              <NotificationsOff sx={{ fontSize: 18 }} /> Hủy đăng ký
                            </>
                          ) : (
                            <>
                              <Notifications sx={{ fontSize: 18 }} /> Đăng ký
                            </>
                          )}
                        </ActionButton>
                      )}

                      {/* Chia sẻ */}
                      {deck.isPublic && activeTab === "my-decks" && (
                        <ActionButton
                          variant="ai"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShareDeck(deck);
                          }}
                        >
                          <Share sx={{ fontSize: 18 }} /> Chia sẻ
                        </ActionButton>
                      )}

                      {/* Xuất file */}
                      {activeTab === "my-decks" && (
                        <ActionButton
                          variant="edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExportDeck(deck);
                          }}
                        >
                          <GetApp sx={{ fontSize: 18 }} /> Xuất
                        </ActionButton>
                      )}

                      {/* Đánh giá */}
                      {deck.isPublic && (
                        <ActionButton
                          variant="review"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewReviews(deck._id);
                          }}
                        >
                          <RateReview sx={{ fontSize: 18 }} /> Đánh giá
                        </ActionButton>
                      )}

                      {/* AI tạo thêm */}
                      {activeTab === "my-decks" && (
                        <ActionButton
                          variant="ai"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenerateAI(deck);
                          }}
                        >
                          <AutoAwesome sx={{ fontSize: 18 }} /> Tạo thêm
                        </ActionButton>
                      )}

                      {/* Sửa */}
                      {activeTab === "my-decks" && (
                        <ActionButton
                          variant="edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(deck);
                          }}
                        >
                          <Edit sx={{ fontSize: 18 }} /> Sửa
                        </ActionButton>
                      )}

                      {/* Xóa */}
                      {activeTab === "my-decks" && (
                        <ActionButton
                          variant="delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(deck._id);
                          }}
                        >
                          <Delete sx={{ fontSize: 18 }} /> Xóa
                        </ActionButton>
                      )}
                    </TopicActions>
                  </TopicCard>
                ))}
              </TopicsGrid>
            )}

            {/* Pagination for public decks */}
            {activeTab === "public" && totalPages > 1 && (
              <PaginationContainer>
                <PaginationButton
                  disabled={currentPage === 1}
                  onClick={() => fetchPublicDecks(currentPage - 1)}
                >
                  ← Trước
                </PaginationButton>
                <span>Trang {currentPage} / {totalPages}</span>
                <PaginationButton
                  disabled={currentPage === totalPages}
                  onClick={() => fetchPublicDecks(currentPage + 1)}
                >
                  Sau →
                </PaginationButton>
              </PaginationContainer>
            )}
          </MainContent>
        </FormWrapper>
        <RightSidebar />
      </PageLayout>

      {showModal && (
        <Modal onClick={handleCloseModal}>
          <ModalContent theme={theme} onClick={(e) => e.stopPropagation()}>
            <Title theme={theme}>
              {editingDeck ? "Chỉnh sửa bộ thẻ" : "Thêm bộ thẻ mới"}
            </Title>
            <Form onSubmit={handleSubmit}>
              <Input
                theme={theme}
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Tên bộ thẻ"
                required
              />

              <Input
                theme={theme}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Mô tả chi tiết về bộ thẻ"
                required
              />

              <Select
                theme={theme}
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="GENERAL">General - Tổng hợp</option>
                <option value="ACADEMIC">Academic - Học thuật</option>
                <option value="BUSINESS">Business - Kinh doanh</option>
                <option value="TRAVEL">Travel - Du lịch</option>
                <option value="FOOD">Food - Ẩm thực</option>
                <option value="HEALTH">Health - Y tế</option>
              </Select>

              <Select
                theme={theme}
                name="level"
                value={formData.level}
                onChange={handleChange}
                required
              >
                <option value="A1">A1 - Beginner</option>
                <option value="A2">A2 - Elementary</option>
                <option value="B1">B1 - Intermediate</option>
                <option value="B2">B2 - Upper Intermediate</option>
                <option value="C1">C1 - Advanced</option>
                <option value="C2">C2 - Mastery</option>
              </Select>

              <Select
                theme={theme}
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                required
              >
                <option value="BEGINNER">Beginner - Người mới</option>
                <option value="INTERMEDIATE">Intermediate - Trung cấp</option>
                <option value="ADVANCED">Advanced - Nâng cao</option>
              </Select>

              {/* Add isPublic checkbox */}
              <CheckboxContainer>
                <Checkbox
                  type="checkbox"
                  id="isPublic"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData((prev) => ({
                    ...prev,
                    isPublic: e.target.checked,
                  }))}
                />
                <CheckboxLabel theme={theme} htmlFor="isPublic">
                  Công khai bộ thẻ (Mọi người có thể xem và học)
                </CheckboxLabel>
              </CheckboxContainer>

              <ButtonGroup>
                <AddButton type="button" onClick={handleCloseModal}>
                  Hủy
                </AddButton>
                <AddButton type="submit">
                  {editingDeck ? "Cập nhật" : "Tạo mới"}
                </AddButton>
              </ButtonGroup>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </PageWrapper>
  );
};

// Helper function to get icon based on topic type
const getTopicIcon = (type) => {
  switch (type) {
    case "basic":
      return <Book />;
    case "academic":
      return <School />;
    case "business":
      return <Business />;
    case "travel":
      return <BeachAccessIcon />;
    case "food":
      return <Restaurant />;
    case "medical":
      return <LocalHospital />;
    default:
      return <Book />;
  }
};

export default Decks;

// Add new styled components for tabs and pagination
const TabContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e5e7eb;
  overflow-x: auto;
`;

const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  background: none;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  color: ${props => props.active ? '#58CC02' : '#6b7280'};
  border-bottom: 3px solid ${props => props.active ? '#58CC02' : 'transparent'};
  transition: all 0.3s ease;
  white-space: nowrap;

  &:hover {
    color: #58CC02;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  margin-top: 3rem;
  padding: 1.5rem;
`;

const PaginationButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  background: ${props => props.disabled ? '#e5e7eb' : '#58CC02'};
  color: ${props => props.disabled ? '#9ca3af' : 'white'};
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(88, 204, 2, 0.3);
  }
`;
