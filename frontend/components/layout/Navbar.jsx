'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useWebSocket } from '@/hooks/useWebSocket';
import Avatar from '@/components/ui/Avatar';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { connect, onlineCount, notifications, clearNotifications } = useWebSocket();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('devblog_token');
    connect(token);
  }, [connect]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-logo">
        {'<DevBlog />'}
      </Link>

      <div className="navbar-actions">
        {/* Online users indicator */}
        <div className="online-badge">
          <span className="online-dot" />
          {onlineCount} online
        </div>

        {user ? (
          <>
            {/* Notifications */}
            <div className="notif-wrap" ref={notifRef}>
              <button
                className="notif-btn"
                onClick={() => setShowNotifs((v) => !v)}
                aria-label="Notifications"
              >
                🔔
                {notifications.length > 0 && <span className="notif-badge" />}
              </button>
              {showNotifs && (
                <div className="notif-dropdown">
                  {notifications.length === 0 ? (
                    <p className="notif-empty">No notifications</p>
                  ) : (
                    <>
                      {notifications.map((n, i) => (
                        <div className="notif-item" key={i}>{n.message}</div>
                      ))}
                      <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border)' }}>
                        <button className="btn btn-ghost btn-sm w-full" onClick={clearNotifications}>
                          Clear all
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <Link href="/write" className="btn btn-primary btn-sm">Write</Link>

            {/* User menu */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowMenu((v) => !v)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                aria-label="User menu"
              >
                <Avatar user={user} size="sm" />
              </button>
              {showMenu && (
                <div className="notif-dropdown" style={{ minWidth: '180px' }}>
                  <Link
                    href={`/profile/${user.username}`}
                    className="notif-item"
                    style={{ display: 'block', color: 'var(--text)' }}
                    onClick={() => setShowMenu(false)}
                  >
                    Profile
                  </Link>
                  <div className="notif-item">
                    <button
                      className="btn btn-ghost btn-sm w-full"
                      onClick={() => { logout(); setShowMenu(false); }}
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link href="/login" className="btn btn-outline btn-sm">Sign in</Link>
            <Link href="/register" className="btn btn-primary btn-sm">Join</Link>
          </>
        )}
      </div>
    </nav>
  );
}
