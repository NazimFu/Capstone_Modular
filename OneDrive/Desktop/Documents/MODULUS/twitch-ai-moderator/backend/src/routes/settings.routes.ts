import { Router } from 'express';
import { verifyJWT } from '../middleware/auth.middleware';
import User from '../models/user.model';

const router = Router();

router.put('/', verifyJWT, async (req, res) => {
  const { channel, thresholds } = req.body;
  const userId = req.user.id;

  // TODO: Validate thresholds schema
  
  await User.findOneAndUpdate(
    { _id: userId, assignedChannels: channel },
    { $set: { [`channelSettings.${channel}`]: thresholds } }
  );

  res.json({ message: 'Thresholds saved' });
});

export default router;