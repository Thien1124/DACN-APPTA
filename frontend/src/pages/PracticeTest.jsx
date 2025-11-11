import React, { useState, useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styled, { keyframes, css } from "styled-components";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  VolumeUp,
  ArrowBack,
  Flag,
  Timer,
  CheckCircle,
  EmojiEvents,
} from "@mui/icons-material";

// ========== ANIMATIONS ==========
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
`;

const celebrate = keyframes`
  0% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.2) rotate(-10deg); }
  50% { transform: scale(1.3) rotate(10deg); }
  75% { transform: scale(1.2) rotate(-5deg); }
  100% { transform: scale(1) rotate(0deg); }
`;

// ========== STYLED COMPONENTS ==========
const PageWrapper = styled.div`
  position: relative;
  min-height: 100vh;
  padding-top: 56px;
  padding-left: 260px;
  padding-right: 300px;
  box-sizing: border-box;
  background: linear-gradient(135deg, #f0fbef 0%, #e6f8e3 40%, #dff4d6 100%);
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><g fill="%2358CC02" opacity="0.03"><circle cx="120" cy="80" r="120"/><circle cx="560" cy="160" r="100"/><circle cx="400" cy="420" r="140"/></g></svg>');
  background-repeat: no-repeat;
  background-position: right 10% top 10%;

  @media (max-width: 1300px) {
    padding-left: 220px;
    padding-right: 260px;
  }

  @media (max-width: 1100px) {
    padding-left: 16px;
    padding-right: 16px;
  }
`;

const MainContent = styled.main`
  width: 100%;
  padding: 2.25rem 1.5rem 2.5rem;
  animation: ${fadeIn} 0.45s ease;
  box-sizing: border-box;
  min-height: calc(100vh - 120px);

  @media (max-width: 1100px) {
    padding: 1.25rem;
  }
`;

const ContentInner = styled.div`
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e6f3e6;
  animation: ${slideIn} 0.5s ease;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 800;
  color: #166a0b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Progress = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #6b7280;
  font-weight: 700;
  font-size: 1rem;
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

const Row = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;

  @media (max-width: 900px) {
    flex-direction: column;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 14px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  animation: ${fadeIn} 0.6s ease;
  flex: 1;
  min-width: 0;
`;

const QuestionText = styled.div`
  font-size: 1.3rem;
  color: #166a0b;
  margin-bottom: 1.5rem;
  font-weight: 700;
  line-height: 1.5;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const SpeakButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: #e9f9e6;
  border: 1px solid #c8f3c2;
  color: #166a0b;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #d4f7cd;
    transform: scale(1.05);
  }
`;

const Choices = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;
const CelebrateIcon = styled(EmojiEvents)`
  color: #58cc02;
  font-size: 2rem;
  animation: ${celebrate} 1s ease;
`;
const ChoiceBtn = styled.button`
  text-align: left;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  border: 2px solid ${(props) => (props.$selected ? "#58cc02" : "#e6f3e6")};
  background: ${(props) => {
    if (props.$finished && props.$isCorrect) return "#e6f7e8";
    if (props.$finished && props.$selected && !props.$isCorrect)
      return "#fff5f5";
    if (props.$selected) return "#f0fff1";
    return "#ffffff";
  }};
  color: ${(props) => {
    if (props.$finished && props.$isCorrect) return "#166a0b";
    if (props.$finished && props.$selected && !props.$isCorrect)
      return "#7a1b1b";
    return "#0f5132";
  }};
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  font-weight: 700;
  font-size: 1rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(88, 204, 2, 0.1);
    border-color: #58cc02;
  }

  ${(props) =>
    props.$shake &&
    css`
      animation: ${shake} 0.5s ease;
    `}
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e6f3e6;
  border-radius: 12px;
  font-size: 1rem;
  background: white;
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

const Textarea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 0.875rem 1rem;
  border: 2px solid #e6f3e6;
  border-radius: 12px;
  font-size: 1rem;
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

const Footer = styled.div`
  margin-top: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const NavBtns = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const Btn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.95rem;
  background: ${(props) =>
    props.primary ? "linear-gradient(135deg, #58cc02, #45a302)" : "white"};
  color: ${(props) => (props.primary ? "white" : "#166a0b")};
  border: 2px solid ${(props) => (props.primary ? "transparent" : "#e6f3e6")};
  box-shadow: ${(props) =>
    props.primary ? "0 4px 12px rgba(88, 204, 2, 0.2)" : "none"};
  transition: all 0.3s ease;
  position: relative; // ← Thêm cho tooltip

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${(props) =>
      props.primary
        ? "0 8px 20px rgba(88, 204, 2, 0.3)"
        : "0 4px 12px rgba(88, 204, 2, 0.1)"};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    background: #d1d5db; // ← Màu xám khi disabled
    color: #6b7280;
  }
`;

const Sidebar = styled.aside`
  width: 280px; // ← Tăng từ 220px
  min-width: 240px; // ← Tăng từ 180px
  background: white;
  border-radius: 12px;
  padding: 1.5rem; // ← Tăng padding
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  height: fit-content;
  position: sticky;
  top: 7.5rem;

  @media (max-width: 900px) {
    width: 100%;
    position: relative;
    top: 0;
  }
`;

const SidebarTitle = styled.h4`
  margin: 0 0 0.75rem;
  font-size: 0.95rem;
  color: #166a0b;
  font-weight: 800;
`;

const NumberGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.5rem;
  width: 100%; // ← Thêm để đảm bảo full width

  @media (max-width: 480px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const NumberButton = styled.button`
  width: 100%; // ← Thêm để button chiếm full cell
  aspect-ratio: 1;
  padding: 0.5rem;
  border-radius: 10px;
  border: 2px solid ${(props) => (props.$active ? "#166a0b" : "transparent")};
  background: ${(props) => {
    if (props.$finished && props.$correct)
      return "linear-gradient(135deg, #58cc02, #45a302)";
    if (props.$finished && props.$wrong) return "#ffcfcf";
    if (props.$answered) return "#e6f7e8";
    return "#f3f4f6"; // ← Đổi từ #ffffff sang màu nhạt để dễ nhìn
  }};
  color: ${(props) => {
    if (props.$finished && props.$correct) return "#ffffff";
    if (props.$finished && props.$wrong) return "#7a1b1b";
    if (props.$answered) return "#166a0b";
    return "#6b7280";
  }};
  cursor: pointer;
  font-weight: 800;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  box-shadow: ${(props) =>
    props.$finished && props.$correct
      ? "0 4px 12px rgba(88, 204, 2, 0.2)"
      : "none"};
  min-height: 40px; // ← Đảm bảo chiều cao tối thiểu

  &:hover {
    transform: translateY(-3px);
    opacity: 0.95;
  }
`;

const PairColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
`;

const PairCard = styled.button`
  background: ${(props) => {
    if (props.matched) return "#e6f7e8";
    if (props.selected) return "#e6f3ff";
    return "white";
  }};
  border: 2px solid
    ${(props) => {
      if (props.matched) return "#58cc02";
      if (props.selected) return "#1CB0F6";
      return "#e6f3e6";
    }};
  border-radius: 12px;
  padding: 0.875rem 1rem;
  text-align: left;
  font-weight: 700;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(88, 204, 2, 0.1);
  }
`;

const PairNumber = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: ${(props) => (props.matched ? "#58cc02" : "#f3f4f6")};
  color: ${(props) => (props.matched ? "#fff" : "#6b7280")};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  flex-shrink: 0;
`;

const MatchIcon = styled.div`
  margin-left: auto;
  color: #58cc02;
  font-weight: 900;
  font-size: 1.25rem;
`;

const ResultOverlay = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  padding: 1rem;
`;

const ResultBox = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 20px;
  width: 720px;
  max-width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ResultHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e6f3e6;
`;

const ResultTitle = styled.h3`
  margin: 0;
  color: #166a0b;
  font-size: 1.5rem;
  font-weight: 800;
`;

const ResultSummary = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #58cc02;
  font-weight: 700;
  font-size: 1.25rem;
`;

const ResultList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;
const AudioButton = styled(SpeakButton)`
  background: linear-gradient(135deg, #0ea5e9, #0284c7);
  border-color: #0369a1;
  color: white;

  &:hover {
    background: linear-gradient(135deg, #0284c7, #0369a1);
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
  }
`;
const ResultItem = styled.div`
  background: ${(props) => (props.correct ? "#e6f7e8" : "#fff5f5")};
  border: 2px solid ${(props) => (props.correct ? "#58cc02" : "#e02424")};
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
`;
const WarningBox = styled.div`
  background: #fff7ed;
  border: 2px solid #fb923c;
  border-radius: 12px;
  padding: 1rem;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #9a3412;
  animation: ${fadeIn} 0.3s ease;
`;

const WarningIcon = styled(Flag)`
  color: #fb923c;
  font-size: 1.5rem;
`;

const WarningText = styled.div`
  flex: 1;

  strong {
    display: block;
    font-size: 1rem;
    margin-bottom: 0.25rem;
  }

  div {
    font-size: 0.9rem;
  }
`;


const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;
const QIndex = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: ${(props) =>
    props.correct ? "linear-gradient(135deg, #58cc02, #45a302)" : "#ef4444"};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  flex-shrink: 0;
`;
const TimeWarningBanner = styled.div`
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  color: white;
  padding: 1rem 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(220, 38, 38, 0.4);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 700;
  font-size: 1.1rem;
  animation: ${shake} 0.5s ease infinite;
`;
const QA = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const QText = styled.div`
  font-weight: 700;
  color: #166a0b;
  font-size: 1rem;
`;

const AnswerRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const AnswerBox = styled.div`
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  color: ${(props) => props.color || "#0f5132"};
  background: ${(props) => props.bg || "#f3f4f6"};
`;

const CloseRow = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
`;

// ========== HELPER FUNCTIONS ==========
const areObjectsEqual = (obj1, obj2) => {
  if (!obj1 && !obj2) return true;
  if (!obj1 || !obj2) return false;
  if (
    typeof obj1 !== "object" ||
    typeof obj2 !== "object" ||
    obj1 === null ||
    obj2 === null
  ) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!obj2.hasOwnProperty(key) || obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
};
const getTimerColor = (seconds, total) => {
  const percentage = (seconds / total) * 100;
  if (percentage <= 10) return '#dc2626'; // Đỏ - dưới 10%
  if (percentage <= 25) return '#f59e0b'; // Cam - dưới 25%
  return '#166a0b'; // Xanh - bình thường
};
const getLetter = (i) => String.fromCharCode(65 + i);

const fallbackMock = [
  {
    id: "q1",
    type: "multiple_choice",
    prompt: 'What is the plural of "mouse"?',
    choices: ["mouses", "mice", "mices"],
    correctAnswer: "mice",
  },
  {
    id: "q2",
    type: "multiple_choice",
    prompt: "Choose the correct sentence:",
    choices: ["He go to school", "He goes to school", "He going to school"],
    correctAnswer: "He goes to school",
  },
  {
    id: "q3",
    type: "fill_blank",
    prompt: "She ___ (be) a teacher.",
    choices: ["is", "are", "am"],
    correctAnswer: "is",
  },
  {
    id: "q4",
    type: "translate",
    prompt: 'Translate to English: "Tôi thích trà"',
    correctAnswer: "I like tea",
  },
  {
    id: "q5",
    type: "write",
    prompt: "Write a short sentence about your last holiday.",
  },
];
const TimerDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${props => {
    const pct = (props.$timeLeft / props.$totalTime) * 100;
    if (pct <= 10) return 'linear-gradient(135deg, #fee2e2, #fecaca)';
    if (pct <= 25) return 'linear-gradient(135deg, #ffedd5, #fed7aa)';
    return 'linear-gradient(135deg, #f0fdf4, #dcfce7)';
  }};
  border: 2px solid ${props => {
    const pct = (props.$timeLeft / props.$totalTime) * 100;
    if (pct <= 10) return '#dc2626';
    if (pct <= 25) return '#f59e0b';
    return '#16a34a';
  }};
  border-radius: 12px;
  font-weight: 800;
  font-size: 1.1rem;
  color: ${props => getTimerColor(props.$timeLeft, props.$totalTime)};
  
  ${props => props.$timeLeft <= 60 && css`
    animation: ${pulse} 1s ease infinite;
  `}
  
  svg {
    font-size: 1.3rem;
  }
`;
// ========== COMPONENT ==========
const PracticeTest = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  const passed = location.state?.questions;

  // Normalize incoming questions (support different backend shapes)
  const questions = useMemo(() => {
    const src = Array.isArray(passed) && passed.length ? passed : fallbackMock;
    return src.map((raw, idx) => {
      // id
      const id = raw.id || raw._id || `q_${idx}`;

      // prompt / question fallback
      const prompt = raw.prompt || raw.question || raw.title || raw.text || raw.promptText || "";

      // choices: either plain array of strings, or options array of { text, isCorrect, _id }
      let choices = [];
      if (Array.isArray(raw.choices) && raw.choices.length && typeof raw.choices[0] === "string") {
        choices = raw.choices;
      } else if (Array.isArray(raw.options) && raw.options.length) {
        choices = raw.options.map(opt => (typeof opt === "string" ? opt : (opt.text || opt.value || String(opt._id || ""))));
      } else if (Array.isArray(raw.choices) && raw.choices.length && typeof raw.choices[0] === "object") {
        choices = raw.choices.map(c => c.text || c.value || String(c._id || ""));
      }

      // left/right for match pairs
      const left = raw.left || raw.leftColumn || (raw.correctAnswer && typeof raw.correctAnswer === "object" ? Object.keys(raw.correctAnswer) : raw.left || []);
      const right = raw.right || raw.rightColumn || (raw.correctAnswer && typeof raw.correctAnswer === "object" ? Object.values(raw.correctAnswer) : raw.right || []);

      // audio detection
      const audio = raw.audio || raw.audioUrl || raw.audioText || raw.sound;

      // correctAnswer: try to unify id/_id/text
      let correctAnswer = raw.correctAnswer ?? raw.correct_answer ?? raw.answer ?? null;
      if (!correctAnswer && Array.isArray(raw.options)) {
        const correctOpt = raw.options.find(o => o.isCorrect || o.is_correct);
        correctAnswer = correctOpt ? (correctOpt._id || correctOpt.text || null) : null;
      }

      return {
        ...raw,
        id,
        prompt,
        choices,
        left,
        right,
        audio,
        correctAnswer
      };
    });
  }, [passed]);

  // use normalized questions
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState({});
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [pairSelectedLeft, setPairSelectedLeft] = useState(null);
  const [shakeCard, setShakeCard] = useState(false);

  const TIME_LIMIT = location.state?.timeLimit || questions.length * 60; // Mặc định: 1 phút/câu
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [isRunning, setIsRunning] = useState(true); // Đang chạy hay không

  const audioElRef = useRef(null);
  const timerRef = useRef(null);
  const q = questions[index];

const speakText = (text) => {
  if (!text || !text.toString().trim()) {
    console.warn('⚠️ Không có text để phát âm');
    return;
  }

  // ✅ Cancel bất kỳ speech nào đang chạy
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }

  // ✅ Hàm chọn giọng ENGLISH tốt nhất
  const getEnglishVoice = (voices) => {
    console.log('📋 Available voices:', voices.map(v => `${v.name} (${v.lang})`));

    // ✅ 1. Ưu tiên Google US English
    let voice = voices.find(v => 
      v.lang === 'en-US' && 
      v.name.toLowerCase().includes('google')
    );
    if (voice) {
      console.log('✅ Chọn Google US:', voice.name);
      return voice;
    }

    // ✅ 2. Microsoft David/Zira (Windows)
    voice = voices.find(v => 
      v.lang === 'en-US' && 
      (v.name.includes('David') || v.name.includes('Zira'))
    );
    if (voice) {
      console.log('✅ Chọn Microsoft:', voice.name);
      return voice;
    }

    // ✅ 3. Samantha (macOS)
    voice = voices.find(v => 
      v.lang === 'en-US' && 
      v.name.includes('Samantha')
    );
    if (voice) {
      console.log('✅ Chọn Samantha:', voice.name);
      return voice;
    }

    // ✅ 4. BẤT KỲ giọng en-US nào (KHÔNG phải en-GB)
    voice = voices.find(v => v.lang === 'en-US');
    if (voice) {
      console.log('✅ Chọn en-US:', voice.name);
      return voice;
    }

    // ✅ 5. Bất kỳ giọng English nào (en-GB, en-AU...)
    voice = voices.find(v => v.lang && v.lang.startsWith('en-'));
    if (voice) {
      console.log('✅ Chọn English:', voice.name);
      return voice;
    }

    // ✅ 6. LOẠI BỎ tất cả giọng Vietnamese
    voice = voices.find(v => 
      v.lang && 
      !v.lang.startsWith('vi') && 
      !v.name.toLowerCase().includes('vietnam')
    );
    if (voice) {
      console.log('⚠️ Fallback voice:', voice.name);
      return voice;
    }

    console.error('❌ Không tìm thấy giọng English!');
    return null;
  };

  // ✅ Hàm thực hiện speak
  const doSpeak = (selectedVoice) => {
    const utterance = new SpeechSynthesisUtterance(text.toString());
    
    // ✅ QUAN TRỌNG: Set voice TRƯỚC khi set lang
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    // ✅ Luôn set lang = en-US
    utterance.lang = 'en-US';
    
    // ✅ Điều chỉnh giọng nói
    utterance.rate = 0.9;   // Tốc độ (0.1 - 10)
    utterance.pitch = 1.0;  // Cao độ (0 - 2)
    utterance.volume = 1.0; // Âm lượng (0 - 1)

    utterance.onstart = () => {
      console.log(`🔊 Đang đọc: "${text}"`);
      console.log(`   Voice: ${utterance.voice?.name || 'default'}`);
      console.log(`   Lang: ${utterance.lang}`);
    };

    utterance.onend = () => {
      console.log('✅ Hoàn thành');
    };

    utterance.onerror = (err) => {
      if (err.error !== 'canceled') {
        console.error('❌ Lỗi:', err.error);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  // ✅ Lấy danh sách voices
  let voices = window.speechSynthesis.getVoices();

  if (voices.length > 0) {
    // ✅ Đã có voices, chọn ngay
    const englishVoice = getEnglishVoice(voices);
    doSpeak(englishVoice);
  } else {
    
    // ✅ Chỉ set event 1 lần
    window.speechSynthesis.onvoiceschanged = () => {
      voices = window.speechSynthesis.getVoices();
      console.log(`✅ Loaded ${voices.length} voices`);
      
      const englishVoice = getEnglishVoice(voices);
      doSpeak(englishVoice);
      
      // ✅ Clear event sau khi dùng xong
      window.speechSynthesis.onvoiceschanged = null;
    };
  }
};

  const isAudioSrc = (src) => {
    if (!src || typeof src !== "string") return false;
    if (
      src.startsWith("data:") ||
      src.startsWith("blob:") ||
      src.startsWith("/")
    )
      return true;
    if (src.includes("://")) return true;
    return /\.(mp3|wav|ogg|m4a|aac|webm)(\?.*)?$/i.test(src);
  };

  const playAudioFile = (src) => {
    if (!src) return;
    if (isAudioSrc(src)) {
      try {
        if (audioElRef.current) {
          if (audioElRef.current.src !== src) {
            audioElRef.current.src = src;
            audioElRef.current.load();
          } else {
            audioElRef.current.currentTime = 0;
          }
          audioElRef.current
            .play()
            .catch((err) => console.warn("audio play failed:", err));
          return;
        }
        const a = new Audio(src);
        a.play().catch((err) => console.warn("audio play failed:", err));
      } catch (err) {
        console.error("playAudioFile error", err);
      }
      return;
    }
    speakText(src);
  };
  const formatTime = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

  // ✅ COUNTDOWN TIMER
useEffect(() => {
  if (isRunning && !finished && timeLeft > 0) {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // HẾT GIỜ - TỰ ĐỘNG NỘP BÀI
          setIsRunning(false);
          clearInterval(timerRef.current);
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  } else {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }

  return () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };
}, [isRunning, finished, timeLeft]);

// Reset timer khi bắt đầu bài mới
useEffect(() => {
  setIndex(0);
  setAnswers({});
  setChecked({});
  setFinished(false);
  setScore(0);
  setTimeLeft(TIME_LIMIT);  // ← Reset về thời gian ban đầu
  setIsRunning(true);
}, [questions, params, TIME_LIMIT]);
  useEffect(() => {
    if (!q) return;

    const ttype = String(q.type || "").toLowerCase();

    // ✅ CHỈ AUTO-PLAY KHI CÓ FIELD `audio`
    const shouldAutoPlay = !!q.audio;

    if (!shouldAutoPlay) return;

    const t = setTimeout(() => {
      if (isAudioSrc(q.audio)) {
        playAudioFile(q.audio);
      } else {
        speakText(q.audio);
      }
    }, 350);

    return () => {
      clearTimeout(t);
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, [q]);

  useEffect(() => {
    setIndex(0);
    setAnswers({});
    setChecked({});
    setFinished(false);
    setScore(0);
  }, [questions, params]);

  const handleChoose = (value) => {
    setAnswers((prev) => ({ ...prev, [q.id]: value }));
  };

  const handleInput = (e) => {
    setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }));
  };

  const isAnswered = (item) => {
    if (!item) return false;
    const a = answers[item.id];
    if (!a && a !== 0) return false;
    if (typeof a === "object") return Object.keys(a).length > 0;
    return String(a).trim().length > 0;
  };

  const handleNext = () => {
    setIndex((i) => Math.min(questions.length - 1, i + 1));
  };

  const handlePrev = () => {
    setIndex((i) => Math.max(0, i - 1));
  };

  const handleFinish = () => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    const resultMap = {};
    let correct = 0;

    questions.forEach((item) => {
      const user = answers[item.id];
      let ok = false;

      const itemType = String(item.type || "").toLowerCase();

      if (itemType === "match_pairs") {
        ok = areObjectsEqual(user, item.correctAnswer);
      } else if (
        [
          "multiple_choice",
          "listen_choice",
          "vocabulary",
          "grammar",
          "reading",
        ].includes(itemType)
      ) {
        ok =
          String(user || "").trim() === String(item.correctAnswer || "").trim();
      } else if (
        ["fill_blank", "translate", "listen_write"].includes(itemType)
      ) {
        ok =
          String(user || "")
            .trim()
            .toLowerCase() ===
          String(item.correctAnswer || "")
            .trim()
            .toLowerCase();
      } else if (itemType === "write") {
        ok = !!(user && String(user).trim().length > 0);
      }

      resultMap[item.id] = ok;
      if (ok) correct++;
    });

    setChecked(resultMap);
    setScore(correct);
    setFinished(true);
  };

  const onCloseResult = () => {
    setFinished(false);
    navigate("/practice");
  };

  const answeredCount = useMemo(() => {
    return questions.filter((q) => isAnswered(q)).length;
  }, [questions, answers]);

  const renderChoices = () => {
    if (!q.choices || !q.choices.length) return null;
    return (
      <Choices>
        {q.choices.map((c, idx) => {
          const selected = answers[q.id] === c;
          const isCorrect = String(c) === String(q.correctAnswer);

          return (
            <ChoiceBtn
              key={idx}
              onClick={() => {
                if (finished) return;
                handleChoose(c);
              }}
              disabled={finished}
              $selected={selected}
              $finished={finished}
              $isCorrect={isCorrect}
              $shake={shakeCard && selected && !isCorrect}
            >
              <div style={{ flex: 1 }}>{c}</div>
              {finished && isCorrect && (
                <Check style={{ color: "#58cc02", marginLeft: "auto" }} />
              )}
              {finished && selected && !isCorrect && (
                <X style={{ color: "#e02424", marginLeft: "auto" }} />
              )}
            </ChoiceBtn>
          );
        })}
      </Choices>
    );
  };

  const renderCurrent = () => {
    if (!q) return <div>Không có câu hỏi</div>;

    const ttype = String(q.type || "").toLowerCase();
    const hasAudio = !!q.audio; // Chỉ check field audio

    return (
      <>
        <QuestionText>
          {index + 1}. {q.prompt}
          {hasAudio && (
            <SpeakButton
              onClick={() => {
                if (isAudioSrc(q.audio)) {
                  playAudioFile(q.audio);
                } else {
                  speakText(q.audio);
                }
              }}
              title="Phát audio bài nghe"
            >
              <VolumeUp style={{ fontSize: "1.2rem" }} />
            </SpeakButton>
          )}
        </QuestionText>

        {[
          "multiple_choice",
          "listen_choice",
          "vocabulary",
          "reading",
          "grammar",
        ].includes(ttype) && renderChoices()}

        {ttype === "fill_blank" && (
          <>
            {renderChoices()}
            <Input
              placeholder="Nhập đáp án"
              value={answers[q.id] || ""}
              onChange={handleInput}
              disabled={finished}
            />
          </>
        )}

        {ttype === "translate" && (
          <Input
            placeholder="Gõ bản dịch bằng tiếng Anh"
            value={answers[q.id] || ""}
            onChange={handleInput}
            disabled={finished}
          />
        )}

        {ttype === "listen_write" && (
          <>
            {q.audio && isAudioSrc(q.audio) && (
              <audio
                controls
                src={q.audio}
                style={{
                  width: "100%",
                  marginBottom: "1rem",
                  borderRadius: "8px",
                }}
              />
            )}
            <Input
              placeholder="Gõ nội dung nghe được"
              value={answers[q.id] || ""}
              onChange={handleInput}
              disabled={finished}
            />
          </>
        )}

        {ttype === "match_pairs" && (
          <div style={{ display: "flex", gap: "1rem" }}>
            <PairColumn>
              {q.left.map((l, li) => {
                const mapping = answers[q.id] || {};
                const matched = !!mapping[l];
                const selected = pairSelectedLeft === l;
                return (
                  <PairCard
                    key={l}
                    matched={matched}
                    selected={selected}
                    disabled={finished}
                    onClick={() => {
                      if (finished) return;
                      setPairSelectedLeft((prev) => (prev === l ? null : l));
                    }}
                  >
                    <PairNumber matched={matched}>{getLetter(li)}</PairNumber>
                    <div style={{ flex: 1 }}>{l}</div>
                    {matched && <MatchIcon>✓</MatchIcon>}
                  </PairCard>
                );
              })}
            </PairColumn>

            <PairColumn>
              {q.right.map((r, ri) => {
                const mapping = answers[q.id] || {};
                const reverseMatchLeft = Object.keys(mapping).find(
                  (k) => mapping[k] === r
                );
                const matched = !!reverseMatchLeft;
                return (
                  <PairCard
                    key={r}
                    matched={matched}
                    disabled={finished}
                    onClick={() => {
                      if (finished) return;
                      if (!pairSelectedLeft) return;

                      setAnswers((prev) => {
                        const cur = { ...(prev[q.id] || {}) };
                        Object.keys(cur).forEach((leftId) => {
                          if (cur[leftId] === r) delete cur[leftId];
                        });
                        cur[pairSelectedLeft] = r;
                        return { ...prev, [q.id]: cur };
                      });
                      setPairSelectedLeft(null);
                    }}
                  >
                    <PairNumber matched={matched}>
                      {getLetter(ri + (q.left?.length || 0))}
                    </PairNumber>
                    <div style={{ flex: 1 }}>{r}</div>
                    {matched && <MatchIcon>✓</MatchIcon>}
                  </PairCard>
                );
              })}
            </PairColumn>
          </div>
        )}

        {ttype === "write" && (
          <Textarea
            placeholder="Viết câu trả lời..."
            value={answers[q.id] || ""}
            onChange={handleInput}
            disabled={finished}
          />
        )}
      </>
    );
  };

  if (finished) {
  const accuracy = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const timeUsed = TIME_LIMIT - timeLeft; // Thời gian đã dùng
  const isTimeout = timeLeft === 0; // Hết giờ hay nộp sớm

  return (
    <PageWrapper>
      <MainContent>
        <ContentInner>
          <ResultOverlay>
            <ResultBox>
              <ResultHeader>
                <ResultTitle>
                  <CelebrateIcon />
                  Kết quả chi tiết
                </ResultTitle>
                <ResultSummary>
                  <CheckCircle />
                  {score}/{questions.length} ({accuracy}%)
                  <span style={{ margin: '0 0.5rem' }}>•</span>
                  <Timer style={{ fontSize: '1.1rem' }} />
                  {formatTime(timeUsed)}
                  {isTimeout && (
                    <span style={{ 
                      color: '#dc2626', 
                      fontSize: '0.9rem',
                      marginLeft: '0.5rem'
                    }}>
                      (Hết giờ)
                    </span>
                  )}
                </ResultSummary>
              </ResultHeader>


                <ResultList>
                  {questions.map((item, i) => {
                    const userAnswer = answers[item.id];
                    const isCorrect = checked[item.id] === true;
                    const itemType = String(item.type || "").toLowerCase();

                    return (
                      <ResultItem key={item.id} correct={isCorrect}>
                        <QIndex correct={isCorrect}>{i + 1}</QIndex>
                        <QA>
                          <QText>{item.prompt}</QText>
                          <AnswerRow>
                            {["multiple_choice", "listen_choice"].includes(
                              itemType
                            ) && (
                              <>
                                <AnswerBox
                                  color={isCorrect ? "#58cc02" : "#e02424"}
                                  bg={
                                    isCorrect
                                      ? "rgba(88, 204, 2, 0.1)"
                                      : "rgba(224, 36, 36, 0.1)"
                                  }
                                >
                                  Bạn chọn: {userAnswer || "(Bỏ trống)"}
                                </AnswerBox>
                                {!isCorrect && (
                                  <AnswerBox color="#166a0b" bg="#f3f4f6">
                                    Đáp án đúng: {item.correctAnswer}
                                  </AnswerBox>
                                )}
                              </>
                            )}

                            {(itemType === "fill_blank" ||
                              itemType === "translate" ||
                              itemType === "listen_write") && (
                              <>
                                <AnswerBox
                                  color={isCorrect ? "#58cc02" : "#e02424"}
                                  bg={
                                    isCorrect
                                      ? "rgba(88, 204, 2, 0.1)"
                                      : "rgba(224, 36, 36, 0.1)"
                                  }
                                >
                                  Bạn viết: {userAnswer || "(Bỏ trống)"}
                                </AnswerBox>
                                {!isCorrect && (
                                  <AnswerBox color="#166a0b" bg="#f3f4f6">
                                    Đáp án đúng: {item.correctAnswer}
                                  </AnswerBox>
                                )}
                              </>
                            )}

                            {itemType === "write" && (
                              <AnswerBox color="#166a0b" bg="#f3f4f6">
                                Bạn viết: {userAnswer || "(Bỏ trống)"}
                              </AnswerBox>
                            )}

                            {itemType === "match_pairs" &&
                              (() => {
                                const correctAns = item.correctAnswer;
                                const userAns = userAnswer || {};
                                const isCorrectAnsObj =
                                  typeof correctAns === "object" &&
                                  correctAns !== null;

                                return (
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: "0.5rem",
                                      width: "100%",
                                    }}
                                  >
                                    {item.left &&
                                      item.left.map((leftItem, idx) => {
                                        const userMatch =
                                          userAns[leftItem] || "(Bỏ trống)";
                                        const correctMatch = isCorrectAnsObj
                                          ? correctAns[leftItem] || "(Không có)"
                                          : "(Lỗi đáp án)";
                                        const pairIsCorrect =
                                          isCorrectAnsObj &&
                                          userMatch === correctMatch;

                                        return (
                                          <div key={idx}>
                                            <strong
                                              style={{ color: "#166a0b" }}
                                            >
                                              {leftItem}
                                            </strong>
                                            <span
                                              style={{ margin: "0 0.5rem" }}
                                            >
                                              →
                                            </span>
                                            <span
                                              style={{
                                                color: pairIsCorrect
                                                  ? "#58cc02"
                                                  : "#e02424",
                                                fontWeight: "700",
                                              }}
                                            >
                                              {userMatch}
                                              {!pairIsCorrect && (
                                                <span
                                                  style={{
                                                    color: "#6b7280",
                                                    fontWeight: "500",
                                                  }}
                                                >
                                                  {" "}
                                                  (Đúng: {correctMatch})
                                                </span>
                                              )}
                                            </span>
                                          </div>
                                        );
                                      })}
                                  </div>
                                );
                              })()}
                          </AnswerRow>
                        </QA>
                      </ResultItem>
                    );
                  })}
                </ResultList>

                <CloseRow>
                  <Btn onClick={() => setFinished(false)}>Xem lại</Btn>
                  <Btn primary onClick={onCloseResult}>
                    Về trang luyện tập
                  </Btn>
                </CloseRow>
              </ResultBox>
            </ResultOverlay>
          </ContentInner>
        </MainContent>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <MainContent>
        <ContentInner>
          <Header>
  <Title>
    <Flag />
    Kiểm tra: {params.type || 'Practice'}
  </Title>
  
  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
    {/* ✅ TIMER COUNTDOWN */}
    <TimerDisplay $timeLeft={timeLeft} $totalTime={TIME_LIMIT}>
      <Timer />
      {formatTime(timeLeft)}
    </TimerDisplay>
    
    <Progress>
      {index + 1}/{questions.length}
      <span style={{ margin: '0 0.5rem' }}>•</span>
      Đã trả lời: {answeredCount}/{questions.length}
    </Progress>
  </div>
</Header>
{timeLeft > 0 && timeLeft <= 60 && !finished && (
  <TimeWarningBanner>
    <Timer style={{ fontSize: '1.5rem' }} />
    Còn {timeLeft} giây! Hãy nộp bài ngay!
  </TimeWarningBanner>
)}
          <Row>
            <Card>
              {renderCurrent()}
              {answeredCount < questions.length && (
                <WarningBox>
                  <WarningIcon />
                  <WarningText>
                    <strong>Chưa hoàn thành!</strong>
                    <div>
                      Bạn cần làm thêm{" "}
                      <strong>{questions.length - answeredCount}</strong> câu
                      hỏi để có thể nộp bài.
                    </div>
                  </WarningText>
                </WarningBox>
              )}
              <Footer>
                <NavBtns>
                  <Btn onClick={handlePrev} disabled={index === 0}>
                    <ChevronLeft /> Trước
                  </Btn>
                  <Btn
                    onClick={handleNext}
                    disabled={index === questions.length - 1}
                  >
                    Sau <ChevronRight />
                  </Btn>
                </NavBtns>

                <Btn 
  primary 
  onClick={handleFinish}
  disabled={answeredCount < questions.length}
  title={answeredCount < questions.length 
    ? `Bạn cần làm thêm ${questions.length - answeredCount} câu` 
    : 'Nộp bài'
  }
>
  <CheckCircle />
  Nộp bài ({answeredCount}/{questions.length})
</Btn>
              </Footer>
            </Card>

            <Sidebar>
              <SidebarTitle>Số câu hỏi</SidebarTitle>
              <NumberGrid>
                {questions.map((item, i) => {
                  const active = index === i;
                  const wasAnswered = isAnswered(item);
                  const correct = finished ? !!checked[item.id] : false;
                  const wrong = finished ? checked[item.id] === false : false;

                  return (
                    <NumberButton
                      key={item.id}
                      $answered={wasAnswered}
                      $active={active}
                      $correct={correct}
                      $wrong={wrong}
                      $finished={finished}
                      onClick={() => setIndex(i)}
                    >
                      {i + 1}
                    </NumberButton>
                  );
                })}
              </NumberGrid>
            </Sidebar>
          </Row>
        </ContentInner>
      </MainContent>
    </PageWrapper>
  );
};

export default PracticeTest;
