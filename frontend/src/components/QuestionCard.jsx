import React, { useState } from 'react';
import styled from 'styled-components';

// ========== STYLED COMPONENTS ==========

const Card = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'rgba(31, 41, 55, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)'
  };
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 2rem;
  border: 1px solid ${props => props.theme === 'dark' 
    ? 'rgba(75, 85, 99, 0.3)' 
    : 'rgba(229, 231, 235, 0.5)'
  };
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const QuestionNumber = styled.div`
  background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-weight: bold;
  font-size: 0.875rem;
`;

const QuestionType = styled.div`
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  background: ${props => props.theme === 'dark' ? '#374151' : '#f3f4f6'};
  color: ${props => props.theme === 'dark' ? '#e5e7eb' : '#374151'};
`;

const QuestionText = styled.h3`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#f9fafb' : '#1a1a1a'};
  margin-bottom: 1.5rem;
  line-height: 1.5;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const QuestionImage = styled.img`
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  border-radius: 16px;
  margin-bottom: 1.5rem;
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Option = styled.button`
  padding: 1.25rem;
  border-radius: 16px;
  border: 2px solid ${props => {
    if (props.isCorrect && props.showAnswer) return '#58CC02';
    if (props.isSelected && !props.isCorrect && props.showAnswer) return '#ef4444';
    if (props.isSelected) return '#1CB0F6';
    return props.theme === 'dark' ? '#374151' : '#e5e7eb';
  }};
  background: ${props => {
    if (props.isCorrect && props.showAnswer) return 'rgba(88, 204, 2, 0.1)';
    if (props.isSelected && !props.isCorrect && props.showAnswer) return 'rgba(239, 68, 68, 0.1)';
    if (props.isSelected) return 'rgba(28, 176, 246, 0.1)';
    return props.theme === 'dark' ? '#1f2937' : '#ffffff';
  }};
  color: ${props => props.theme === 'dark' ? '#e5e7eb' : '#374151'};
  font-size: 1rem;
  font-weight: 600;
  text-align: left;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
  overflow: hidden;

  &:hover:not(:disabled) {
    transform: translateX(5px);
    border-color: #58CC02;
  }

  &:disabled {
    opacity: 0.7;
  }
`;

const OptionLabel = styled.span`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => {
    if (props.isCorrect && props.showAnswer) return '#58CC02';
    if (props.isSelected && !props.isCorrect && props.showAnswer) return '#ef4444';
    if (props.isSelected) return '#1CB0F6';
    return props.theme === 'dark' ? '#374151' : '#e5e7eb';
  }};
  color: ${props => {
    if (props.isCorrect && props.showAnswer) return 'white';
    if (props.isSelected && !props.isCorrect && props.showAnswer) return 'white';
    if (props.isSelected) return 'white';
    return props.theme === 'dark' ? '#9ca3af' : '#6b7280';
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
  transition: all 0.3s ease;
`;

const OptionText = styled.span`
  flex: 1;
`;

const OptionIcon = styled.span`
  font-size: 1.5rem;
`;

const Explanation = styled.div`
  margin-top: 1.5rem;
  padding: 1.25rem;
  border-radius: 16px;
  background: ${props => {
    if (props.isCorrect) return 'rgba(88, 204, 2, 0.1)';
    return 'rgba(239, 68, 68, 0.1)';
  }};
  border: 2px solid ${props => props.isCorrect ? '#58CC02' : '#ef4444'};
  animation: slideIn 0.4s ease;

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
`;

const ExplanationTitle = styled.div`
  font-weight: bold;
  font-size: 1.125rem;
  color: ${props => props.isCorrect ? '#58CC02' : '#ef4444'};
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ExplanationText = styled.p`
  color: ${props => props.theme === 'dark' ? '#d1d5db' : '#4b5563'};
  line-height: 1.6;
  margin: 0;
`;

// ========== COMPONENT ==========

const QuestionCard = ({
  questionNumber = 1,
  questionType = 'Multiple Choice',
  question,
  options = [],
  correctAnswer,
  explanation = '',
  image,
  theme = 'light',
  onAnswer,
  showAnswerImmediately = true,
}) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleOptionClick = (optionIndex) => {
    if (showAnswer) return;

    setSelectedOption(optionIndex);
    
    if (showAnswerImmediately) {
      setShowAnswer(true);
      if (onAnswer) {
        onAnswer(optionIndex === correctAnswer);
      }
    } else {
      if (onAnswer) {
        onAnswer(optionIndex === correctAnswer);
      }
    }
  };

  const optionLabels = ['A', 'B', 'C', 'D', 'E'];
  const isCorrectAnswer = selectedOption === correctAnswer;

  return (
    <Card theme={theme}>
      <QuestionHeader>
        <QuestionNumber>Câu {questionNumber}</QuestionNumber>
        <QuestionType theme={theme}>{questionType}</QuestionType>
      </QuestionHeader>

      <QuestionText theme={theme}>{question}</QuestionText>

      {image && <QuestionImage src={image} alt="Question illustration" />}

      <OptionsContainer>
        {options.map((option, index) => (
          <Option
            key={index}
            theme={theme}
            isSelected={selectedOption === index}
            isCorrect={index === correctAnswer}
            showAnswer={showAnswer}
            disabled={showAnswer}
            onClick={() => handleOptionClick(index)}
          >
            <OptionLabel
              theme={theme}
              isSelected={selectedOption === index}
              isCorrect={index === correctAnswer}
              showAnswer={showAnswer}
            >
              {showAnswer && index === correctAnswer ? '✓' : 
               showAnswer && selectedOption === index && !isCorrectAnswer ? '✗' :
               optionLabels[index]}
            </OptionLabel>
            <OptionText>{option}</OptionText>
            {showAnswer && index === correctAnswer && (
              <OptionIcon>🎉</OptionIcon>
            )}
          </Option>
        ))}
      </OptionsContainer>

      {showAnswer && explanation && (
        <Explanation isCorrect={isCorrectAnswer}>
          <ExplanationTitle isCorrect={isCorrectAnswer}>
            <span>{isCorrectAnswer ? '✓' : '✗'}</span>
            {isCorrectAnswer ? 'Chính xác!' : 'Chưa đúng!'}
          </ExplanationTitle>
          <ExplanationText theme={theme}>{explanation}</ExplanationText>
        </Explanation>
      )}
    </Card>
  );
};

export default QuestionCard;