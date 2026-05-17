'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { tagsAPI } from '@/lib/api';

const navLinks = [
  { href: '/', label: '🏠 Home' },
  { href: '/posts', label: '📰 Feed' },
];

const authLinks = [
  { href: '/write', label: '✏️ Write' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [tags, setTags] = useState([]);

  useEffect(() => {
    tagsAPI.getAll().then((t) => setTags(t.slice(0, 8))).catch(() => {});
  }, []);

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {navLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`sidebar-link${pathname === l.href ? ' active' : ''}`}
          >
            {l.label}
          </Link>
        ))}

        {user && authLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`sidebar-link${pathname === l.href ? ' active' : ''}`}
          >
            {l.label}
          </Link>
        ))}

        {user && (
          <Link
            href={`/profile/${user.username}`}
            className={`sidebar-link${pathname.startsWith('/profile') ? ' active' : ''}`}
          >
            👤 My Profile
          </Link>
        )}
      </nav>

      {tags.length > 0 && (
        <div className="sidebar-section">
          <p className="sidebar-section-title">Popular Tags</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {tags.map((tag) => (
              <Link key={tag._id} href={`/tags/${tag.slug}`} className="sidebar-link">
                <span
                  className="tag-dot"
                  style={{ background: tag.color || '#6366f1', flexShrink: 0 }}
                />
                #{tag.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
