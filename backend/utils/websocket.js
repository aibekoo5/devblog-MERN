const { WebSocketServer } = require('ws');
const jwt = require('jsonwebtoken');
const url = require('url');

// Map: userId -> Set of WebSocket connections
const onlineUsers = new Map();

const setupWebSocket = (server) => {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws, req) => {
    // Authenticate via token in query string
    const params = url.parse(req.url, true).query;
    const token = params.token;

    let userId = null;
    let username = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;

        // Track online users
        if (!onlineUsers.has(userId)) {
          onlineUsers.set(userId, new Set());
        }
        onlineUsers.get(userId).add(ws);

        // Broadcast updated online list to all clients
        broadcastOnlineUsers(wss);
      } catch {
        // Unauthenticated — still can receive public broadcasts
      }
    }

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());

        // Clients can send ping to keep connection alive
        if (msg.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
        }
      } catch {
        // Ignore malformed messages
      }
    });

    ws.on('close', () => {
      if (userId && onlineUsers.has(userId)) {
        onlineUsers.get(userId).delete(ws);
        if (onlineUsers.get(userId).size === 0) {
          onlineUsers.delete(userId);
        }
        broadcastOnlineUsers(wss);
      }
    });

    ws.on('error', (err) => {
      console.error('WebSocket error:', err.message);
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
  const connections = onlineUsers.get(userId.toString());
  if (!connections) return;

  const payload = JSON.stringify({ type: 'notification', ...notification });
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
