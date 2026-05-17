'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export function useWebSocket() {
  const ws = useRef(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [connected, setConnected] = useState(false);

  const connect = useCallback((token) => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000';
    const url = token ? `${wsUrl}?token=${token}` : wsUrl;

    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      setConnected(true);
      // Keep-alive ping every 30s
      const ping = setInterval(() => {
        if (ws.current?.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000);
      ws.current._ping = ping;
    };

    ws.current.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === 'online_users') {
          setOnlineCount(msg.count);
          setOnlineUserIds(msg.userIds);
        } else if (msg.type === 'notification') {
          setNotifications((prev) => [msg, ...prev].slice(0, 20));
        }
      } catch { /* ignore */ }
    };

    ws.current.onclose = () => {
      setConnected(false);
      clearInterval(ws.current?._ping);
    };

    ws.current.onerror = () => setConnected(false);
  }, []);

  const disconnect = useCallback(() => {
    clearInterval(ws.current?._ping);
    ws.current?.close();
  }, []);

  const clearNotifications = () => setNotifications([]);

  useEffect(() => () => disconnect(), [disconnect]);

  return { connect, disconnect, connected, onlineCount, onlineUserIds, notifications, clearNotifications };
}
