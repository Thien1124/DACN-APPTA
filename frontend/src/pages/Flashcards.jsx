import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowBack, ArrowForward, Refresh, Edit, School } from '@mui/icons-material';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';

// Import icons from Material-UI
import { Apple, Cake, Home, Pets } from '@mui/icons-material';

const PageWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
`;

const MainContent = styled.div`
  flex: 1;
  margin-left: 280px;
  margin-right: 380px;
  padding: 2rem;
  
  @media (max-width: 1400px) {
    margin-right: 320px;
  }
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const StudyButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #58CC02;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  
  &:hover {
    background: #45a302;
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const FlashcardContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
`;

const Card = styled(motion.div)`
  width: 600px;
  height: 400px;
  perspective: 1000px;
  cursor: pointer;
`;

const CardInner = styled(motion.div)`
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.8s;
  transform-style: preserve-3d;
  transform: ${props => props.isFlipped ? 'rotateY(180deg)' : 'rotateY(0)'};
`;

const CardFace = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-size: 2rem;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background: white;

  .icon-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .icon-label {
    font-size: 1.2rem;
    color: #666;
    margin-top: 1rem;
  }
`;

const CardBack = styled(CardFace)`
  transform: rotateY(180deg);
  background: #f8f9fa;
`;

const Controls = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: #58CC02;
  color: white;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: #45a302;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const TypeInContainer = styled.div`
  width: 100%;
  max-width: 600px;
  margin-top: 2rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1.1rem;
  margin-bottom: 1rem;
  
  &:focus {
    border-color: #58CC02;
    outline: none;
  }
`;

// Mock data
const mockFlashcards = [
  { 
    id: 1, 
    front: <Apple sx={{ fontSize: 100, color: "#ff0000" }} />, 
    back: "Quả táo", 
    example: "This is an apple" 
  },
  { 
    id: 2, 
    front: <Cake sx={{ fontSize: 100, color: "#ff69b4" }} />, 
    back: "Bánh kem", 
    example: "The birthday cake looks delicious" 
  },
  { 
    id: 3, 
    front: "Car", 
    back: "Xe hơi", 
    example: "I drive a car to work" 
  },
  { 
    id: 4, 
    front: <Home sx={{ fontSize: 100, color: "#8b4513" }} />, 
    back: "Ngôi nhà", 
    example: "This is my home" 
  },
  { 
    id: 5, 
    front: <Pets sx={{ fontSize: 100, color: "#a0522d" }} />, 
    back: "Thú cưng", 
    example: "I love my pet" 
  }
];

const Flashcards = () => {
  const [theme] = useState('light');
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isTypeMode, setIsTypeMode] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [showResult, setShowResult] = useState(false);

  const currentCard = mockFlashcards[currentIndex];

  const handleNext = () => {
    if (currentIndex < mockFlashcards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex(prev => prev + 1);
      resetTypeMode();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex(prev => prev - 1);
      resetTypeMode();
    }
  };

  const handleFlip = () => {
    if (!isTypeMode) {
      setIsFlipped(!isFlipped);
    }
  };

  const resetTypeMode = () => {
    setUserInput('');
    setShowResult(false);
  };

  const handleTypeSubmit = (e) => {
    e.preventDefault();
    setShowResult(true);
  };

  const isCorrect = userInput.toLowerCase().trim() === currentCard.back.toLowerCase().trim();

  return (
    <PageWrapper>
      <LeftSidebar />
      
      <MainContent>
        <Header>
          <Title theme={theme}>
            <School /> Flashcards
          </Title>
          
          <StudyButton onClick={() => setIsStudyMode(!isStudyMode)}>
            {isStudyMode ? 'Thoát ôn tập' : 'Bắt đầu ôn tập'}
          </StudyButton>
        </Header>

        {isStudyMode ? (
          <FlashcardContainer>
            {!isTypeMode ? (
              <Card onClick={handleFlip}>
                <CardInner isFlipped={isFlipped}>
                  <CardFace>
                    <div className="icon-container">
                      {currentCard.front}
                      <p className="icon-label">Click to flip</p>
                    </div>
                  </CardFace>
                  <CardBack>
                    <div className="icon-container">
                      <h2>{currentCard.back}</h2>
                      <p className="icon-label">{currentCard.example}</p>
                    </div>
                  </CardBack>
                </CardInner>
              </Card>
            ) : (
              <TypeInContainer>
                <div className="icon-container" style={{ marginBottom: '2rem' }}>
                  {currentCard.front}
                </div>
                <form onSubmit={handleTypeSubmit}>
                  <Input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Nhập nghĩa tiếng Việt..."
                    disabled={showResult}
                  />
                  {!showResult ? (
                    <Button type="submit">Kiểm tra</Button>
                  ) : (
                    <div style={{ 
                      padding: '1rem', 
                      borderRadius: '8px',
                      backgroundColor: isCorrect ? '#deffde' : '#ffe6e6',
                      marginBottom: '1rem'
                    }}>
                      {isCorrect ? 
                        'Chính xác! 🎉' : 
                        `Chưa chính xác. Đáp án đúng là: ${currentCard.back}`
                      }
                    </div>
                  )}
                </form>
              </TypeInContainer>
            )}

            <Controls>
              <Button onClick={handlePrevious} disabled={currentIndex === 0}>
                <ArrowBack /> Previous
              </Button>
              <Button onClick={() => setIsTypeMode(!isTypeMode)}>
                <Edit /> {isTypeMode ? 'Flip Mode' : 'Type Mode'}
              </Button>
              <Button onClick={() => {
                setCurrentIndex(0);
                setIsFlipped(false);
                resetTypeMode();
              }}>
                <Refresh /> Reset
              </Button>
              <Button 
                onClick={handleNext} 
                disabled={currentIndex === mockFlashcards.length - 1}
              >
                Next <ArrowForward />
              </Button>
            </Controls>

            <div style={{ marginTop: '1rem', color: '#666' }}>
              Card {currentIndex + 1} of {mockFlashcards.length}
            </div>
          </FlashcardContainer>
        ) : (
          <div style={{ textAlign: 'center', color: '#666', marginTop: '2rem' }}>
            Nhấn "Bắt đầu ôn tập" để luyện tập với flashcards
          </div>
        )}
      </MainContent>

      <RightSidebar
        lessonsToUnlock={8}
        dailyGoal={{
          current: 10,
          target: 10,
          label: 'Kiếm 10 KN'
        }}
        streak={1}
        showProfile={true}
      />
    </PageWrapper>
  );
};

export default Flashcards;