import { storage } from 'wxt/storage';

const API_BASE = 'https://your-backend.example.com'; // TODO: Replace with actual backend URL

let jwtToken: string | null = null;

export default defineBackground(() => {
  // Load JWT from storage on startup
  storage.getItem<string>('local:jwt').then((token) => {
    jwtToken = token;
  });

  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'MODERATE_MESSAGE') {
      handleModeration(message.payload).then(sendResponse);
      return true; // Async response
    }
    if (message.type === 'SET_JWT') {
      jwtToken = message.payload;
      storage.setItem('local:jwt', jwtToken);
      sendResponse({ success: true });
      return;
    }
  });
});

async function handleModeration(payload: {
  channel: string;
  username: string;
  text: string;
  messageId: string;
  ts: number;
}) {
  if (!jwtToken) {
    return { action: 'allow', error: 'No JWT token' };
  }

  try {
    const response = await fetch(`${API_BASE}/moderate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
      body: JSON.stringify(payload)
    });

    if (response.status === 401) {
      // Token expired
      jwtToken = null;
      await storage.removeItem('local:jwt');
      return { action: 'allow', error: 'Token expired' };
    }

    const result = await response.json();
    return result; // { action: 'allow' | 'hide' | 'delete_for_all', labels?: {...} }
  } catch (error) {
    console.error('Moderation request failed:', error);
    return { action: 'allow', error: 'Network error' };
  }
}