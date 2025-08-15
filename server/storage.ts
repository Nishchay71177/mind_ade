import {
  type User,
  type UpsertUser,
  type ChatSession,
  type InsertChatSession,
  type ChatMessage,
  type InsertChatMessage,
  type MoodEntry,
  type InsertMoodEntry,
} from "@shared/schema";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Chat session operations
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  getChatSession(id: string): Promise<ChatSession | undefined>;
  updateChatSessionMoodScore(id: string, averageMoodScore: number): Promise<void>;
  endChatSession(id: string): Promise<void>;
  
  // Chat message operations
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(sessionId: string): Promise<ChatMessage[]>;
  getUserChatHistory(userId: string, limit?: number): Promise<ChatMessage[]>;
  
  // Mood entry operations
  createMoodEntry(entry: InsertMoodEntry): Promise<MoodEntry>;
  getUserMoodEntries(userId: string, startDate?: Date, endDate?: Date): Promise<MoodEntry[]>;
  getUserMoodStats(userId: string): Promise<{
    averageMood: number;
    bestMood: number;
    worstMood: number;
    totalEntries: number;
  }>;
}

export class MemoryStorage implements IStorage {
  private users = new Map<string, User>();
  private chatSessions = new Map<string, ChatSession>();
  private chatMessages = new Map<string, ChatMessage[]>();
  private moodEntries = new Map<string, MoodEntry[]>();

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id);
    const user: User = {
      id: userData.id,
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      createdAt: existingUser?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(userData.id, user);
    return user;
  }

  // Chat session operations
  async createChatSession(session: InsertChatSession): Promise<ChatSession> {
    const chatSession: ChatSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: session.userId,
      startedAt: new Date(),
      endedAt: null,
      averageMoodScore: null,
    };
    this.chatSessions.set(chatSession.id, chatSession);
    return chatSession;
  }

  async getChatSession(id: string): Promise<ChatSession | undefined> {
    return this.chatSessions.get(id);
  }

  async updateChatSessionMoodScore(id: string, averageMoodScore: number): Promise<void> {
    const session = this.chatSessions.get(id);
    if (session) {
      session.averageMoodScore = averageMoodScore;
      this.chatSessions.set(id, session);
    }
  }

  async endChatSession(id: string): Promise<void> {
    const session = this.chatSessions.get(id);
    if (session) {
      session.endedAt = new Date();
      this.chatSessions.set(id, session);
    }
  }

  // Chat message operations
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const chatMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId: message.sessionId,
      content: message.content,
      sender: message.sender,
      moodScore: message.moodScore || null,
      createdAt: new Date(),
    };
    
    const messages = this.chatMessages.get(message.sessionId) || [];
    messages.push(chatMessage);
    this.chatMessages.set(message.sessionId, messages);
    
    return chatMessage;
  }
  async deleteChatSessionAndMessages(sessionId: string): Promise<void> {
  this.chatMessages.delete(sessionId);
  this.chatSessions.delete(sessionId);
  }

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    return this.chatMessages.get(sessionId) || [];
  }

  async getUserChatHistory(userId: string, limit?: number): Promise<ChatMessage[]> {
    const allMessages: ChatMessage[] = [];
    
    const entries = Array.from(this.chatMessages.entries());
    for (const [sessionId, messages] of entries) {
      const session = this.chatSessions.get(sessionId);
      if (session?.userId === userId) {
        allMessages.push(...messages);
      }
    }
    
    allMessages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return limit ? allMessages.slice(0, limit) : allMessages;
  }

  // Mood entry operations
  async createMoodEntry(entry: InsertMoodEntry): Promise<MoodEntry> {
    const moodEntry: MoodEntry = {
      id: `mood_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: entry.userId,
      date: entry.date || new Date(),
      moodScore: entry.moodScore,
      sessionId: entry.sessionId || null,
      notes: entry.notes || null,
    };
    
    const entries = this.moodEntries.get(entry.userId) || [];
    entries.push(moodEntry);
    this.moodEntries.set(entry.userId, entries);
    
    return moodEntry;
  }

  async getUserMoodEntries(userId: string, startDate?: Date, endDate?: Date): Promise<MoodEntry[]> {
    const entries = this.moodEntries.get(userId) || [];
    
    if (startDate && endDate) {
      return entries.filter(entry => 
        entry.date >= startDate && entry.date <= endDate
      ).sort((a, b) => a.date.getTime() - b.date.getTime());
    }
    
    return entries.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  async getUserMoodStats(userId: string): Promise<{
    averageMood: number;
    bestMood: number;
    worstMood: number;
    totalEntries: number;
  }> {
    const entries = this.moodEntries.get(userId) || [];
    
    if (entries.length === 0) {
      return {
        averageMood: 0,
        bestMood: 0,
        worstMood: 0,
        totalEntries: 0,
      };
    }
    
    const moodScores = entries.map(entry => entry.moodScore);
    const averageMood = moodScores.reduce((sum, score) => sum + score, 0) / moodScores.length;
    const bestMood = Math.max(...moodScores);
    const worstMood = Math.min(...moodScores);
    
    return {
      averageMood,
      bestMood,
      worstMood,
      totalEntries: entries.length,
    };
  }
}

export const storage = new MemoryStorage();
