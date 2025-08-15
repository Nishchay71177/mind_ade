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

    // Get AI response + mood
    const analysis = await groqService.analyzeMessageAndRespond(content);

    // Save AI message
    const aiMessage = await storage.insertChatMessage({
      sessionId,
      content: analysis.response,
      sender: 'ai',
      moodScore: analysis.moodScore
    });

    return res.status(200).json({
      userMessage,
      aiMessage,
      moodAnalysis: {
        score: analysis.moodScore,
        sentiment: analysis.sentiment,
        summary: analysis.summary
      }
    });
  } catch (err) {
    console.error('Error handling chat message:', err);
    return res.status(500).json({ message: 'Failed to process chat message' });
  }
}