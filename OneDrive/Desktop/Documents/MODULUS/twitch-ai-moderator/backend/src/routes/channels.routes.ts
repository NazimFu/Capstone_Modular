import { Router } from 'express';
import { verifyJWT } from '../middleware/auth.middleware';
import { joinChannel } from '../services/twitch-irc';
import User from '../models/user.model';

const router = Router();

router.post('/assign', verifyJWT, async (req, res) => {
  const { channel } = req.body;
  const userId = req.user.id;

  // TODO: Validate channel exists on Twitch
  // TODO: Check bot is moderator via Helix API
  
  await User.findByIdAndUpdate(userId, { 
    $addToSet: { assignedChannels: channel.toLowerCase() }
  });

  await joinChannel(channel.toLowerCase());

  res.json({ message: `Bot joined #${channel}` });
});

export default router;