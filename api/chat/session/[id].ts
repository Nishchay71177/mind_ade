import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query as { id?: string };
  if (!id) return res.status(400).json({ message: 'Missing session id' });

  if (req.method === 'DELETE') {
    try {
      await storage.endChatSession(id);
      return res.status(200).json({ message: 'Session ended successfully' });
    } catch (err) {
      console.error('Error ending session:', err);
      return res.status(500).json({ message: 'Failed to end chat session' });
    }
  }

  res.setHeader('Allow', 'DELETE');
  return res.status(405).json({ message: 'Method Not Allowed' });
}