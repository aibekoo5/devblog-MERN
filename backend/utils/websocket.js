const { WebSocketServer } = require('ws');
const jwt = require('jsonwebtoken');

// Map: userId -> Set of WebSocket connections
const onlineUsers = new Map();

const setupWebSocket = (server) => {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws, req) => {
    // Authenticate via token in query string
    const requestUrl = new URL(req.url, 'http://localhost');
    const token = requestUrl.searchParams.get('token');

    let userId = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;

        // Track online users
        if (!onlineUsers.has(userId)) {
          onlineUsers.set(userId, new Set());
        }
        onlineUsers.get(userId).add(ws);

        console.log(`[WebSocket] User ${userId} connected. Total online: ${onlineUsers.size}`);

        // Broadcast updated online list to all clients
        broadcastOnlineUsers(wss);
      } catch (err) {
        console.error('[WebSocket] Token verification failed:', err.message);
      }
    } else {
      console.log('[WebSocket] Connection without token');
    }

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());

        // Clients can send ping to keep connection alive
        if (msg.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
        }
      } catch (err) {
        console.error('[WebSocket] Message parse error:', err.message);
      }
    });

    ws.on('close', () => {
      if (userId && onlineUsers.has(userId)) {
        onlineUsers.get(userId).delete(ws);
        if (onlineUsers.get(userId).size === 0) {
          onlineUsers.delete(userId);
        }
        console.log(`[WebSocket] User ${userId} disconnected. Total online: ${onlineUsers.size}`);
        broadcastOnlineUsers(wss);
      }
    });

    ws.on('error', (err) => {
      console.error('[WebSocket] Connection error:', err.message);
    });
  });

  return wss;
};

// Broadcast online user count + IDs to all connected clients
const broadcastOnlineUsers = (wss) => {
  const payload = JSON.stringify({
    type: 'online_users',
    userIds: Array.from(onlineUsers.keys()),
    count: onlineUsers.size,
  });

  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // OPEN
      client.send(payload);
    }
  });
};

// Send notification to a specific user (all their connections)
const notifyUser = (userId, notification) => {
  const userIdStr = userId.toString();
  const connections = onlineUsers.get(userIdStr);
  
  if (!connections || connections.size === 0) {
    console.log(`[WebSocket] User ${userIdStr} not online, skipping notification`);
    return;
  }

  const payload = JSON.stringify({ type: 'notification', ...notification });
  console.log(`[WebSocket] Sending notification to user ${userIdStr}:`, notification.message);
  
  connections.forEach((ws) => {
    if (ws.readyState === 1) {
      ws.send(payload);
    }
  });
};

// Broadcast to all connected clients (e.g. new post published)
const broadcastAll = (wss, message) => {
  const payload = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(payload);
    }
  });
};

module.exports = { setupWebSocket, notifyUser, broadcastAll };
