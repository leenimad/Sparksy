import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { LearningPath } from '../models/LearningPath';

// @desc    Generate a new personalized learning roadmap
// @route   POST /api/learn/generate
// @access  Private (Needs JWT token)
export const generateLearningPath = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { topic } = req.body;

    if (!topic) {
      res.status(400).json({ status: 'fail', message: 'Please provide a topic' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ 
        status: 'error', 
        message: 'API Key is missing on the server. Please check environment configuration.' 
      });
      return;
    }
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.1-flash-lite',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const prompt = `
      Create a highly structured, step-by-step learning roadmap for a student who wants to master: "${topic}".
      Provide exactly 4 to 5 modules structured progressively from beginner to advanced.
      
      You must respond strictly with a JSON object conforming exactly to this schema:
      {
        "topic": "Name of the topic",
        "modules": [
          {
            "title": "Module Title",
            "description": "Clear description explaining what the student will learn in this module.",
            "estimatedTime": "Estimated study time required, e.g., 2 hours, 1 week, etc.",
            "resources": ["Provide 2 actual resource links, official documentation, or tutorials relevant to this module."]
          }
        ]
      }
      Do not wrap your response in markdown code blocks like \`\`\`json. Return only the raw JSON.
    `;

    // Generate content using Gemini
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse the JSON string sent back by Gemini
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to process AI output format. Please try again.',
      });
      return;
    }

    // Save the generated learning path to the database
    const learningPath = await LearningPath.create({
      user: req.user._id,
      topic: parsedData.topic,
      modules: parsedData.modules,
    });

    res.status(201).json({
      status: 'success',
      data: learningPath,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: (error as Error).message });
  }
};