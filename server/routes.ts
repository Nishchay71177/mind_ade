import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { groqService } from "./services/groqService";
import { insertChatSessionSchema, insertChatMessageSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Chat session routes (anonymous only)
  app.post('/api/chat/session', async (req, res) => {
    try {
      // Create anonymous session
      const session = await storage.createChatSession({ userId: null });
      res.json(session);
    } catch (error) {
      console.error("Error creating chat session:", error);
      res.status(500).json({ message: "Failed to create chat session" });
    }
  });

  app.get('/api/chat/session/:id', async (req, res) => {
    try {
      const sessionId = req.params.id;
      const session = await storage.getChatSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      const messages = await storage.getChatMessages(sessionId);
      res.json({ session, messages });
    } catch (error) {
      console.error("Error fetching chat session:", error);
      res.status(500).json({ message: "Failed to fetch chat session" });
    }
  });

  // Chat message routes
  app.post('/api/chat/message', async (req, res) => {
    try {
      const { sessionId, content } = req.body;
      
      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: "Message content is required" });
      }

      if (!sessionId) {
        return res.status(400).json({ message: "Session ID is required" });
      }

      // Save user message
      const userMessage = await storage.createChatMessage({
        sessionId,
        content: content.trim(),
        sender: 'user',
      });

      // Get AI response with mood analysis
      const aiResponse = await groqService.analyzeMessageAndRespond(content);
      
      // Save AI message with mood score
      const aiMessage = await storage.createChatMessage({
        sessionId,
        content: aiResponse.response,
        sender: 'ai',
        moodScore: aiResponse.moodScore,
      });

      // Update session mood score if we have enough data
      const sessionMessages = await storage.getChatMessages(sessionId);
      const moodScores = sessionMessages
        .filter(msg => msg.moodScore !== null)
        .map(msg => msg.moodScore!);
      
      if (moodScores.length > 0) {
        const averageMood = moodScores.reduce((sum, score) => sum + score, 0) / moodScores.length;
        await storage.updateChatSessionMoodScore(sessionId, averageMood);
      }

      res.json({
        userMessage,
        aiMessage,
        moodAnalysis: {
          score: aiResponse.moodScore,
          sentiment: aiResponse.sentiment,
          summary: aiResponse.summary
        }
      });
    } catch (error) {
      console.error("Error processing message:", error);
      res.status(500).json({ message: "Failed to process message" });
    }
  });

  app.delete('/api/chat/session/:id', async (req, res) => {
    try {
      const sessionId = req.params.id;
      await storage.endChatSession(sessionId);
      res.json({ message: "Session ended successfully" });
    } catch (error) {
      console.error("Error ending chat session:", error);
      res.status(500).json({ message: "Failed to end chat session" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}