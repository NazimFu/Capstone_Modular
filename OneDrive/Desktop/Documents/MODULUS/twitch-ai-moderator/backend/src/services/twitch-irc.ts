import tmi from 'tmi.js';
import { LRUCache } from 'lru-cache';

interface CachedMessage {
  id: string;
  channel: string;
  username: string;
  text: string;
  timestamp: number;
}

const messageCache = new LRUCache<string, CachedMessage>({
  max: 10000,
  ttl: 120000 // 2 minutes
});

let client: tmi.Client;

export async function initTwitchIRC() {
  client = new tmi.Client({
    options: { debug: false },
    identity: {
      username: process.env.TWITCH_BOT_USERNAME!,
      password: process.env.TWITCH_BOT_OAUTH! // oauth:token
    },
    channels: [] // Will join dynamically
  });

  client.on('message', (channel, tags, message, self) => {
    if (self) return;
    
    const messageId = tags.id;
    if (!messageId) return;

    const cacheKey = `${channel}:${messageId}`;
    messageCache.set(cacheKey, {
      id: messageId,
      channel: channel.replace('#', ''),
      username: tags.username || 'unknown',
      text: message,
      timestamp: Date.now()
    });
  });

  await client.connect();
}

export async function joinChannel(channel: string) {
  await client.join(channel);
}

export function getCachedMessage(
  channel: string,
  username: string,
  text: string,
  ts: number
): CachedMessage | null {
  // TODO: Implement fuzzy lookup if messageId not available
  // Search cache by channel + username + text match + timestamp window
  for (const [key, msg] of messageCache.entries()) {
    if (
      msg.channel === channel &&
      msg.username === username &&
      msg.text === text &&
      Math.abs(msg.timestamp - ts) < 5000
    ) {
      return msg;
    }
  }
  return null;
}