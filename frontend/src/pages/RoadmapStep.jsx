import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { roadmapTopicService } from '../services/roadmapTopicService';
import { useToast } from '../hooks/useToast';
import {
  CheckCircle,
  ArrowBack,
  VolumeUp,
  School,
  Timer,
  Star
} from '@mui/icons-material';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Styled Components
const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f0fbef 0%, #e6f8e3 40%, #dff4d6 100%);
  padding: 2rem;
`;

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  animation: ${fadeIn} 0.6s ease;
`;

const Header = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 16px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #166a0b;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(-4px);
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  color: #166a0b;
  margin: 0 0 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Subtitle = styled.p`
  font-size: 1.125rem;
  color: #6b7280;
  margin: 0;
`;

const ContentSection = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 16px;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #166a0b;
  margin: 0 0 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const VocabGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
`;

const VocabCard = styled.div`
  background: linear-gradient(135deg, #f0fbef 0%, #e6f7e8 100%);
  padding: 1.5rem;
  border-radius: 12px;
  border: 2px solid #e6f3e6;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(88, 204, 2, 0.15);
  }
`;

const Word = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #166a0b;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Pronunciation = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.75rem;
`;

const Meaning = styled.div`
  font-size: 1rem;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const Example = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  font-style: italic;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
`;

const AudioButton = styled.button`
  background: none;
  border: none;
  color: #58cc02;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const ExerciseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ExerciseCard = styled.div`
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
`;

const Question = styled.div`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const OptionButton = styled.button`
  padding: 1rem;
  background: ${props => {
    if (props.selected && props.isCorrect) return '#e6f7e8';
    if (props.selected && !props.isCorrect) return '#fee2e2';
    return 'white';
  }};
  border: 2px solid ${props => {
    if (props.selected && props.isCorrect) return '#58cc02';
    if (props.selected && !props.isCorrect) return '#dc2626';
    return '#e5e7eb';
  }};
  border-radius: 10px;
  font-weight: 600;
  color: ${props => {
    if (props.selected && props.isCorrect) return '#166a0b';
    if (props.selected && !props.isCorrect) return '#dc2626';
    return '#1f2937';
  }};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: #f0fbef;
    border-color: #58cc02;
    transform: translateY(-2px);
  }
`;

const Explanation = styled.div`
  background: #e6f7e8;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #58cc02;
  margin-top: 1rem;
  font-size: 0.95rem;
  color: #166a0b;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1.25rem;
  background: linear-gradient(135deg, #58cc02, #45a302);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.125rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;

  &:hover:not(:disabled) {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(88, 204, 2, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const RoadmapStep = () => {
  const { roadmapId, stepNumber } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [stepData, setStepData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    loadStep();
  }, [roadmapId, stepNumber]);

  const loadStep = async () => {
    try {
      setLoading(true);
      const response = await roadmapTopicService.getStep(roadmapId, stepNumber);
      
      if (response.success) {
         ('📦 Loaded step data:', response.data);
        
        // Kiểm tra nếu có exercises
        if (response.data.exercises && response.data.exercises.length > 0) {
          showToast('success', 'Đã tải', `${response.data.exercises.length} bài tập`);
        } else if (response.data.step.vocabularySet && response.data.step.vocabularySet.length > 0) {
          showToast('info', 'Từ vựng', `Có ${response.data.step.vocabularySet.length} từ vựng`);
        } else {
          showToast('warning', 'Chưa có bài tập', 'Bài học này đang được cập nhật');
        }
        
        setStepData(response.data);
      }
    } catch (error) {
      console.error('Load step error:', error);
      showToast('error', 'Lỗi', error.response?.data?.message || 'Không thể tải bài học');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (exerciseIndex, answer) => {
    if (showResults) return;
    
    setAnswers(prev => ({
      ...prev,
      [exerciseIndex]: answer
    }));
  };

  const handleSubmit = async () => {
    // Calculate score
    let correctCount = 0;
    stepData.exercises.forEach((exercise, index) => {
      if (answers[index] === exercise.correctAnswer) {
        correctCount++;
      }
    });

    const finalScore = Math.round((correctCount / stepData.exercises.length) * 100);
    setScore(finalScore);
    setShowResults(true);

    // Submit to backend
    try {
      const response = await roadmapTopicService.completeStep(roadmapId, stepNumber, {
        score: finalScore,
        timeSpent: 0
      });

      if (response.success) {
        showToast('success', 'Hoàn thành', response.message);
      }
    } catch (error) {
      console.error('Submit error:', error);
      showToast('error', 'Lỗi', 'Không thể lưu kết quả');
    }
  };

  const speakWord = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <Container>
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <p style={{ fontSize: '1.125rem', color: '#6b7280', fontWeight: 600 }}>
              Đang chuẩn bị bài học...
            </p>
            <p style={{ fontSize: '0.95rem', color: '#9ca3af', marginTop: '0.5rem' }}>
              {stepData?.exercises?.length === 0 ? 'Đang tạo bài tập từ database và AI...' : 'Vui lòng đợi'}
            </p>
          </div>
        </Container>
      </PageWrapper>
    );
  }

  if (!stepData) {
    return (
      <PageWrapper>
        <Container>
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <p>Không tìm thấy bài học</p>
          </div>
        </Container>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Container>
        <Header>
          <BackButton onClick={() => navigate('/roadmap')}>
            <ArrowBack />
            Quay lại lộ trình
          </BackButton>
          <Title>
            <School />
            {stepData.title}
          </Title>
          <Subtitle>{stepData.description}</Subtitle>
        </Header>

        {stepData.step && stepData.step.vocabularySet && stepData.step.vocabularySet.length > 0 && (
          <ContentSection>
            <SectionTitle>
              📚 Từ vựng ({stepData.step.vocabularySet.length} từ)
            </SectionTitle>
            <VocabGrid>
              {stepData.step.vocabularySet.map((vocab, index) => (
                <VocabCard key={index}>
                  <Word>
                    {vocab.word}
                    <AudioButton onClick={() => speakWord(vocab.word)}>
                      <VolumeUp />
                    </AudioButton>
                  </Word>
                  <Pronunciation>{vocab.pronunciation}</Pronunciation>
                  <Meaning>{vocab.meaning}</Meaning>
                  {vocab.example && (
                    <Example>
                      "{vocab.example}"
                      {vocab.exampleTranslation && ` - ${vocab.exampleTranslation}`}
                    </Example>
                  )}
                </VocabCard>
              ))}
            </VocabGrid>
          </ContentSection>
        )}

        {stepData.exercises && stepData.exercises.length > 0 && (
          <ContentSection>
            <SectionTitle>
              ✏️ Bài tập ({stepData.exercises.length} câu)
            </SectionTitle>
            <ExerciseList>
              {stepData.exercises.map((exercise, exerciseIndex) => (
                <ExerciseCard key={exerciseIndex}>
                  <Question>
                    {exerciseIndex + 1}. {exercise.content}
                  </Question>
                  <OptionsGrid>
                    {exercise.options && exercise.options.map((option, optionIndex) => {
                      const optionText = typeof option === 'string' ? option : option.text || option;
                      return (
                        <OptionButton
                          key={optionIndex}
                          selected={answers[exerciseIndex] === optionText}
                          isCorrect={optionText === exercise.correctAnswer}
                          disabled={showResults}
                          onClick={() => handleAnswerSelect(exerciseIndex, optionText)}
                        >
                          {optionText}
                        </OptionButton>
                      );
                    })}
                  </OptionsGrid>
                  {showResults && answers[exerciseIndex] && (
                    <Explanation>
                      {answers[exerciseIndex] === exercise.correctAnswer ? '✅' : '❌'}{' '}
                      {exercise.explanation}
                    </Explanation>
                  )}
                </ExerciseCard>
              ))}
            </ExerciseList>
          </ContentSection>
        )}

        {showResults ? (
          <ContentSection>
            <SectionTitle>
              🎉 Kết quả
            </SectionTitle>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                {score >= 70 ? '🎉' : '📝'}
              </div>
              <div style={{ fontSize: '3rem', fontWeight: '800', color: '#58cc02', marginBottom: '1rem' }}>
                {score}%
              </div>
              <div style={{ fontSize: '1.25rem', color: '#6b7280', marginBottom: '2rem' }}>
                {score >= 70 ? 'Xuất sắc! Bạn đã hoàn thành bài học' : 'Hãy thử lại để đạt điểm cao hơn'}
              </div>
              <SubmitButton onClick={() => navigate('/roadmap')}>
                <CheckCircle />
                Quay về lộ trình
              </SubmitButton>
            </div>
          </ContentSection>
        ) : (
          <SubmitButton 
            onClick={handleSubmit}
            disabled={Object.keys(answers).length !== stepData.exercises.length}
          >
            <CheckCircle />
            Nộp bài ({Object.keys(answers).length}/{stepData.exercises.length})
          </SubmitButton>
        )}
      </Container>
    </PageWrapper>
  );
};

export default RoadmapStep;