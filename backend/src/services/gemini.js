const { GoogleGenAI } = require('@google/genai');

const apiKey = process.env.GEMINI_API_KEY;
let aiInstance = null;

if (apiKey) {
  try {
    aiInstance = new GoogleGenAI({ apiKey });
  } catch (error) {
    console.error('Error initializing GoogleGenAI:', error);
  }
}

const mockAnalyzeReview = (reviewText) => {
  const text = reviewText.toLowerCase();
  
  // Rule-based sentiment analysis
  let sentiment = 'Neutral';
  let trustPercentage = 80;
  let spamProbability = 0.05;
  
  const positiveWords = ['great', 'excellent', 'perfect', 'awesome', 'love', 'good', 'nice', 'helpful', 'fast', 'satisfied'];
  const negativeWords = ['bad', 'worst', 'scam', 'fake', 'broken', 'terrible', 'waste', 'cheat', 'slow', 'dirty'];
  const spamWords = ['buy now', 'earn money', 'click link', 'scam', 'free cash', 'promo code', 'make money', 'click here'];
  
  let posCount = 0;
  let negCount = 0;
  let spamCount = 0;
  
  positiveWords.forEach(w => { if (text.includes(w)) posCount++; });
  negativeWords.forEach(w => { if (text.includes(w)) negCount++; });
  spamWords.forEach(w => { if (text.includes(w)) spamCount++; });
  
  if (posCount > negCount) {
    sentiment = 'Positive';
    trustPercentage = Math.min(100, 80 + posCount * 4);
  } else if (negCount > posCount) {
    sentiment = 'Negative';
    trustPercentage = Math.max(0, 50 - negCount * 12);
  }
  
  if (spamCount > 0) {
    spamProbability = Math.min(0.99, 0.25 + spamCount * 0.25);
    trustPercentage = Math.max(5, trustPercentage - (spamCount * 25));
  }
  
  // Create summary
  const summary = reviewText.length > 60 ? reviewText.substring(0, 60) + '...' : reviewText;
  
  // Extract pros & cons
  const pros = [];
  const cons = [];
  
  if (posCount > 0) {
    pros.push('Easy communication');
    pros.push('Item matching description');
  } else {
    pros.push('Fair transaction');
  }
  
  if (negCount > 0) {
    cons.push('Item quality issues');
    cons.push('Slight delay in handoff');
  } else {
    pros.push('No issues reported');
  }
  
  return {
    sentiment,
    summary,
    spamProbability: parseFloat(spamProbability.toFixed(2)),
    pros,
    cons,
    trustPercentage: Math.round(trustPercentage)
  };
};

const analyzeReview = async (reviewText) => {
  if (!apiKey || !aiInstance) {
    console.log('Gemini API key not configured or failed to load. Using local analyzer.');
    return mockAnalyzeReview(reviewText);
  }

  try {
    const response = await aiInstance.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze this marketplace item review: "${reviewText}"
Evaluate its contents and reply ONLY with a JSON object. Ensure it has no markdown blocks (no backticks).
Required JSON format:
{
  "sentiment": "Positive" | "Negative" | "Neutral",
  "summary": "A 1-sentence summary",
  "spamProbability": 0.0 to 1.0 (float),
  "pros": ["pro1", "pro2", ...],
  "cons": ["con1", "con2", ...],
  "trustPercentage": 0 to 100 (integer)
}`,
    });

    const textResponse = response.text || '';
    const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error('Gemini API call failed, falling back to local analyzer:', error);
    return mockAnalyzeReview(reviewText);
  }
};

module.exports = {
  analyzeReview
};
