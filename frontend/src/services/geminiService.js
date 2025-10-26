import { GoogleGenerativeAI } from '@google/generative-ai';
import { adminService } from './adminService';
import api from '../utils/api';

const checkApiKey = () => {
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing Gemini API key in .env file');
  }
  return apiKey;
};

export const geminiService = {
  generateFlashcards: async (topic, count = 10) => {
    try {
      const apiKey = checkApiKey();
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `Generate ${count} vocabulary flashcards for "${topic}" topic.
      Return as JSON array:
      [
        {
          "word": "English word",
          "translation": "Vietnamese meaning",
          "phonetic": "/pronunciation/", 
          "example": "Example sentence",
          "exampleTranslation": "Vietnamese translation"
        }
      ]`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const flashcards = JSON.parse(text);
      if (!Array.isArray(flashcards)) {
        throw new Error('Invalid API response format');
      }

      return flashcards;

    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Could not generate flashcards. Please try again.');
    }
  },

  // Add function to save to deck
  saveFlashcardsToDeck: async (deckId, flashcards) => {
    try {
      // Validate input
      if (!deckId || !flashcards?.length) {
        throw new Error('Invalid deck ID or flashcards');
      }

      // Create flashcards in bulk instead of one by one
      await adminService.flashcards.createBulk({
        deckId,
        flashcards: flashcards.map(card => ({
          ...card,
          deck: deckId
        }))
      });

    } catch (error) {
      throw new Error('Could not save flashcards: ' + error.message); 
    }
  }
};