import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.routes';
import channelsRoutes from './routes/channels.routes';
import settingsRoutes from './routes/settings.routes';
import moderateRoutes from './routes/moderate.routes';
import { initTwitchIRC } from './services/twitch-irc';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS for extension
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'chrome-extension://*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use('/auth', authRoutes);
app.use('/channels', channelsRoutes);
app.use('/settings', settingsRoutes);
app.use('/', moderateRoutes);

async function bootstrap() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/twitch-moderator');
  await initTwitchIRC();
  
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
}

bootstrap();