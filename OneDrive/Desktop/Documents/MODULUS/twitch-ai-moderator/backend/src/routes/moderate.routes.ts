import { Router } from 'express';
import { verifyJWT } from '../middleware/auth.middleware';
import { getCachedMessage } from '../services/twitch-irc';
import { runModerationPipeline } from '../services/moderation';
import { deleteMessageHelix } from '../services/twitch-helix';
import Message from '../models/message.model';
import Infraction from '../models/infraction.model';

const router = Router();

router.post('/moderate', verifyJWT, async (req, res) => {
  const { channel, username, text, messageId, ts } = req.body;
  
  // TODO: Resolve message_id from IRC cache if not provided
  const cachedMsg = messageId ? { id: messageId } : getCachedMessage(channel, username, text, ts);
  
  if (!cachedMsg) {
    return res.json({ action: 'allow', error: 'Message not found in cache' });
  }

  const decision = await runModerationPipeline(text, channel);

  // Log to MongoDB
  await Message.create({
    messageId: cachedMsg.id,
    channel,
    username,
    text,
    timestamp: ts,
    action: decision.action,
    labels: decision.labels,
    confidence: decision.confidence
  });

  if (decision.action === 'delete_for_all') {
    // TODO: Get broadcaster_id and moderator_id for channel
    const broadcasterId = ''; // IMPLEMENT
    const moderatorId = ''; // IMPLEMENT (bot's user ID)
    
    await deleteMessageHelix(broadcasterId, moderatorId, cachedMsg.id);
    
    await Infraction.create({
      username,
      channel,
      messageId: cachedMsg.id,
      text,
      labels: decision.labels,
      severity: decision.severity,
      confidence: decision.confidence,
      action: 'deleted',
      modelVersions: decision.modelVersions
    });
  }

  res.json(decision);
});

export default router;