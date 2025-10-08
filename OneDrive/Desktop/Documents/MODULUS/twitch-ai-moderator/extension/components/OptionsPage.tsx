import { useState, useEffect } from 'react';

const API_BASE = 'https://your-backend.example.com';

export default function OptionsPage() {
  const [channel, setChannel] = useState('');
  const [jwt, setJwt] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  
  const [thresholds, setThresholds] = useState({
    p_toxic_delete: 0.85,
    p_toxic_allow: 0.30,
    stage2_hate: 0.80,
    stage2_harassment: 0.80,
    stage2_sexual: 0.80
  });

  useEffect(() => {
    browser.storage.local.get('jwt').then((data) => {
      if (data.jwt) setJwt(data.jwt);
    });
  }, []);

  async function handleConnectChannel() {
    // TODO: Open OAuth popup window
    const authWindow = window.open(
      `${API_BASE}/auth/start?channel=${encodeURIComponent(channel)}`,
      'oauth',
      'width=600,height=700'
    );

    // TODO: Listen for postMessage with JWT from callback
    window.addEventListener('message', (event) => {
      if (event.origin !== new URL(API_BASE).origin) return;
      if (event.data.type === 'AUTH_SUCCESS') {
        const token = event.data.jwt;
        setJwt(token);
        browser.storage.local.set({ jwt: token });
        browser.runtime.sendMessage({ type: 'SET_JWT', payload: token });
        
        // Assign channel to bot
        assignChannel(channel, token);
      }
    });
  }

  async function assignChannel(ch: string, token: string) {
    try {
      const res = await fetch(`${API_BASE}/channels/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ channel: ch })
      });
      const data = await res.json();
      setStatus(data.message || 'Connected');
    } catch (error) {
      setStatus('Failed to assign channel');
    }
  }

  async function handleSaveThresholds() {
    if (!jwt) return;
    
    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify({ channel, thresholds })
      });
      const data = await res.json();
      setStatus('Thresholds saved');
    } catch (error) {
      setStatus('Failed to save thresholds');
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <h1>Twitch AI Moderator Settings</h1>
      
      <section>
        <h2>Channel Assignment</h2>
        <input
          type="text"
          placeholder="Channel name"
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
        />
        <button onClick={handleConnectChannel}>Connect & Assign</button>
        {status && <p>{status}</p>}
      </section>

      <section style={{ marginTop: '30px' }}>
        <h2>Moderation Thresholds</h2>
        
        <label>
          Stage-1 Delete Threshold: {thresholds.p_toxic_delete}
          <input
            type="range"
            min="0.5"
            max="1"
            step="0.05"
            value={thresholds.p_toxic_delete}
            onChange={(e) => setThresholds({...thresholds, p_toxic_delete: +e.target.value})}
          />
        </label>

        <label>
          Stage-1 Allow Threshold: {thresholds.p_toxic_allow}
          <input
            type="range"
            min="0"
            max="0.5"
            step="0.05"
            value={thresholds.p_toxic_allow}
            onChange={(e) => setThresholds({...thresholds, p_toxic_allow: +e.target.value})}
          />
        </label>

        <label>
          Stage-2 Hate Threshold: {thresholds.stage2_hate}
          <input
            type="range"
            min="0.5"
            max="1"
            step="0.05"
            value={thresholds.stage2_hate}
            onChange={(e) => setThresholds({...thresholds, stage2_hate: +e.target.value})}
          />
        </label>

        {/* TODO: Add sliders for other stage2 thresholds */}

        <button onClick={handleSaveThresholds}>Save Thresholds</button>
      </section>
    </div>
  );
}