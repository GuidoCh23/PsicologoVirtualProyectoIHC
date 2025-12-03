import { Response } from 'express';
import { AuthRequest, AIMessageDTO } from '../types';
import groqService from '../services/groqService';

export class AIController {
  // Send message to AI and get response
  async sendMessage(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const data: AIMessageDTO = req.body;

      if (!data.message) {
        res.status(400).json({ error: 'Message is required' });
        return;
      }

      const response = await groqService.sendMessage(data);

      res.json({ response });
    } catch (error) {
      console.error('AI message error:', error);
      res.status(500).json({ error: 'Failed to process AI message' });
    }
  }
}

export default new AIController();
