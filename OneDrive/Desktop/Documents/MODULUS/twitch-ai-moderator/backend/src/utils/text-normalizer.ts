export function normalizeText(text: string): string {
  // Unicode NFKC normalization
  let normalized = text.normalize('NFKC');

  // Remove zero-width characters
  normalized = normalized.replace(/[\u200B-\u200D\uFEFF]/g, '');

  // Collapse repeated characters (e.g., "heeelllo" -> "hello")
  normalized = normalized.replace(/(.)\1{2,}/g, '$1$1');

  // Leetspeak normalization
  const leetMap: Record<string, string> = {
    '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's',
    '7': 't', '8': 'b', '@': 'a', '$': 's', '!': 'i',
    '€': 'e', '£': 'l', '¥': 'y'
  };

  normalized = normalized.replace(/[0-9@$!€£¥]/g, (char) => leetMap[char] || char);

  // Emoji to text aliases (simplified)
  // TODO: Use full emoji-to-text library for production
  const emojiMap: Record<string, string> = {
    '🖕': 'middle finger',
    '💩': 'poop',
    '🔫': 'gun',
    '💀': 'skull',
    '🔥': 'fire'
  };

  Object.entries(emojiMap).forEach(([emoji, text]) => {
    normalized = normalized.replace(new RegExp(emoji, 'g'), ` ${text} `);
  });

  // Lowercase and trim
  normalized = normalized.toLowerCase().trim();

  return normalized;
}