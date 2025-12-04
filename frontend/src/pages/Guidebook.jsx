import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import books from '../assets/books.png';
import volume from '../assets/audio.png';
import speaking123 from '../assets/speaking123.png';
// ========== STYLED COMPONENTS ==========

const PageWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: linear-gradient(180deg, #f7f9fc 0%, #ffffff 100%);
`;

const MainContent = styled.div`
  flex: 1;
  margin-left: 280px;
  margin-right: 380px;
  padding: 2rem;
  max-width: 1200px;

  @media (max-width: 1400px) {
    margin-right: 320px;
  }

  @media (max-width: 1200px) {
    margin-right: 0;
  }

  @media (max-width: 1024px) {
    margin-left: 240px;
  }

  @media (max-width: 768px) {
    margin-left: 0;
    padding: 1rem;
  }
`;

const Container = styled.div`
  width: 100%;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #1CB0F6;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    background: #DDF4FF;
    transform: translateX(-4px);
  }
`;

const GuideCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
`;

const GuideTitle = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const GuideTitleIcon = styled.img`
  width: 40px;
  height: 40px;
  object-fit: contain;

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
  }
`;

const GuideSubtitle = styled.p`
  font-size: 1rem;
  color: #6b7280;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: #1a1a1a;
  margin: 2rem 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const PhraseCard = styled.div`
  background: #f8fafc;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;

  &:hover {
    border-color: #58CC02;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(88, 204, 2, 0.1);
  }
`;

const PhraseHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
`;

const SpeakerButton = styled.button`
  background: #1CB0F6;
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;

  &:hover {
    background: #0d9ed8;
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const SpeakerIcon = styled.img`
  width: 20px;
  height: 20px;
  object-fit: contain;
  filter: brightness(0) invert(1);
`;

const PhraseText = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;

  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`;

const PhraseTranslation = styled.div`
  font-size: 1rem;
  color: #6b7280;
  margin-top: 0.5rem;
`;

const TipCard = styled.div`
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
  border-radius: 12px;
  padding: 1.5rem;
  margin: 2rem 0;
  border-left: 4px solid #1CB0F6;
`;

const TipTitle = styled.div`
  font-size: 1.125rem;
  font-weight: bold;
  color: #0891b2;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TipIcon = styled.img`
  width: 24px;
  height: 24px;
  object-fit: contain;
`;

const TipText = styled.p`
  font-size: 0.9375rem;
  color: #164e63;
  line-height: 1.6;
  margin: 0;
`;

const StartButton = styled.button`
  background: linear-gradient(135deg, #58CC02 0%, #45a302 100%);
  border: none;
  color: white;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.125rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 2rem;
  box-shadow: 0 4px 0 #46A302;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 0 #46A302;
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 0 #46A302;
  }
`;

// ========== MOCK DATA ==========

const guidebookData = {
  1: {
    unitNumber: 1,
    title: 'Mời khách xơi nước',
    description: 'Học các chủ điểm ngữ pháp và xem các cụm từ chính của cửa này',
    phrases: [
      {
        english: 'Welcome!',
        vietnamese: 'Mời vào!',
        audio: 'welcome'
      },
      {
        english: 'Coffee or tea?',
        vietnamese: 'Cà phê hay trà?',
        audio: 'coffee-or-tea'
      },
      {
        english: 'Water, please.',
        vietnamese: 'Vui lòng cho nước.',
        audio: 'water-please'
      },
      {
        english: 'Thank you, goodbye!',
        vietnamese: 'Cảm ơn, tạm biệt!',
        audio: 'thank-you-goodbye'
      }
    ],
    tips: [
      {
        title: 'Giọng nói',
        content: 'Trong tiếng Anh, giọng nói thường hạ xuống khi kết thúc câu nhưng tăng lên ở cuối câu hỏi có không (yes/no questions).'
      },
      {
        title: 'Cách phát âm',
        content: 'Âm "th" trong "thank" và "the" được phát âm bằng cách để đầu lưỡi của bạn giữa hai hàng răng.'
      }
    ]
  },
  2: {
    unitNumber: 2,
    title: 'Đồ uống',
    description: 'Tìm hiểu về các loại đồ uống và cách gọi đồ uống bằng tiếng Anh',
    phrases: [
      {
        english: 'I\'d like coffee, please.',
        vietnamese: 'Tôi muốn cà phê.',
        audio: 'id-like-coffee'
      },
      {
        english: 'A cup of tea.',
        vietnamese: 'Một tách trà.',
        audio: 'cup-of-tea'
      },
      {
        english: 'With milk?',
        vietnamese: 'Có sữa không?',
        audio: 'with-milk'
      },
      {
        english: 'No sugar, thanks.',
        vietnamese: 'Không đường, cảm ơn.',
        audio: 'no-sugar'
      }
    ],
    tips: [
      {
        title: 'Lịch sự',
        content: 'Sử dụng "please" và "thank you" khi gọi đồ uống để thể hiện sự lịch sự.'
      },
      {
        title: 'Cấu trúc "I\'d like"',
        content: '"I\'d like" (viết tắt của "I would like") là cách lịch sự để nói "I want" khi gọi món.'
      }
    ]
  }
};

// ========== COMPONENT ==========

const Guidebook = () => {
  const navigate = useNavigate();
  const { unitId } = useParams();

  // Parse unitId to get guidebook data
  const unitNumber = parseInt(unitId) || 1;
  const guideData = guidebookData[unitNumber] || guidebookData[1];

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleStartLesson = () => {
    navigate('/learn');
  };

  const handleBack = () => {
    navigate('/learn');
  };

  return (
    <PageWrapper>
      {/* Left Sidebar */}
      <LeftSidebar leftSideVar="learn" />

      {/* Main Content */}
      <MainContent>
        <Container>
          <BackButton onClick={handleBack}>
            ← Trở về
          </BackButton>

          <GuideCard>
            <GuideTitle>
              <GuideTitleIcon src={books} alt="Books" />
              Hướng dẫn Cửa {guideData.unitNumber}
            </GuideTitle>
            <GuideSubtitle>
              {guideData.description}
            </GuideSubtitle>

            {/* Key Phrases Section */}
            <SectionTitle>
              Cụm từ chính
            </SectionTitle>
            
            {guideData.phrases.map((phrase, index) => (
              <PhraseCard key={index}>
                <PhraseHeader>
                  <SpeakerButton onClick={() => speakText(phrase.english)}>
                    <SpeakerIcon src={volume} alt="Volume" />
                  </SpeakerButton>
                  <PhraseText>{phrase.english}</PhraseText>
                </PhraseHeader>
                <PhraseTranslation>{phrase.vietnamese}</PhraseTranslation>
              </PhraseCard>
            ))}

            {/* Tips Section */}
            <SectionTitle>
              💡 Mẹo học tập
            </SectionTitle>

            {guideData.tips.map((tip, index) => (
              <TipCard key={index}>
                <TipTitle>
                  <TipIcon src={speaking123} alt="Tip" />
                  {tip.title}
                </TipTitle>
                <TipText>{tip.content}</TipText>
              </TipCard>
            ))}

            <StartButton onClick={handleStartLesson}>
              Bắt đầu học
            </StartButton>
          </GuideCard>
        </Container>
      </MainContent>

      {/* Right Sidebar */}
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

export default Guidebook;