import { Router } from 'express';
import { generateAuthURL, handleCallback } from '../auth/oauth';

const router = Router();

router.get('/start', (req, res) => {
  const channel = req.query.channel as string;
  // TODO: Store state with channel mapping in Redis
  const authUrl = generateAuthURL(channel);
  res.redirect(authUrl);
});

router.get('/callback', async (req, res) => {
  const code = req.query.code as string;
  const state = req.query.state as string;
  
  try {
    const jwt = await handleCallback(code, state);
    // TODO: Return HTML that postMessages JWT to opener window
    res.send(`
      <script>
        window.opener.postMessage({ type: 'AUTH_SUCCESS', jwt: '${jwt}' }, '*');
        window.close();
      </script>
    `);
  } catch (error) {
    res.status(500).send('OAuth failed');
  }
});

export default router;