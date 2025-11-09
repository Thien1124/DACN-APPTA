import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import { Search, VolumeUp, Star, StarBorder, BookmarkBorder, Bookmark, FilterList, School } from '@mui/icons-material';
import { vocabularyService } from '../services/vocabularyService'; 
import useToast from '../hooks/useToast';
import { vocabularyBankService } from '../services/vocabularyBankService';


// ========== ANIMATIONS ==========
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
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
  margin-left: 300px;  /* 280px + 20px spacing */
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
const Header = styled.div`
  margin-bottom: 2rem;
  animation: ${slideIn} 0.5s ease;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  color: #166a0b;
  margin: 0 0 0.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #5b6b5b;
  margin: 0;
`;

const ControlsBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchBox = styled.div`
  flex: 1;
  position: relative;
  min-width: 300px;

  @media (max-width: 768px) {
    min-width: 100%;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.9rem 1rem 0.9rem 3rem;
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
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #5b6b5b;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.9rem 1.5rem;
  background: ${props => props.active ? '#58cc02' : 'white'};
  color: ${props => props.active ? 'white' : '#166a0b'};
  border: 2px solid ${props => props.active ? '#58cc02' : '#e6f3e6'};
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(88, 204, 2, 0.2);
  }
`;

const StatsBar = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  text-align: center;
  animation: ${fadeIn} 0.6s ease;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 800;
  color: #58cc02;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.95rem;
  color: #5b6b5b;
  font-weight: 600;
`;

const VocabGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const VocabCard = styled.div`
  background: white;
  border-radius: 14px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.6s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(88, 204, 2, 0.15);
  }
`;

const VocabHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
`;

const VocabWord = styled.div`
  flex: 1;
`;

const Word = styled.h3`
  font-size: 1.5rem;
  font-weight: 800;
  color: #166a0b;
  margin: 0 0 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Pronunciation = styled.div`
  font-size: 0.95rem;
  color: #5b6b5b;
  font-style: italic;
`;

const VocabActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const IconButton = styled.button`
  background: ${props => props.active ? '#58cc02' : '#f3f4f6'};
  color: ${props => props.active ? 'white' : '#5b6b5b'};
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
    background: ${props => props.active ? '#46a302' : '#e6f3e6'};
  }
`;

const VocabMeaning = styled.div`
  font-size: 1rem;
  color: #374151;
  margin-bottom: 1rem;
  line-height: 1.5;
`;

const VocabExample = styled.div`
  background: #f9fafb;
  padding: 1rem;
  border-radius: 8px;
  border-left: 3px solid #58cc02;
  font-size: 0.95rem;
  color: #4b5563;
  line-height: 1.6;
  font-style: italic;
`;

const VocabTags = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

const Tag = styled.span`
  background: #e6f7e8;
  color: #166a0b;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  animation: ${fadeIn} 0.6s ease;
`;

const EmptyIcon = styled(School)`
  font-size: 5rem;
  color: #d1d5db;
  margin-bottom: 1rem;
`;

const EmptyText = styled.p`
  font-size: 1.25rem;
  color: #6b7280;
  font-weight: 600;
`;

// ========== COMPONENT ==========
const Worldbank = () => {
  const { showToast } = useToast(); 
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, starred, learned
  const [vocabularies, setVocabularies] = useState([]);
  const [filteredVocabs, setFilteredVocabs] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    learned: 0,
    starred: 0
  });
  const [loading, setLoading] = useState(false);

  // Mock data - replace with API call
  useEffect(() => {
    const fetchLearnedVocabularies = async () => {
      try {
        const response = await vocabularyService.getLearnedVocabularies();
        const vocabs = response.data || [];
        
        setVocabularies(vocabs);
        updateStats(vocabs);
      } catch (error) {
        console.error('Error fetching learned vocabularies:', error);
        // Fallback to empty array
        setVocabularies([]);
        updateStats([]);
      }
    };

    fetchLearnedVocabularies();
  }, []);

  useEffect(() => {
    const fetchVocabularyBank = async () => {
      try {
        setLoading(true);
        
        // ✅ Call API để lấy vocabulary bank
        const response = await vocabularyBankService.getAll();
        
        console.log('✅ Vocabulary bank response:', response);
        
        if (response.success) {
          const vocabs = response.data || [];
          
          // ✅ Transform backend data sang frontend format
          const transformedVocabs = vocabs.map(vocab => ({
            id: vocab._id,
            word: vocab.word,
            pronunciation: vocab.pronunciation || '',
            meaning: vocab.meaning,
            example: vocab.example || '',
            tags: vocab.tags || [],
            isStarred: vocab.isStarred || false,
            isLearned: vocab.isLearned || false,
            partOfSpeech: vocab.partOfSpeech || '',
            synonyms: vocab.synonyms || [],
            antonyms: vocab.antonyms || [],
            imageUrl: vocab.imageUrl || '',
            source: vocab.source || 'manual',
            createdAt: vocab.createdAt
          }));
          
          setVocabularies(transformedVocabs);
          updateStats(transformedVocabs);
        }
      } catch (error) {
        console.error('❌ Error fetching vocabulary bank:', error);
        showToast('error', 'Lỗi', 'Không thể tải sổ tay từ vựng');
        // Fallback to empty array
        setVocabularies([]);
        updateStats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVocabularyBank();
  }, []);

  useEffect(() => {
    const fetchAllVocabularies = async () => {
      try {
        setLoading(true);
        
        // ✅ Gọi cả 2 API
        const [vocabularyResponse, bankResponse] = await Promise.all([
          vocabularyService.getLearnedVocabularies().catch(() => ({ data: [] })),
          vocabularyBankService.getAll().catch(() => ({ success: false, data: [] }))
        ]);
        
        console.log('✅ Vocabulary service response:', vocabularyResponse);
        console.log('✅ Vocabulary bank response:', bankResponse);
        
        // ✅ Merge data từ cả 2 nguồn
        const vocabulariesFromService = vocabularyResponse.data || [];
        const vocabulariesFromBank = bankResponse.success ? bankResponse.data || [] : [];
        
        // ✅ Transform và merge
        const transformedVocabs = [
          ...vocabulariesFromService.map(vocab => ({
            id: vocab._id,
            word: vocab.word,
            pronunciation: vocab.pronunciation || '',
            meaning: vocab.meaning,
            example: vocab.example || '',
            tags: vocab.tags || [],
            isStarred: vocab.isStarred || false,
            isLearned: vocab.isLearned || false,
            partOfSpeech: vocab.partOfSpeech || '',
            synonyms: vocab.synonyms || [],
            antonyms: vocab.antonyms || [],
            imageUrl: vocab.imageUrl || '',
            source: vocab.source || 'manual',
            createdAt: vocab.createdAt,
            // ✅ Flag để biết từ nguồn nào
            fromService: true,
            fromBank: false
          })),
          ...vocabulariesFromBank.map(vocab => ({
            id: vocab._id,
            word: vocab.word,
            pronunciation: vocab.pronunciation || '',
            meaning: vocab.meaning,
            example: vocab.example || '',
            tags: vocab.tags || [],
            isStarred: vocab.isStarred || false,
            isLearned: vocab.isLearned || false,
            partOfSpeech: vocab.partOfSpeech || '',
            synonyms: vocab.synonyms || [],
            antonyms: vocab.antonyms || [],
            imageUrl: vocab.imageUrl || '',
            source: vocab.source || 'manual',
            createdAt: vocab.createdAt,
            // ✅ Flag để biết từ nguồn nào
            fromService: false,
            fromBank: true
          }))
        ];
        
        // ✅ Remove duplicates (same word)
        const uniqueVocabs = transformedVocabs.filter((vocab, index, self) => 
          index === self.findIndex(v => v.word.toLowerCase() === vocab.word.toLowerCase())
        );
        
        console.log(`✅ Merged ${uniqueVocabs.length} vocabularies (${vocabulariesFromService.length} from service, ${vocabulariesFromBank.length} from bank)`);
        
        setVocabularies(uniqueVocabs);
        updateStats(uniqueVocabs);
        
      } catch (error) {
        console.error('❌ Error fetching vocabularies:', error);
        showToast('error', 'Lỗi', 'Không thể tải sổ tay từ vựng');
        setVocabularies([]);
        updateStats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllVocabularies();
  }, []);

  useEffect(() => {
    filterVocabularies();
  }, [searchTerm, filterType, vocabularies]);

  const updateStats = (vocabs) => {
    setStats({
      total: vocabs.length,
      learned: vocabs.filter(v => v.isLearned).length,
      starred: vocabs.filter(v => v.isStarred).length
    });
  };

  const filterVocabularies = () => {
    let filtered = vocabularies;

    if (searchTerm) {
      filtered = filtered.filter(v =>
        v.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.meaning.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType === 'starred') {
      filtered = filtered.filter(v => v.isStarred);
    } else if (filterType === 'learned') {
      filtered = filtered.filter(v => v.isLearned);
    }

    setFilteredVocabs(filtered);
  };

  const toggleStar = async (id) => {
    try {
      const vocab = vocabularies.find(v => v.id === id);
      const newStarredStatus = !vocab.isStarred;
      
      // ✅ Gọi API để update star status
      await vocabularyService.toggleStar(id, newStarredStatus);
      
      // Update local state
      setVocabularies(prev => {
        const updated = prev.map(v =>
          v.id === id ? { ...v, isStarred: newStarredStatus } : v
        );
        updateStats(updated);
        return updated;
      });
    } catch (error) {
      console.error('Error toggling star:', error);
      showToast('error', 'Lỗi', 'Không thể cập nhật trạng thái đánh dấu');
    }
  };
  

  const toggleLearned = async (id) => {
    // TODO: Implement API to update mastery/review count
    setVocabularies(prev => {
      const updated = prev.map(v =>
        v.id === id ? { ...v, isLearned: !v.isLearned } : v
      );
      updateStats(updated);
      return updated;
    });
  };

  const speakWord = (text) => {
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
    // ✅ Chưa load xong, đợi event
    console.log('⏳ Đang chờ voices load...');
    
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

  return (
    <PageWrapper>
      <LeftSidebar />
      <MainContent>
        <Header>
          <Title>
            <School />
            Sổ tay từ vựng
          </Title>
          <Subtitle>Quản lý và ôn tập từ vựng đã học</Subtitle>
        </Header>

        <StatsBar>
          <StatCard>
            <StatNumber>{stats.total}</StatNumber>
            <StatLabel>Tổng từ vựng</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{stats.learned}</StatNumber>
            <StatLabel>Đã học</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{stats.starred}</StatNumber>
            <StatLabel>Đánh dấu</StatLabel>
          </StatCard>
        </StatsBar>

        <ControlsBar>
          <SearchBox>
            <SearchIcon />
            <SearchInput
              type="text"
              placeholder="Tìm kiếm từ vựng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBox>
          <FilterButton
            active={filterType === 'all'}
            onClick={() => setFilterType('all')}
          >
            <FilterList />
            Tất cả
          </FilterButton>
          <FilterButton
            active={filterType === 'starred'}
            onClick={() => setFilterType('starred')}
          >
            <Star />
            Đánh dấu
          </FilterButton>
          <FilterButton
            active={filterType === 'learned'}
            onClick={() => setFilterType('learned')}
          >
            <BookmarkBorder />
            Đã học
          </FilterButton>
        </ControlsBar>

        {filteredVocabs.length > 0 ? (
          <VocabGrid>
            {filteredVocabs.map((vocab) => (
              <VocabCard key={vocab.id}>
                <VocabHeader>
                  <VocabWord>
                    <Word>
                      {vocab.word}
                      <IconButton onClick={() => speakWord(vocab.word)}>
                        <VolumeUp style={{ fontSize: '1.2rem' }} />
                      </IconButton>
                    </Word>
                    <Pronunciation>{vocab.pronunciation}</Pronunciation>
                  </VocabWord>
                  <VocabActions>
                    <IconButton
                      active={vocab.isStarred}
                      onClick={() => toggleStar(vocab.id)}
                    >
                      {vocab.isStarred ? <Star /> : <StarBorder />}
                    </IconButton>
                    <IconButton
                      active={vocab.isLearned}
                      onClick={() => toggleLearned(vocab.id)}
                    >
                      {vocab.isLearned ? <Bookmark /> : <BookmarkBorder />}
                    </IconButton>
                  </VocabActions>
                </VocabHeader>
                <VocabMeaning>{vocab.meaning}</VocabMeaning>
                <VocabExample>{vocab.example}</VocabExample>
                <VocabTags>
                  {vocab.tags.map((tag, index) => (
                    <Tag key={index}>{tag}</Tag>
                  ))}
                </VocabTags>
              </VocabCard>
            ))}
          </VocabGrid>
        ) : (
          <EmptyState>
            <EmptyIcon />
            <EmptyText>Không tìm thấy từ vựng nào</EmptyText>
          </EmptyState>
        )}
      </MainContent>
      <RightSidebar />
    </PageWrapper>
  );
};

export default Worldbank;