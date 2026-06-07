import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

let echoInstance = null;

export function initializeWebSocket(token) {
  if (echoInstance) {
    return echoInstance;
  }

  echoInstance = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_REVERB_APP_KEY || 'app-key',
    cluster: import.meta.env.VITE_REVERB_CLUSTER || 'mt1',
    wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
    wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
    wssPort: import.meta.env.VITE_REVERB_PORT || 8080,
    forceTLS: false,
    encrypted: false,
    disableStats: true,
    enabledTransports: ['ws', 'wss'],
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  return echoInstance;
}

export function getEcho() {
  return echoInstance;
}

export function subscribeToChat(userId, callbacks) {
  const echo = getEcho();
  if (!echo) return;

  const channel = echo.channel(`chat.${userId}`);

  // Listen for new messages
  channel.listen('message.sent', (data) => {
    if (callbacks.onMessageSent) {
      callbacks.onMessageSent(data);
    }
  });

  // Listen for message seen
  channel.listen('message.seen', (data) => {
    if (callbacks.onMessageSeen) {
      callbacks.onMessageSeen(data);
    }
  });

  // Listen for message deleted
  channel.listen('message.deleted', (data) => {
    if (callbacks.onMessageDeleted) {
      callbacks.onMessageDeleted(data);
    }
  });

  return () => {
    channel.stopListening('message.sent');
    channel.stopListening('message.seen');
    channel.stopListening('message.deleted');
    echo.leaveChannel(`chat.${userId}`);
  };
}

export function unsubscribeFromChat(userId) {
  const echo = getEcho();
  if (!echo) return;

  echo.leaveChannel(`chat.${userId}`);
}

export function disconnectWebSocket() {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }
}
