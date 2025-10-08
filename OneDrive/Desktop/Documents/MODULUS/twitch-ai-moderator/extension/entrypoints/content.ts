export default defineContentScript({
  matches: ['https://www.twitch.tv/*'],
  runAt: 'document_end',

  main() {
    const CHAT_CONTAINER_SELECTOR = '.chat-scrollable-area__message-container';
    const MESSAGE_SELECTOR = '[data-a-target="chat-line-message"]';
    
    let channel = extractChannelFromURL();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== 1) continue;
          const el = node as HTMLElement;
          
          if (el.matches(MESSAGE_SELECTOR)) {
            processMessage(el);
          }
        }
      }
    });

    function extractChannelFromURL(): string {
      const match = window.location.pathname.match(/^\/([^\/]+)/);
      return match ? match[1].toLowerCase() : '';
    }

    function processMessage(msgEl: HTMLElement) {
      // TODO: Extract username from [data-a-target="chat-message-username"]
      // TODO: Extract text from message content
      // TODO: Extract timestamp from msgEl or Date.now()
      // TODO: Generate stable messageId from DOM attributes or hash
      
      const username = ''; // IMPLEMENT
      const text = ''; // IMPLEMENT
      const messageId = ''; // IMPLEMENT (check data-a-id or msgEl attributes)
      const ts = Date.now();

      if (!text.trim()) return;

      // Gray-out message optimistically
      msgEl.style.opacity = '0.5';
      msgEl.dataset.moderationPending = 'true';

      browser.runtime.sendMessage({
        type: 'MODERATE_MESSAGE',
        payload: { channel, username, text, messageId, ts }
      }).then((response) => {
        if (response.action === 'delete_for_all') {
          // Message will be deleted by backend via Helix; hide immediately
          msgEl.style.display = 'none';
        } else if (response.action === 'hide') {
          msgEl.style.opacity = '0.3';
          msgEl.style.textDecoration = 'line-through';
        } else {
          msgEl.style.opacity = '1';
        }
        delete msgEl.dataset.moderationPending;
      });
    }

    const chatContainer = document.querySelector(CHAT_CONTAINER_SELECTOR);
    if (chatContainer) {
      observer.observe(chatContainer, { childList: true, subtree: true });
    }

    // Re-extract channel on navigation
    const navObserver = new MutationObserver(() => {
      const newChannel = extractChannelFromURL();
      if (newChannel !== channel) {
        channel = newChannel;
      }
    });
    navObserver.observe(document.body, { childList: true, subtree: true });
  },
});