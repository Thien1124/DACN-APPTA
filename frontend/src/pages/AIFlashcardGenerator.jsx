import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
import { useNavigate, useLocation } from "react-router-dom";

import {
  AutoAwesome,
  Add,
  Delete,
  Edit,
  Save,
  Refresh,
  CheckCircle,
  ArrowBack,
  ContentCopy,
  Download,
  Upload,
  Lightbulb,
  Psychology,
  School,
  Book,
  VolumeUp,
  Star,
  Close,
} from "@mui/icons-material";
import { useToast } from "../hooks/useToast";
import { geminiService } from "../services/geminiService";
import { deckService } from "../services/deckService";

// ========== ANIMATIONS ==========
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// ========== STYLED COMPONENTS ==========
const PageWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #f0fbef 0%, #e6f8e3 40%, #dff4d6 100%);
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><g fill="%2358CC02" opacity="0.03"><circle cx="120" cy="80" r="120"/><circle cx="560" cy="160" r="100"/><circle cx="400" cy="420" r="140"/></g></svg>');
  background-repeat: no-repeat;
  background-position: right 10% top 10%;
  position: relative; /* Thêm dòng này */
`;

const MainContent = styled.main`
  flex: 1;
  padding: 7rem 2rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
  animation: ${fadeIn} 0.6s ease;

  /* Đảm bảo không bị che */
  position: relative;
  z-index: 1;

  /* Màn hình > 1400px */
  margin-left: 300px; /* 280px + 20px spacing */
  margin-right: 400px; /* 380px + 20px spacing */

  @media (max-width: 1400px) {
    margin-left: 300px;
    margin-right: 340px;
  }

  @media (max-width: 1200px) {
    margin-left: 300px;
    margin-right: 2rem;
  }

  @media (max-width: 1024px) {
    padding: 6rem 1.5rem 1.5rem;
    margin-left: 260px;
    margin-right: 1.5rem;
  }

  @media (max-width: 768px) {
    padding: 5.5rem 1rem 1rem;
    margin-left: 1rem;
    margin-right: 1rem;
  }
`;
const ContentInner = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
  animation: ${slideIn} 0.5s ease;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  color: #166a0b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: white;
  border: 2px solid #e6f3e6;
  border-radius: 12px;
  color: #166a0b;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #f0fbef;
    border-color: #58cc02;
    transform: translateX(-4px);
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  animation: ${fadeIn} 0.6s ease;
`;

const CardTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #166a0b;
  margin: 0 0 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.95rem;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Input = styled.input`
  padding: 0.875rem 1rem;
  border: 2px solid #e6f3e6;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;

  &:focus {
    outline: none;
    border-color: #58cc02;
    box-shadow: 0 4px 12px rgba(88, 204, 2, 0.1);
  }

  &:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
  }
`;

const Textarea = styled.textarea`
  padding: 0.875rem 1rem;
  border: 2px solid #e6f3e6;
  border-radius: 12px;
  font-size: 1rem;
  min-height: 120px;
  font-family: inherit;
  resize: vertical;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #58cc02;
    box-shadow: 0 4px 12px rgba(88, 204, 2, 0.1);
  }

  &:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  padding: 0.875rem 1rem;
  border: 2px solid #e6f3e6;
  border-radius: 12px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #58cc02;
    box-shadow: 0 4px 12px rgba(88, 204, 2, 0.1);
  }

  &:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
  }
`;

const GenerateButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #1cb0f6 0%, #0e8ac9 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(28, 176, 246, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(28, 176, 246, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    animation: ${(props) => (props.loading ? spin : "none")} 1s linear infinite;
  }
`;

const SuggestionChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const Chip = styled.button`
  padding: 0.5rem 1rem;
  background: #e6f7e8;
  color: #166a0b;
  border: 1px solid #58cc02;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #58cc02;
    color: white;
    transform: translateY(-2px);
  }
`;

const ResultsSection = styled.div`
  animation: ${fadeIn} 0.6s ease;
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ResultsTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #166a0b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: ${(props) =>
    props.primary ? "linear-gradient(135deg, #58cc02, #45a302)" : "white"};
  color: ${(props) => (props.primary ? "white" : "#6b7280")};
  border: 2px solid ${(props) => (props.primary ? "transparent" : "#e6f3e6")};
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    background: ${(props) =>
      props.primary ? "linear-gradient(135deg, #45a302, #58cc02)" : "#e6f7e8"};
    border-color: #58cc02;
  }
`;

const FlashcardsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 600px;
  overflow-y: auto;
  padding-right: 0.5rem;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f3f4f6;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #58cc02;
    border-radius: 3px;
  }
`;

const FlashcardItem = styled.div`
  background: ${(props) => (props.editing ? "#fff7e6" : "#f9fafb")};
  padding: 1.25rem;
  border-radius: 12px;
  border: 2px solid ${(props) => (props.editing ? "#fbbf24" : "#e5e7eb")};
  transition: all 0.3s ease;

  &:hover {
    border-color: #58cc02;
    box-shadow: 0 4px 12px rgba(88, 204, 2, 0.1);
  }
`;

const FlashcardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 0.75rem;
`;

const FlashcardWord = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #166a0b;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const FlashcardActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const SmallIconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  color: #6b7280;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e6f7e8;
    color: #166a0b;
  }
`;

const FlashcardContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 0.75rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ContentGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const ContentLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const ContentValue = styled.div`
  font-size: 0.95rem;
  color: #1f2937;
  line-height: 1.5;
`;

const EditInput = styled(Input)`
  margin-top: 0.25rem;
`;

const SaveDeckSection = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-top: 2rem;
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #58cc02, #45a302);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  box-shadow: 0 4px 12px rgba(88, 204, 2, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(88, 204, 2, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const LoadingCard = styled.div`
  background: white;
  padding: 3rem;
  border-radius: 20px;
  text-align: center;
  max-width: 400px;
`;

const LoadingSpinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid #e5e7eb;
  border-top-color: #1cb0f6;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin: 0 auto 1.5rem;
`;

const LoadingText = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #166a0b;
  margin-bottom: 0.5rem;
`;

const LoadingSubtext = styled.div`
  font-size: 0.95rem;
  color: #6b7280;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
`;

const EmptyIcon = styled(Lightbulb)`
  font-size: 5rem;
  color: #d1d5db;
  margin-bottom: 1rem;
`;

const EmptyText = styled.p`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
`;

const EmptyHint = styled.p`
  font-size: 1rem;
  color: #9ca3af;
  margin: 0;
`;

// ========== COMPONENT ==========
const AIFlashcardGenerator = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const location = useLocation();

  const {
    deckId, // Có deckId = thêm vào deck có sẵn
    deckTitle: sourceDeckTitle,
    deckLevel,
    deckCategory,
    isNewDeck, // Flag để tạo deck mới
  } = location.state || {};

  const [formData, setFormData] = useState({
    topic: sourceDeckTitle || "", // ← Auto fill từ deck
    description: "",
    level: deckLevel || "INTERMEDIATE", // ← Auto fill level
    count: 10,
    language: "vi",
  });

  const [generatedCards, setGeneratedCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newDeckTitle, setNewDeckTitle] = useState("");

  const topicSuggestions = [
    "Common English Phrases",
    "Business Vocabulary",
    "Travel Expressions",
    "Food & Cooking",
    "Technology Terms",
    "Daily Conversation",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSuggestionClick = (suggestion) => {
    setFormData((prev) => ({ ...prev, topic: suggestion }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();

    if (!formData.topic.trim()) {
      showToast("warning", "Cảnh báo", "Vui lòng nhập chủ đề");
      return;
    }

    try {
      setLoading(true);

      // === CÁCH 1: Dùng Gemini để tạo danh sách từ ===
      // TODO: Cần có endpoint /api/ai/generate-flashcards hoặc tự generate từ topic
      
      // Tạm thời: Tạo danh sách từ mẫu từ topic
      const mockWords = generateMockWords(formData.topic, formData.count);

      // === CÁCH 2: Dùng Batch Analyze để lấy full data ===
      const result = await geminiService.batchAnalyze(mockWords);

      if (!result.success) {
        throw new Error(result.message || 'Không thể tạo flashcards');
      }

      // Transform AI data sang format frontend
      const cards = result.data.map((aiData) => ({
        word: aiData.word,
        phonetic: aiData.pronunciation || '',
        partOfSpeech: aiData.partOfSpeech || '',
        meaning: aiData.meanings?.[0]?.definition || '',
        translation: aiData.meanings?.[0]?.translation || '',
        example: aiData.meanings?.[0]?.example || '',
        synonyms: aiData.synonyms?.map(s => s.word).join(', ') || '',
        collocations: aiData.collocations?.map(c => c.phrase).join(', ') || '',
        difficulty: aiData.difficulty || 'intermediate',
        cefrLevel: aiData.cefrLevel || 'B1'
      }));

      setGeneratedCards(cards);
      showToast(
        "success",
        "Thành công",
        `✅ Đã tạo ${cards.length} flashcards với AI`
      );

    } catch (error) {
      console.error("Generate error:", error);
      showToast("error", "Lỗi", error.message || "Không thể tạo flashcards");
    } finally {
      setLoading(false);
    }
  };

  // Helper: Tạo danh sách từ mẫu từ topic
  const generateMockWords = (topic, count) => {
    // TODO: Có thể dùng AI để generate danh sách từ liên quan đến topic
    // Hoặc có sẵn database từ vựng theo chủ đề
    
    const topicKeywords = {
      'Common English Phrases': ['hello', 'goodbye', 'thank you', 'please', 'sorry', 'excuse me'],
      'Business Vocabulary': ['negotiate', 'contract', 'proposal', 'deadline', 'revenue', 'profit'],
      'Travel Expressions': ['reservation', 'luggage', 'passport', 'departure', 'arrival', 'accommodation'],
      'Food & Cooking': ['recipe', 'ingredient', 'delicious', 'spicy', 'flavor', 'cuisine'],
      'Technology Terms': ['software', 'hardware', 'algorithm', 'database', 'network', 'security'],
      'Daily Conversation': ['weather', 'family', 'friend', 'work', 'hobby', 'shopping']
    };

    const keywords = topicKeywords[topic] || 
                     topic.toLowerCase().split(' ').slice(0, Math.min(count, 6));
    
    return keywords.slice(0, count);
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
  };

  const handleSaveEdit = (index, field, value) => {
    const updatedCards = [...generatedCards];
    updatedCards[index] = {
      ...updatedCards[index],
      [field]: value,
    };
    setGeneratedCards(updatedCards);
  };

  const handleDelete = (index) => {
    setGeneratedCards((prev) => prev.filter((_, i) => i !== index));
    showToast("success", "Đã xóa", "Đã xóa flashcard");
  };

  const handleSpeak = (word) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSaveToDeck = async () => {
    if (generatedCards.length === 0) {
      showToast("warning", "Cảnh báo", "Không có flashcard nào để lưu");
      return;
    }

    try {
      setLoading(true);
      let targetDeckId = deckId;

      // === TRƯỜNG HỢP 1: Thêm vào deck đã có ===
      if (deckId && !isNewDeck) {
        // Dùng AI Batch Create
        const words = generatedCards.map(card => card.word);
        const result = await geminiService.batchCreate(deckId, words);

        if (!result.success) {
          throw new Error(result.message || "Không thể tạo flashcards");
        }

        showToast(
          "success",
          "Thành công",
          `✅ Đã thêm ${result.data.length} flashcards vào "${sourceDeckTitle}"`
        );
        navigate(`/decks/${deckId}`);
        return;
      }

      // === TRƯỜNG HỢP 2: Tạo deck mới ===
      if (!newDeckTitle.trim()) {
        showToast("warning", "Cảnh báo", "Vui lòng nhập tên bộ thẻ");
        return;
      }

      const deckData = {
        title: newDeckTitle,
        description:
          formData.description || `Bộ thẻ về ${formData.topic} - Tạo bằng AI`,
        category: deckCategory || "GENERAL",
        level: formData.level,
        difficulty:
          formData.level === "BEGINNER"
            ? "BEGINNER"
            : formData.level === "ADVANCED"
            ? "ADVANCED"
            : "INTERMEDIATE",
        isPublic: false,
      };

      const deckResponse = await deckService.create(deckData);

      if (!deckResponse.success) {
        throw new Error("Không thể tạo bộ thẻ");
      }

      targetDeckId = deckResponse.data._id;

      // Dùng AI Batch Create
      const words = generatedCards.map(card => card.word);
      const result = await geminiService.batchCreate(targetDeckId, words);

      if (!result.success) {
        throw new Error(result.message || "Không thể tạo flashcards");
      }

      showToast(
        "success",
        "Thành công",
        `✅ Đã tạo bộ thẻ "${newDeckTitle}" với ${result.data.length} flashcards`
      );
      navigate(`/topics/${targetDeckId}`);
      
    } catch (error) {
      console.error("Save deck error:", error);
      showToast("error", "Lỗi", error.message || "Không thể lưu bộ thẻ");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAll = () => {
    const text = generatedCards
      .map(
        (card) =>
          `${card.word}\n${card.phonetic || ""}\n${card.meaning}\n${
            card.example || ""
          }\n---`
      )
      .join("\n\n");

    navigator.clipboard.writeText(text);
    showToast("success", "Đã sao chép", "Đã sao chép tất cả flashcards");
  };

  const handleRefresh = () => {
    setGeneratedCards([]);
    setNewDeckTitle("");
    setEditingIndex(null);
  };

  return (
    <PageWrapper>
      <LeftSidebar />
      <MainContent>
        <ContentInner>
          <Header>
            <Title>
              <Psychology />
              AI Tạo Flashcard
            </Title>
            <BackButton onClick={() => navigate("/decks")}>
              <ArrowBack />
              Quay lại
            </BackButton>
          </Header>
          {/* Thêm thông báo này */}
          {deckId && !isNewDeck && (
            <Card
              style={{
                background: "linear-gradient(135deg, #e6f7e8 0%, #f0fbef 100%)",
                border: "2px solid #58cc02",
                marginBottom: "2rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <CheckCircle style={{ color: "#58cc02", fontSize: "1.5rem" }} />
                <div>
                  <strong style={{ color: "#166a0b" }}>
                    Đang thêm flashcards vào bộ thẻ:
                  </strong>
                  <div style={{ color: "#374151", marginTop: "0.25rem" }}>
                    {sourceDeckTitle}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Thông báo khi tạo deck mới */}
          {isNewDeck && (
            <Card
              style={{
                background: "linear-gradient(135deg, #dbeafe 0%, #e0f2fe 100%)",
                border: "2px solid #1CB0F6",
                marginBottom: "2rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <AutoAwesome style={{ color: "#1CB0F6", fontSize: "1.5rem" }} />
                <div>
                  <strong style={{ color: "#0369a1" }}>
                    Chế độ: Tạo bộ thẻ mới với AI
                  </strong>
                  <div
                    style={{
                      color: "#374151",
                      marginTop: "0.25rem",
                      fontSize: "0.9rem",
                    }}
                  >
                    Nhập thông tin và tạo flashcards, sau đó đặt tên để lưu
                    thành bộ thẻ mới
                  </div>
                </div>
              </div>
            </Card>
          )}
          <Grid>
            <Card>
              <CardTitle>
                <AutoAwesome />
                Cài đặt tạo Flashcard
              </CardTitle>
              <Form onSubmit={handleGenerate}>
                <FormGroup>
                  <Label>
                    <Book />
                    Chủ đề
                  </Label>
                  <Input
                    type="text"
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    placeholder="VD: Common English Phrases"
                    disabled={loading}
                  />
                  <SuggestionChips>
                    {topicSuggestions.map((suggestion, index) => (
                      <Chip
                        key={index}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        disabled={loading}
                      >
                        {suggestion}
                      </Chip>
                    ))}
                  </SuggestionChips>
                </FormGroup>

                <FormGroup>
                  <Label>
                    <Lightbulb />
                    Mô tả chi tiết (tùy chọn)
                  </Label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Mô tả thêm về nội dung bạn muốn tạo..."
                    disabled={loading}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>
                    <School />
                    Trình độ
                  </Label>
                  <Select
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="BEGINNER">Beginner - Người mới</option>
                    <option value="INTERMEDIATE">
                      Intermediate - Trung cấp
                    </option>
                    <option value="ADVANCED">Advanced - Nâng cao</option>
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label>Số lượng flashcards</Label>
                  <Input
                    type="number"
                    name="count"
                    value={formData.count}
                    onChange={handleChange}
                    min="5"
                    max="50"
                    disabled={loading}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Ngôn ngữ giải thích</Label>
                  <Select
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                  </Select>
                </FormGroup>

                <GenerateButton
                  type="submit"
                  disabled={loading}
                  loading={loading}
                >
                  {loading ? (
                    <>
                      <AutoAwesome />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <AutoAwesome />
                      Tạo Flashcards
                    </>
                  )}
                </GenerateButton>
              </Form>
            </Card>
          </Grid>

          {generatedCards.length > 0 && (
            <ResultsSection>
              <Card>
                <ResultsHeader>
                  <ResultsTitle>
                    <CheckCircle />
                    Kết quả ({generatedCards.length} flashcards)
                  </ResultsTitle>
                  <ActionButtons>
                    <IconButton onClick={handleCopyAll} title="Sao chép tất cả">
                      <ContentCopy />
                    </IconButton>
                    <IconButton onClick={handleRefresh} title="Làm mới">
                      <Refresh />
                    </IconButton>
                  </ActionButtons>
                </ResultsHeader>

                <FlashcardsList>
                  {generatedCards.map((card, index) => (
                    <FlashcardItem key={index} editing={editingIndex === index}>
                      <FlashcardHeader>
                        <FlashcardWord>
                          {editingIndex === index ? (
                            <EditInput
                              value={card.word}
                              onChange={(e) =>
                                handleSaveEdit(index, "word", e.target.value)
                              }
                              onBlur={() => setEditingIndex(null)}
                              autoFocus
                            />
                          ) : (
                            <>
                              {card.word}
                              <SmallIconButton
                                onClick={() => handleSpeak(card.word)}
                              >
                                <VolumeUp />
                              </SmallIconButton>
                            </>
                          )}
                        </FlashcardWord>
                        <FlashcardActions>
                          <SmallIconButton onClick={() => handleEdit(index)}>
                            <Edit />
                          </SmallIconButton>
                          <SmallIconButton onClick={() => handleDelete(index)}>
                            <Delete />
                          </SmallIconButton>
                        </FlashcardActions>
                      </FlashcardHeader>

                      <FlashcardContent>
                        <ContentGroup>
                          <ContentLabel>Phiên âm</ContentLabel>
                          {editingIndex === index ? (
                            <EditInput
                              value={card.phonetic || ""}
                              onChange={(e) =>
                                handleSaveEdit(
                                  index,
                                  "phonetic",
                                  e.target.value
                                )
                              }
                              placeholder="VD: /həˈloʊ/"
                            />
                          ) : (
                            <ContentValue>
                              {card.phonetic || "N/A"}
                            </ContentValue>
                          )}
                        </ContentGroup>

                        <ContentGroup>
                          <ContentLabel>Loại từ</ContentLabel>
                          <ContentValue>
                            {card.partOfSpeech || "N/A"}
                          </ContentValue>
                        </ContentGroup>

                        <ContentGroup>
                          <ContentLabel>Nghĩa</ContentLabel>
                          {editingIndex === index ? (
                            <Textarea
                              value={card.meaning}
                              onChange={(e) =>
                                handleSaveEdit(index, "meaning", e.target.value)
                              }
                              style={{ minHeight: "60px" }}
                            />
                          ) : (
                            <ContentValue>{card.meaning}</ContentValue>
                          )}
                        </ContentGroup>

                        <ContentGroup>
                          <ContentLabel>Ví dụ</ContentLabel>
                          {editingIndex === index ? (
                            <Textarea
                              value={card.example || ""}
                              onChange={(e) =>
                                handleSaveEdit(index, "example", e.target.value)
                              }
                              placeholder="Nhập ví dụ..."
                              style={{ minHeight: "60px" }}
                            />
                          ) : (
                            <ContentValue>{card.example || "N/A"}</ContentValue>
                          )}
                        </ContentGroup>
                      </FlashcardContent>
                    </FlashcardItem>
                  ))}
                </FlashcardsList>

                <SaveDeckSection>
                  {/* Chỉ hiện input tên deck khi tạo mới hoặc chưa có deckId */}
                  {(!deckId || isNewDeck) && (
                    <FormGroup>
                      <Label>Tên bộ thẻ mới</Label>
                      <Input
                        value={newDeckTitle}
                        onChange={(e) => setNewDeckTitle(e.target.value)}
                        placeholder="VD: Common English Phrases - Intermediate"
                      />
                    </FormGroup>
                  )}

                  <SaveButton onClick={handleSaveToDeck} disabled={loading}>
                    <Save />
                    {deckId && !isNewDeck
                      ? `Thêm vào "${sourceDeckTitle}" (${generatedCards.length} flashcards)`
                      : `Tạo Bộ Thẻ Mới (${generatedCards.length} flashcards)`}
                  </SaveButton>
                </SaveDeckSection>
              </Card>
            </ResultsSection>
          )}

          {!loading && generatedCards.length === 0 && (
            <Card>
              <EmptyState>
                <EmptyIcon />
                <EmptyText>Chưa có flashcard nào</EmptyText>
                <EmptyHint>
                  Nhập thông tin và nhấn "Tạo Flashcards" để bắt đầu
                </EmptyHint>
              </EmptyState>
            </Card>
          )}
        </ContentInner>
      </MainContent>
      <RightSidebar />

      {loading && (
        <LoadingOverlay>
          <LoadingCard>
            <LoadingSpinner />
            <LoadingText>AI đang tạo flashcards...</LoadingText>
            <LoadingSubtext>Vui lòng đợi trong giây lát</LoadingSubtext>
          </LoadingCard>
        </LoadingOverlay>
      )}
    </PageWrapper>
  );
};

export default AIFlashcardGenerator;
