import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../server/storage';
import { groqService } from '../../server/services/groqService';
// Avoid TS path alias to ensure Vercel builder resolves it
import { insertChatMessageSchema } from '../../shared/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  try {
    const { sessionId, content } = req.body || {};
    if (!sessionId || !content) {
      return res.status(400).json({ message: 'sessionId and content are required' });
    }
    // Validate using zod schema (sender must be 'user' | 'ai'; we set user here)
    const parsed = insertChatMessageSchema.safeParse({
      sessionId,
      content,
      sender: 'user',
      moodScore: null
    });
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid message payload', issues: parsed.error.issues });
    }
    // Save user message
    const userMessage = await storage.insertChatMessage(parsed.data);

    // Get the last N messages for context (e.g., last 10, adjust as needed)
    const sessionMessages = await storage.getChatMessages(sessionId);
    const conversationHistory = sessionMessages
      .filter(msg => msg.sender) // (this gets all; you can refine if needed)
      .map(msg => msg.content);

    // Get AI response with mood analysis and context
    const aiResponse = await groqService.analyzeMessageAndRespond(content, conversationHistory);

    // Save AI message
    const aiMessage = await storage.insertChatMessage({
      sessionId,
      content: aiResponse.response,
      sender: 'ai',
      moodScore: aiResponse.moodScore
    });

    // Optionally update session mood average
    const moodScores = sessionMessages
      .filter(msg => typeof msg.moodScore === 'number' && !isNaN(msg.moodScore))
      .map(msg => msg.moodScore!);

    if (typeof aiResponse.moodScore === 'number' && !isNaN(aiResponse.moodScore)) {
      moodScores.push(aiResponse.moodScore); // include current AI msg
    }

    if (moodScores.length > 0) {
      const averageMood = moodScores.reduce((sum, score) => sum + score, 0) / moodScores.length;
      await storage.updateChatSessionMoodScore(sessionId, averageMood);
    }

    return res.status(200).json({
      userMessage,
      aiMessage,
      moodAnalysis: {
        score: aiResponse.moodScore,
        sentiment: aiResponse.sentiment,
        summary: aiResponse.summary
      }
    });
  } catch (err) {
    console.error('Error handling chat message:', err);
    return res.status(500).json({ message: 'Failed to process chat message' });
  }
}
