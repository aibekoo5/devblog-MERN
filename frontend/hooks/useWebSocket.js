'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export function useWebSocket(token) {
  const ws = useRef(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [connected, setConnected] = useState(false);

  // Connect on token change
  useEffect(() => {
    const connect = () => {
      if (!token) return;
      
      // Close previous connection if exists
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.close();
      }

      const defaultWsUrl = typeof window !== 'undefined' && window.location.protocol === 'https:'
        ? 'wss://localhost:5000'
        : 'ws://localhost:5000';
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || defaultWsUrl;
      const url = `${wsUrl}?token=${token}`;

      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        setConnected(true);
        console.log('[WebSocket] Connected');
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
          console.log('[WebSocket] Message received:', msg.type);
          if (msg.type === 'online_users') {
            setOnlineCount(msg.count);
            setOnlineUserIds(msg.userIds);
          } else if (msg.type === 'notification') {
            console.log('[WebSocket] Notification:', msg.message);
            setNotifications((prev) => [msg, ...prev].slice(0, 20));
          }
        } catch (err) {
          console.error('[WebSocket] Parse error:', err);
        }
      };

      ws.current.onclose = () => {
        setConnected(false);
        clearInterval(ws.current?._ping);
        console.log('[WebSocket] Disconnected');
      };

      ws.current.onerror = (err) => {
        console.error('[WebSocket] Error:', err);
        setConnected(false);
      };
    };

    connect();

    // Cleanup on unmount or token change
    return () => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
    };
  }, [token]);

  const clearNotifications = () => setNotifications([]);

  return { connected, onlineCount, onlineUserIds, notifications, clearNotifications };
}
