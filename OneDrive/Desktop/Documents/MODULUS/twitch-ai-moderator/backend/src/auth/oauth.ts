import crypto from 'crypto';

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID!;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET!;
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:3000/auth/callback';

export function generateAuthURL(channel: string): string {
  const state = crypto.randomBytes(16).toString('hex');
  // TODO: Store state->channel mapping in Redis with 5min TTL
  
  const scopes = [
    'moderator:manage:chat_messages',
    'chat:read',
    'chat:edit'
  ];

  const params = new URLSearchParams({
    client_id: TWITCH_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: scopes.join(' '),
    state
  });

  return `https://id.twitch.tv/oauth2/authorize?${params}`;
}

export async function handleCallback(code: string, state: string) {
  // TODO: Verify state from Redis
  // TODO: Exchange code for access/refresh tokens via Twitch OAuth
  // TODO: Fetch user info from Helix /users
  // TODO: Encrypt and store tokens in MongoDB User model
  // TODO: Generate short-lived JWT (15min) with userId
  
  const jwt = ''; // IMPLEMENT JWT generation
  return jwt;
}