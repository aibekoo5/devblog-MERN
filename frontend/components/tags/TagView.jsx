'use client';

import { useState, useEffect } from 'react';
import { tagsAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import PostsFeed from '@/components/posts/PostsFeed';

export default function TagView({ slug }) {
  const { user } = useAuth();
  const [tag, setTag] = useState(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  useEffect(() => {
    tagsAPI.getOne(slug)
      .then((t) => {
        setTag(t);
        setFollowerCount(t.followers?.length ?? 0);
        if (user) setFollowing(t.followers?.some((f) => f._id === user._id || f === user._id));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug, user]);

  const handleFollow = async () => {
    if (!user) return alert('Sign in to follow tags');
    try {
      const res = await tagsAPI.follow(tag._id);
      setFollowing(res.isFollowing);
      setFollowerCount(res.followers);
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) return <div className="flex-center" style={{ padding: 48 }}><span className="spinner" /></div>;
  if (!tag) return <div className="empty-state"><p>Tag not found</p></div>;

  return (
    <div>
      {/* Tag header */}
      <div className="card mb-16" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 12,
          background: tag.color || '#6366f1',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.4rem', color: '#fff', fontWeight: 700, flexShrink: 0,
        }}>
          #
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>#{tag.name}</h1>
          {tag.description && <p className="text-sm text-muted" style={{ marginTop: 2 }}>{tag.description}</p>}
          <p className="text-xs text-muted" style={{ marginTop: 4 }}>
            {followerCount} followers · {tag.postCount ?? 0} posts
          </p>
        </div>
        <button
          className={`btn ${following ? 'btn-outline' : 'btn-primary'} btn-sm`}
          onClick={handleFollow}
        >
          {following ? 'Following ✓' : 'Follow'}
        </button>
      </div>

      {/* Posts with this tag */}
      <PostsFeed tagSlug={slug} />
    </div>
  );
}
