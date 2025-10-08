const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID!;

export async function deleteMessageHelix(
  broadcasterId: string,
  moderatorId: string,
  messageId: string
) {
  // TODO: Fetch moderator access token from MongoDB User model (decrypt)
  const accessToken = ''; // IMPLEMENT

  const url = new URL('https://api.twitch.tv/helix/moderation/chat');
  url.searchParams.append('broadcaster_id', broadcasterId);
  url.searchParams.append('moderator_id', moderatorId);
  url.searchParams.append('message_id', messageId);

  const response = await fetch(url.toString(), {
    method: 'DELETE',
    headers: {
      'Client-Id': TWITCH_CLIENT_ID,
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    // TODO: Implement retry with BullMQ/Redis
    throw new Error(`Helix delete failed: ${response.status}`);
  }
}