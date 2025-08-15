import { z } from "zod";

// Define basic types for in-memory storage
export interface User {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatSession {
  id: string;
  userId: string | null;
  startedAt: Date;
  endedAt: Date | null;
  averageMoodScore: number | null;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  content: string;
  sender: string; // 'user' or 'ai'
  moodScore: number | null;
  createdAt: Date;
}

export interface MoodEntry {
  id: string;
  userId: string;
  date: Date;
  moodScore: number;
  sessionId: string | null;
  notes: string | null;
}

// Insert types for API validation
export interface UpsertUser {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
}

export interface InsertChatSession {
  userId: string | null;
}

export interface InsertChatMessage {
  sessionId: string;
  content: string;
  sender: string;
  moodScore?: number | null;
}

export interface InsertMoodEntry {
  userId: string;
  moodScore: number;
  sessionId?: string | null;
  notes?: string | null;
  date?: Date;
}

// Zod schemas for validation
export const insertUserSchema = z.object({
  email: z.string().nullable().optional(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  profileImageUrl: z.string().nullable().optional(),
});

export const insertChatSessionSchema = z.object({
  userId: z.string().nullable(),
});

export const insertChatMessageSchema = z.object({
  sessionId: z.string(),
  content: z.string(),
  sender: z.string(),
  moodScore: z.number().nullable().optional(),
});

export const insertMoodEntrySchema = z.object({
  userId: z.string(),
  moodScore: z.number(),
  sessionId: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});