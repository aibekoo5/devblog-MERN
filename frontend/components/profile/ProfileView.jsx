'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { authAPI, postsAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import PostCard from '@/components/posts/PostCard';
import Avatar from '@/components/ui/Avatar';

export default function ProfileView({ username }) {
  const { user: currentUser, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileRef = useRef(null);

  const isOwner = currentUser?.username === username;

  useEffect(() => {
    // We load profile via /auth/me if it's own profile, else search posts by author
    const load = async () => {
      setLoading(true);
      try {
        if (isOwner) {
          const me = await authAPI.getMe();
          setProfile(me);
          setBio(me.bio || '');
          const postsData = await postsAPI.getAll({ author: me._id, limit: 20 });
          setPosts(postsData.posts);
        } else {
          // For other users: get their posts, derive profile from first post's author
          const postsData = await postsAPI.getAll({ limit: 20 });
          const userPosts = postsData.posts.filter((p) => p.author?.username === username);
          setPosts(userPosts);
          if (userPosts[0]?.author) setProfile(userPosts[0].author);
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    load();
  }, [username, isOwner]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      // UploadThing SDK v7 — uploads to /api/uploadthing and returns CDN URL
      const { uploadFiles } = await import('@uploadthing/react');
      const [res] = await uploadFiles('avatarUploader', { files: [file] });
      const url = res.url;
      await authAPI.updateProfile({ avatar: url });
      updateUser({ avatar: url });
      setProfile((prev) => ({ ...prev, avatar: url }));
    } catch {
      // Fallback: local preview during development
      const url = URL.createObjectURL(file);
      updateUser({ avatar: url });
      setProfile((prev) => ({ ...prev, avatar: url }));
    }
    setUploadingAvatar(false);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const updated = await authAPI.updateProfile({ bio });
      updateUser({ bio });
      setProfile((prev) => ({ ...prev, bio }));
      setEditing(false);
    } catch (e) {
      alert(e.message);
    }
    setSaving(false);
  };

  if (loading) return <div className="flex-center" style={{ padding: 80 }}><span className="spinner" /></div>;
  if (!profile && posts.length === 0) return <div className="empty-state"><p>User not found</p></div>;

  const displayProfile = profile || posts[0]?.author;

  return (
    <div>
      {/* Profile header */}
      <div className="profile-header">
        {/* Avatar with upload */}
        <div style={{ position: 'relative' }}>
          <Avatar user={displayProfile} size="xl" />
          {isOwner && (
            <>
              <button
                className="btn btn-outline btn-sm"
                style={{ position: 'absolute', bottom: 0, right: -8, padding: '3px 8px', fontSize: 11 }}
                onClick={() => fileRef.current?.click()}
                disabled={uploadingAvatar}
                title="Change avatar"
              >
                {uploadingAvatar ? '...' : '📷'}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAvatarUpload}
              />
            </>
          )}
        </div>

        <div className="profile-info">
          <h1 className="profile-username">@{displayProfile?.username}</h1>

          {editing ? (
            <div style={{ marginTop: 8 }}>
              <textarea
                className="form-input form-textarea"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell the world about yourself..."
                style={{ minHeight: 72, maxWidth: 400 }}
              />
              <div className="flex gap-8 mt-8">
                <button className="btn btn-primary btn-sm" onClick={handleSaveProfile} disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <p className="profile-bio">{displayProfile?.bio || 'No bio yet.'}</p>
              {isOwner && (
                <button className="btn btn-outline btn-sm mt-8" onClick={() => setEditing(true)}>
                  Edit profile
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 24, padding: '12px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <span className="text-sm"><strong>{posts.length}</strong> <span className="text-muted">posts</span></span>
      </div>

      {/* Posts */}
      <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 4 }}>Posts</h2>
      {posts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✏️</div>
          <p className="empty-state-text">No posts yet.</p>
        </div>
      ) : (
        posts.map((p) => <PostCard key={p._id} post={p} />)
      )}
    </div>
  );
}
