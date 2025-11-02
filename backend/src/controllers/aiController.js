const geminiService = require('../services/geminiService');
const Flashcard = require('../models/Flashcard');
const Deck = require('../models/Deck');

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

    // Analyze all words with AI
    const aiResults = await geminiService.batchAnalyze(words);

    // Create flashcards
    const flashcards = [];
    for (const aiData of aiResults) {
      const front = `${aiData.word}${aiData.pronunciation ? ` [${aiData.pronunciation}]` : ''}${aiData.partOfSpeech ? ` (${aiData.partOfSpeech})` : ''}`;
      const back = aiData.meanings && aiData.meanings.length > 0
        ? `${aiData.meanings[0].definition} - ${aiData.meanings[0].translation}`
        : aiData.word;

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

      flashcards.push(flashcard);
    }

    res.status(201).json({
      success: true,
      message: `Tạo ${flashcards.length} flashcard với AI thành công`,
      data: flashcards
    });
  } catch (error) {
    console.error('Batch Create Error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo flashcards hàng loạt',
      error: error.message
    });
  }
};

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
