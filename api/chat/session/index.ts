import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  try {
    const session = await storage.createChatSession({ userId: null });
    return res.status(200).json(session);
  } catch (err) {
    console.error('Error creating chat session:', err);
    return res.status(500).json({ message: 'Failed to create chat session' });
  }
}