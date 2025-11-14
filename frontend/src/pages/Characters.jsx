import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import volume from '../assets/audio.png';

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
  max-width: 800px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.125rem;
  color: #6b7280;
  margin-bottom: 2rem;
`;

const StartButton = styled.button`
  background: linear-gradient(135deg, #1CB0F6 0%, #0d9ed8 100%);
  border: none;
  color: white;
  padding: 1rem 2.5rem;
  border-radius: 12px;
  font-size: 1.125rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 0 #0891b2;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 0 #0891b2;
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 0 #0891b2;
  }
`;

const Section = styled.div`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const CharacterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const CharacterCard = styled.button`
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  position: relative;

  &:hover {
    border-color: #1CB0F6;
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(28, 176, 246, 0.2);
  }

  &:active {
    transform: translateY(-2px);
  }
`;

const CharacterSymbol = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
`;

const CharacterPronunciation = styled.div`
  font-size: 1rem;
  color: #6b7280;
  font-weight: 600;
`;

const CharacterExample = styled.div`
  font-size: 0.875rem;
  color: #9ca3af;
`;

const SpeakerButton = styled.button`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: #1CB0F6;
  border: none;
  width: 32px;
  height: 32px;
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
  width: 16px;
  height: 16px;
  object-fit: contain;
  filter: brightness(0) invert(1);
`;

const InfoCard = styled.div`
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 16px;
  padding: 1.5rem;
  border-left: 4px solid #fbbf24;
  margin-top: 2rem;
`;

const InfoTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: bold;
  color: #92400e;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const InfoText = styled.p`
  font-size: 0.9375rem;
  color: #78350f;
  line-height: 1.6;
  margin: 0;
`;

// ========== DATA ==========

const vowelSounds = [
  { symbol: 'a', pronunciation: 'hot', example: 'cat', audio: '/æ/' },
  { symbol: 'æ', pronunciation: 'cat', example: 'apple', audio: '/æ/' },
  { symbol: 'ʌ', pronunciation: 'but', example: 'cup', audio: '/ʌ/' },
  { symbol: 'ɛ', pronunciation: 'bed', example: 'pen', audio: '/ɛ/' },
  { symbol: 'eɪ', pronunciation: 'say', example: 'day', audio: '/eɪ/' },
  { symbol: 'ə', pronunciation: 'bird', example: 'about', audio: '/ə/' },
  { symbol: 'ɪ', pronunciation: 'ship', example: 'sit', audio: '/ɪ/' },
  { symbol: 'i', pronunciation: 'sheep', example: 'see', audio: '/i:/' },
  { symbol: 'ə', pronunciation: 'about', example: 'sofa', audio: '/ə/' },
  { symbol: 'ɒ', pronunciation: 'boat', example: 'hot', audio: '/ɒ/' },
  { symbol: 'o', pronunciation: 'foot', example: 'good', audio: '/ʊ/' },
  { symbol: 'u', pronunciation: 'food', example: 'blue', audio: '/u:/' },
  { symbol: 'aʊ', pronunciation: 'cow', example: 'house', audio: '/aʊ/' },
  { symbol: 'aɪ', pronunciation: 'time', example: 'like', audio: '/aɪ/' },
  { symbol: 'ɔɪ', pronunciation: 'boy', example: 'coin', audio: '/ɔɪ/' }
];

const consonantSounds = [
  { symbol: 'b', pronunciation: 'book', example: 'ball', audio: '/b/' },
  { symbol: 'tʃ', pronunciation: 'chair', example: 'church', audio: '/tʃ/' },
  { symbol: 'd', pronunciation: 'day', example: 'dog', audio: '/d/' },
  { symbol: 'f', pronunciation: 'fish', example: 'far', audio: '/f/' },
  { symbol: 'g', pronunciation: 'good', example: 'go', audio: '/g/' },
  { symbol: 'h', pronunciation: 'hat', example: 'house', audio: '/h/' },
  { symbol: 'dʒ', pronunciation: 'jump', example: 'job', audio: '/dʒ/' },
  { symbol: 'k', pronunciation: 'key', example: 'cat', audio: '/k/' },
  { symbol: 'l', pronunciation: 'leg', example: 'like', audio: '/l/' },
  { symbol: 'm', pronunciation: 'man', example: 'make', audio: '/m/' },
  { symbol: 'n', pronunciation: 'no', example: 'name', audio: '/n/' },
  { symbol: 'ŋ', pronunciation: 'sing', example: 'thing', audio: '/ŋ/' },
  { symbol: 'p', pronunciation: 'pen', example: 'put', audio: '/p/' },
  { symbol: 'r', pronunciation: 'red', example: 'run', audio: '/r/' },
  { symbol: 's', pronunciation: 'sun', example: 'sea', audio: '/s/' },
  { symbol: 'ʃ', pronunciation: 'shoe', example: 'ship', audio: '/ʃ/' },
  { symbol: 't', pronunciation: 'top', example: 'tea', audio: '/t/' },
  { symbol: 'θ', pronunciation: 'thing', example: 'think', audio: '/θ/' },
  { symbol: 'ð', pronunciation: 'this', example: 'that', audio: '/ð/' },
  { symbol: 'v', pronunciation: 'very', example: 'voice', audio: '/v/' },
  { symbol: 'w', pronunciation: 'wet', example: 'we', audio: '/w/' },
  { symbol: 'j', pronunciation: 'yes', example: 'you', audio: '/j/' },
  { symbol: 'z', pronunciation: 'zoo', example: 'zero', audio: '/z/' },
  { symbol: 'ʒ', pronunciation: 'measure', example: 'vision', audio: '/ʒ/' }
];

// ========== COMPONENT ==========

const Characters = () => {
  const navigate = useNavigate();
  const [earnedXP] = useState(10);

  
const speakSound = (text) => {
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

  const handleStartPractice = () => {
    navigate('/pronunciation-practice');
  };

  return (
    <PageWrapper>
      {/* Left Sidebar */}
      <LeftSidebar />

      {/* Main Content */}
      <MainContent>
        <Container>
          <Header>
            <Title>Cùng học phát âm tiếng Anh!</Title>
            <Subtitle>Tập nghe và học phát âm các âm trong tiếng Anh</Subtitle>
            <StartButton onClick={handleStartPractice}>
              BẮT ĐẦU +{earnedXP} KN
            </StartButton>
          </Header>

          {/* Vowels Section */}
          <Section>
            <SectionTitle>Nguyên âm</SectionTitle>
            <CharacterGrid>
              {vowelSounds.map((sound, index) => (
                <CharacterCard key={index}>
                  <SpeakerButton onClick={(e) => {
                    e.stopPropagation();
                    speakSound(sound.example);
                  }}>
                    <SpeakerIcon src={volume} alt="Speak" />
                  </SpeakerButton>
                  <CharacterSymbol>{sound.symbol}</CharacterSymbol>
                  <CharacterPronunciation>{sound.pronunciation}</CharacterPronunciation>
                  <CharacterExample>{sound.example}</CharacterExample>
                </CharacterCard>
              ))}
            </CharacterGrid>
          </Section>

          {/* Consonants Section */}
          <Section>
            <SectionTitle>Phụ âm</SectionTitle>
            <CharacterGrid>
              {consonantSounds.map((sound, index) => (
                <CharacterCard key={index}>
                  <SpeakerButton onClick={(e) => {
                    e.stopPropagation();
                    speakSound(sound.example);
                  }}>
                    <SpeakerIcon src={volume} alt="Speak" />
                  </SpeakerButton>
                  <CharacterSymbol>{sound.symbol}</CharacterSymbol>
                  <CharacterPronunciation>{sound.pronunciation}</CharacterPronunciation>
                  <CharacterExample>{sound.example}</CharacterExample>
                </CharacterCard>
              ))}
            </CharacterGrid>
          </Section>

          {/* Info Card */}
          <InfoCard>
            <InfoTitle>
              💡 Mẹo học phát âm
            </InfoTitle>
            <InfoText>
              Nhấp vào nút loa để nghe cách phát âm của từng âm. Luyện tập thường xuyên 
              để cải thiện khả năng phát âm và nghe hiểu tiếng Anh của bạn!
            </InfoText>
          </InfoCard>
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

export default Characters;