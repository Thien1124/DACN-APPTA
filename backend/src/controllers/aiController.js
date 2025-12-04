const geminiService = require('../services/geminiService');
const Flashcard = require('../models/Flashcard');
const Deck = require('../models/Deck');
const Exercise = require('../models/Exercise'); // ✅ Thêm import Exercise
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const OpenAI = require('openai');
const Roadmap = require('../models/RoadmapTopic'); // ✅ Sửa từ RoadmapTopic thành LearningPath

// Khởi tạo OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
/**
 * @desc    Analyze word with AI and create flashcard
 * @route   POST /api/ai/analyze-and-create
 * @access  Private (Admin/Teacher)
 */
exports.analyzeAndCreateFlashcard = async (req, res) => {
  try {
    const { deckId, word, context } = req.body;

    if (!deckId || !word) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp deckId và word'
      });
    }

    // Verify deck exists
    const deck = await Deck.findById(deckId);
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy deck'
      });
    }

    // Analyze word with AI
    const aiData = await geminiService.analyzeWord(word, context);

    // Create front text with pronunciation and part of speech
    const front = `${aiData.word}${aiData.pronunciation ? ` [${aiData.pronunciation}]` : ''}${aiData.partOfSpeech ? ` (${aiData.partOfSpeech})` : ''}`;

    // Create back text from first meaning
    const back = aiData.meanings && aiData.meanings.length > 0
      ? `${aiData.meanings[0].definition} - ${aiData.meanings[0].translation}`
      : aiData.word;

    // Create flashcard with AI-generated data
    const flashcard = await Flashcard.create({
      deck: deckId,
      noteType: 'WORD',
      front,
      back,
      pronunciation: aiData.pronunciation,
      partOfSpeech: aiData.partOfSpeech,
      meanings: aiData.meanings,
      synonyms: aiData.synonyms,
      antonyms: aiData.antonyms,
      collocations: aiData.collocations,
      usageNotes: aiData.usageNotes,
      grammarNotes: aiData.grammarNotes,
      tags: aiData.tags,
      difficulty: aiData.difficulty,
      cefrLevel: aiData.cefrLevel
    });

    res.status(201).json({
      success: true,
      message: 'Tạo flashcard với AI thành công',
      data: {
        flashcard,
        aiAnalysis: {
          isPolysemous: aiData.isPolysemous,
          meaningCount: aiData.meanings?.length || 0
        }
      }
    });
  } catch (error) {
    console.error('AI Analyze & Create Error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo flashcard với AI',
      error: error.message
    });
  }
};

/**
 * @desc    Analyze word only (without creating flashcard)
 * @route   POST /api/ai/analyze
 * @access  Private
 */
exports.analyzeWord = async (req, res) => {
  try {
    const { word, context } = req.body;

    if (!word) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp word'
      });
    }

    const aiData = await geminiService.analyzeWord(word, context);

    res.status(200).json({
      success: true,
      message: 'Phân tích từ thành công',
      data: aiData
    });
  } catch (error) {
    console.error('AI Analyze Error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi phân tích từ',
      error: error.message
    });
  }
};

/**
 * @desc    Detect if word is polysemous
 * @route   POST /api/ai/detect-polysemy
 * @access  Private
 */
exports.detectPolysemy = async (req, res) => {
  try {
    const { word } = req.body;

    if (!word) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp word'
      });
    }

    const polysemyData = await geminiService.detectPolysemy(word);

    res.status(200).json({
      success: true,
      message: 'Phát hiện đa nghĩa thành công',
      data: polysemyData
    });
  } catch (error) {
    console.error('Polysemy Detection Error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi phát hiện đa nghĩa',
      error: error.message
    });
  }
};

/**
 * @desc    Generate example sentences
 * @route   POST /api/ai/generate-examples
 * @access  Private
 */
exports.generateExamples = async (req, res) => {
  try {
    const { word, meaning, count = 3 } = req.body;

    if (!word) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp word'
      });
    }

    const examples = await geminiService.generateExamples(word, meaning, count);

    res.status(200).json({
      success: true,
      message: 'Tạo ví dụ thành công',
      data: {
        word,
        examples
      }
    });
  } catch (error) {
    console.error('Generate Examples Error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo ví dụ',
      error: error.message
    });
  }
};

/**
 * @desc    Suggest image keywords
 * @route   POST /api/ai/suggest-images
 * @access  Private
 */
exports.suggestImageKeywords = async (req, res) => {
  try {
    const { word, meaning } = req.body;

    if (!word) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp word'
      });
    }

    const imageData = await geminiService.suggestImageKeywords(word, meaning);

    res.status(200).json({
      success: true,
      message: 'Gợi ý từ khóa hình ảnh thành công',
      data: imageData
    });
  } catch (error) {
    console.error('Image Suggestion Error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi gợi ý hình ảnh',
      error: error.message
    });
  }
};

/**
 * @desc    Enrich existing flashcard with AI data
 * @route   POST /api/ai/enrich/:id
 * @access  Private (Admin/Teacher)
 */
exports.enrichFlashcard = async (req, res) => {
  try {
    const { id } = req.params;
    const { regenerate = false } = req.body;

    const flashcard = await Flashcard.findById(id);
    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy flashcard'
      });
    }

    // Extract word from front text
    const word = flashcard.front.split('[')[0].trim();

    // Analyze with AI
    const aiData = await geminiService.analyzeWord(word);

    // Update flashcard with AI data (keep existing data if not regenerating)
    if (regenerate) {
      // Replace all data
      flashcard.pronunciation = aiData.pronunciation;
      flashcard.partOfSpeech = aiData.partOfSpeech;
      flashcard.meanings = aiData.meanings;
      flashcard.synonyms = aiData.synonyms;
      flashcard.antonyms = aiData.antonyms;
      flashcard.collocations = aiData.collocations;
      flashcard.usageNotes = aiData.usageNotes;
      flashcard.grammarNotes = aiData.grammarNotes;
      flashcard.tags = aiData.tags;
      flashcard.difficulty = aiData.difficulty;
      flashcard.cefrLevel = aiData.cefrLevel;
    } else {
      // Only fill in missing data
      if (!flashcard.pronunciation) flashcard.pronunciation = aiData.pronunciation;
      if (!flashcard.partOfSpeech) flashcard.partOfSpeech = aiData.partOfSpeech;
      if (!flashcard.meanings || flashcard.meanings.length === 0) {
        flashcard.meanings = aiData.meanings;
      }
      if (!flashcard.synonyms || flashcard.synonyms.length === 0) {
        flashcard.synonyms = aiData.synonyms;
      }
      if (!flashcard.antonyms || flashcard.antonyms.length === 0) {
        flashcard.antonyms = aiData.antonyms;
      }
      if (!flashcard.collocations || flashcard.collocations.length === 0) {
        flashcard.collocations = aiData.collocations;
      }
      if (!flashcard.usageNotes) flashcard.usageNotes = aiData.usageNotes;
      if (!flashcard.grammarNotes) flashcard.grammarNotes = aiData.grammarNotes;
      if (!flashcard.tags || flashcard.tags.length === 0) {
        flashcard.tags = aiData.tags;
      }
      if (!flashcard.difficulty) flashcard.difficulty = aiData.difficulty;
      if (!flashcard.cefrLevel) flashcard.cefrLevel = aiData.cefrLevel;
    }

    await flashcard.save();

    res.status(200).json({
      success: true,
      message: 'Làm giàu flashcard với AI thành công',
      data: flashcard
    });
  } catch (error) {
    console.error('Enrich Flashcard Error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi làm giàu flashcard',
      error: error.message
    });
  }
};

/**
 * @desc    Batch analyze multiple words
 * @route   POST /api/ai/batch-analyze
 * @access  Private (Admin/Teacher)
 */
exports.batchAnalyze = async (req, res) => {
  try {
    const { words } = req.body;

    if (!words || !Array.isArray(words) || words.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp mảng words'
      });
    }

    if (words.length > 20) {
      return res.status(400).json({
        success: false,
        message: 'Tối đa 20 từ mỗi lần'
      });
    }

    const results = await geminiService.batchAnalyze(words);

    res.status(200).json({
      success: true,
      message: `Phân tích ${results.length} từ thành công`,
      data: results
    });
  } catch (error) {
    console.error('Batch Analyze Error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi phân tích hàng loạt',
      error: error.message
    });
  }
};

/**
 * @desc    Batch create flashcards from word list
 * @route   POST /api/ai/batch-create
 * @access  Private (Admin/Teacher)
 */
exports.batchCreateFlashcards = async (req, res) => {
  try {
    const { deckId, words } = req.body;

    if (!deckId || !words || !Array.isArray(words)) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp deckId và mảng words'
      });
    }

    if (words.length > 20) {
      return res.status(400).json({
        success: false,
        message: 'Tối đa 20 từ mỗi lần'
      });
    }

    const deck = await Deck.findById(deckId);
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy deck'
      });
    }

     (`🤖 Batch creating ${words.length} flashcards for deck: ${deck.title}`);

    // Analyze all words with AI
    const aiResults = await geminiService.batchAnalyze(words);

    // ✅ Helper function to clean and validate enum values
    const cleanPartOfSpeech = (pos) => {
      if (!pos) return 'other';
      const cleaned = pos.toLowerCase().split('/')[0].split(',')[0].trim();
      const validValues = ['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'pronoun', 'interjection', 'phrase', 'idiom', 'other'];
      return validValues.includes(cleaned) ? cleaned : 'other';
    };

    const cleanCEFRLevel = (level) => {
      if (!level) return null;
      const cleaned = level.toUpperCase().split('/')[0].split('-')[0].trim();
      const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      return validLevels.includes(cleaned) ? cleaned : null;
    };

    // Create flashcards
    const flashcards = [];
    const errors = [];

    for (let i = 0; i < aiResults.length; i++) {
      try {
        const aiData = aiResults[i];
        
        if (!aiData || !aiData.word) {
          console.warn(`⚠️ Skipping invalid AI data at index ${i}`);
          errors.push({ word: words[i], error: 'Invalid AI data' });
          continue;
        }

        // ✅ Clean and validate data
        const cleanedPartOfSpeech = cleanPartOfSpeech(aiData.partOfSpeech);
        const cleanedCEFRLevel = cleanCEFRLevel(aiData.cefrLevel);

        // Create front text
        const front = `${aiData.word}${aiData.pronunciation ? ` [${aiData.pronunciation}]` : ''}${cleanedPartOfSpeech ? ` (${cleanedPartOfSpeech})` : ''}`;

        // Create back text
        const back = aiData.meanings && aiData.meanings.length > 0
          ? `${aiData.meanings[0].definition} - ${aiData.meanings[0].translation}`
          : aiData.word;

        // ✅ Create flashcard with cleaned data
        const flashcard = await Flashcard.create({
          deck: deckId,
          noteType: 'WORD',
          front,
          back,
          pronunciation: aiData.pronunciation || '',
          partOfSpeech: cleanedPartOfSpeech, // ✅ Cleaned
          meanings: aiData.meanings || [],
          synonyms: aiData.synonyms || [],
          antonyms: aiData.antonyms || [],
          collocations: aiData.collocations || [],
          usageNotes: aiData.usageNotes || '',
          grammarNotes: aiData.grammarNotes || '',
          tags: aiData.tags || [],
          difficulty: aiData.difficulty || 'INTERMEDIATE',
          cefrLevel: cleanedCEFRLevel // ✅ Cleaned
        });

        flashcards.push(flashcard);
         (`✅ Created flashcard ${i + 1}/${aiResults.length}: ${aiData.word}`);
      } catch (createError) {
        console.error(`❌ Error creating flashcard ${i + 1}:`, createError.message);
        errors.push({ word: words[i], error: createError.message });
      }
    }

    // Update deck totalCards
    if (flashcards.length > 0) {
      await Deck.findByIdAndUpdate(deckId, {
        $inc: { totalCards: flashcards.length }
      });
    }

    // Response
    const response = {
      success: true,
      message: `Tạo ${flashcards.length} flashcard với AI thành công${errors.length > 0 ? ` (${errors.length} từ bị lỗi)` : ''}`,
      data: flashcards
    };

    if (errors.length > 0) {
      response.errors = errors;
    }

     (`✅ Batch create completed: ${flashcards.length} successful, ${errors.length} errors`);

    res.status(201).json(response);

  } catch (error) {
    console.error('❌ Batch Create Error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo flashcards hàng loạt',
      error: error.message
    });
  }
};

/**
 * @desc    Generate vocabulary words based on topic/category
 * @route   POST /api/ai/generate-vocabulary
 * @access  Private (Admin/Teacher)
 */
exports.generateVocabulary = async (req, res) => {
  try {
    const { topic, category, level, count = 10 } = req.body;

    if (!topic && !category) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp topic hoặc category'
      });
    }

     (`🤖 Generating ${count} vocabulary words for topic: ${topic || category}`);

    // ✅ Call Gemini to generate vocabulary list
    const vocabularyList = await geminiService.generateVocabularyList(
      topic || category,
      level || 'INTERMEDIATE',
      count
    );

    res.status(200).json({
      success: true,
      message: `Đã tạo ${vocabularyList.length} từ vựng`,
      data: vocabularyList
    });

  } catch (error) {
    console.error('❌ Generate Vocabulary Error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo từ vựng',
      error: error.message
    });
  }
};

/**
 * @desc    Generate flashcard with image
 * @route   POST /api/ai/batch-create-with-images
 * @access  Private (Admin/Teacher)
 */
exports.batchCreateWithImages = async (req, res) => {
  try {
    const { deckId, words } = req.body;

     ('🖼️ BATCH CREATE WITH DALL-E IMAGES called with:', { deckId, wordsCount: words?.length });

    if (!deckId || !words || words.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp deckId và danh sách words'
      });
    }

    const deck = await Deck.findById(deckId);
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy deck'
      });
    }

    // ✅ CHECK: Kiểm tra DALL-E API key có sẵn không
    const hasDalleAccess = !!process.env.OPENAI_API_KEY;
    
    if (!hasDalleAccess) {
      console.warn('⚠️ DALL-E API key not configured. Creating flashcards without images.');
      // ✅ FALLBACK: Tạo flashcards không có ảnh
      return exports.batchCreateFlashcards(req, res);
    }

     (`🤖 Batch creating ${words.length} flashcards with DALL-E images...`);

    const flashcards = [];
    const errors = [];
    let imageSuccessCount = 0;
    let imageTotalAttempts = 0;
    let dalleBillingLimitReached = false; // ✅ Flag để track billing limit

    for (let i = 0; i < words.length; i++) {
      try {
        const word = words[i];
        
         (`🔄 Processing word ${i + 1}/${words.length}: ${word}`);
        
        // Step 1: Analyze word with AI
        const aiData = await geminiService.analyzeWord(word);
         (`✅ AI analyzed ${word}`);
        
        // Step 2: Try generate image with DALL-E (với error handling)
        let localImageUrl = '';
        
        // ✅ CHỈ THỬ TẠO ẢNH nếu chưa gặp billing limit
        if (!dalleBillingLimitReached && i < 3) { // Test với 3 từ đầu tiên
          try {
            imageTotalAttempts++;
             (`🎨 Attempting DALL-E image for ${word}...`);
            
            const dalleUrl = await generateDalleImage(word, aiData.meanings?.[0]?.definition);
            
            if (dalleUrl) {
              const filename = `flashcard_${word.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.png`;
              localImageUrl = await downloadAndSaveImage(dalleUrl, filename);
              imageSuccessCount++;
               (`✅ Local image URL for ${word}:`, localImageUrl);
            } else {
              console.warn(`⚠️ No DALL-E image generated for ${word} (likely billing issue)`);
            }
          } catch (imageError) {
            console.error(`❌ DALL-E error for ${word}:`, imageError.message);
            
            // ✅ Nếu lỗi billing, set flag và skip tạo ảnh cho tất cả từ còn lại
            if (imageError.message.includes('Billing') || imageError.message.includes('limit')) {
              console.warn('⚠️ DALL-E billing limit reached. Skipping image generation for all remaining words.');
              dalleBillingLimitReached = true; // ✅ Set flag
            }
          }
        }
        
        // Step 3: Create flashcard (LUÔN tạo flashcard dù có ảnh hay không)
        const front = aiData.word;
        const back = aiData.meanings?.[0]?.translation || aiData.word;

        const flashcard = await Flashcard.create({
          deck: deckId,
          noteType: 'WORD',
          front,
          back,
          pronunciation: aiData.pronunciation,
          partOfSpeech: aiData.partOfSpeech,
          meanings: aiData.meanings,
          synonyms: aiData.synonyms,
          antonyms: aiData.antonyms,
          collocations: aiData.collocations,
          imageUrl: localImageUrl || '', // ✅ OK nếu rỗng
          tags: aiData.tags,
          difficulty: aiData.difficulty,
          cefrLevel: aiData.cefrLevel
        });

        flashcards.push(flashcard);
         (`✅ Created flashcard ${i + 1}/${words.length}: ${word} (image: ${!!localImageUrl})`);

      } catch (error) {
        console.error(`❌ Error creating flashcard ${i + 1}:`, error.message);
        errors.push({ word: words[i], error: error.message });
      }
    }

    // Update deck
    if (flashcards.length > 0) {
      await Deck.findByIdAndUpdate(deckId, {
        $inc: { totalCards: flashcards.length }
      });
    }

    // ✅ Response với thông tin về ảnh
    const response = {
      success: true,
      message: `Tạo ${flashcards.length} flashcard thành công${errors.length > 0 ? ` (${errors.length} từ bị lỗi)` : ''}`,
      data: flashcards,
      imageStats: {
        attempted: imageTotalAttempts,
        successful: imageSuccessCount,
        failed: imageTotalAttempts - imageSuccessCount,
        billingLimitReached: dalleBillingLimitReached, // ✅ Thêm flag billing
        note: dalleBillingLimitReached 
          ? 'DALL-E không khả dụng do hạn mức billing. Flashcards đã được tạo thành công nhưng không có hình ảnh minh họa.'
          : imageSuccessCount === 0 && imageTotalAttempts > 0 
          ? 'DALL-E không khả dụng hoặc hết quota. Flashcards đã được tạo thành công nhưng không có hình ảnh minh họa.'
          : null
      }
    };

    if (errors.length > 0) {
      response.errors = errors;
    }

     (`✅ Batch create completed: ${flashcards.length} successful, ${errors.length} errors, ${imageSuccessCount}/${imageTotalAttempts} images`);

    res.status(201).json(response);

  } catch (error) {
    console.error('❌ Batch Create with DALL-E Images Error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo flashcards với hình ảnh DALL-E',
      error: error.message
    });
  }
};

// Helper: Generate image with DALL-E (với better error handling)
async function generateDalleImage(word, context = '') {
  try {
     (`🎨 Generating DALL-E image for "${word}"...`);
    
    // ✅ CHECK: API key có sẵn không
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }
    
    const prompt = `Create a clean, educational illustration for the English word "${word}". 
    The image should be suitable for language learning flashcards. 
    Simple, clear, and visually appealing. 
    White background preferred. 
    No text or words in the image.`;
    
    const response = await openai.images.generate({
      model: "dall-e-2",
      prompt: prompt,
      size: "512x512",
      n: 1,
    });

    const imageUrl = response.data[0].url;
     (`✅ DALL-E generated image for "${word}"`);
    
    return imageUrl;
    
  } catch (error) {
    console.error('❌ DALL-E generation error:', error.message);
    
    // ✅ Throw error để caller biết (không silent fail)
    throw error;
  }
}



/**
 * @desc    Suggest collocations for a word
 * @route   POST /api/ai/suggest-collocations
 * @access  Private
 */
exports.suggestCollocations = async (req, res) => {
  try {
    const { word, partOfSpeech } = req.body;

    if (!word) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp word'
      });
    }

    const collocations = await geminiService.suggestCollocations(word, partOfSpeech);

    res.status(200).json({
      success: true,
      message: 'Gợi ý collocations thành công',
      data: {
        word,
        collocations
      }
    });
  } catch (error) {
    console.error('Suggest Collocations Error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi gợi ý collocations',
      error: error.message
    });
  }
};
