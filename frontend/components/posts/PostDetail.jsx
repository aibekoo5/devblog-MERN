'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { postsAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import CommentsSection from '@/components/comments/CommentsSection';
import Avatar from '@/components/ui/Avatar';

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function PostDetail({ slug }) {
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    postsAPI.getOne(slug)
      .then((p) => {
        setPost(p);
        setLikeCount(p.likes?.length ?? 0);
        if (user) setLiked(p.likes?.includes(user._id));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug, user]);

  const handleLike = async () => {
    if (!user) return alert('Sign in to like posts');
    try {
      const res = await postsAPI.like(post._id);
      setLiked(res.isLiked);
      setLikeCount(res.likes);
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) return <div className="flex-center" style={{ padding: 80 }}><span className="spinner" /></div>;
  if (!post) return <div className="empty-state"><p>Post not found</p></div>;

  return (
    <article>
      {/* Cover image */}
      {post.coverImage && (
        <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 24, height: 280, position: 'relative' }}>
          <Image src={post.coverImage} alt={post.title} fill style={{ objectFit: 'cover' }} />
        </div>
      )}

      {/* Tags */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        {post.tags?.map((tag) => (
          <Link key={tag._id} href={`/tags/${tag.slug}`} className="tag">
            <span className="tag-dot" style={{ background: tag.color || '#6366f1' }} />
            {tag.name}
          </Link>
        ))}
      </div>

      {/* Title */}
      <h1 style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.25, marginBottom: 16 }}>
        {post.title}
      </h1>

      {/* Author & Meta */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
        <Avatar user={post.author} size="md" />
        <div>
          <Link href={`/profile/${post.author?.username}`} style={{ fontWeight: 600, color: 'var(--text)' }}>
            {post.author?.username}
          </Link>
          <div className="text-xs text-muted" style={{ marginTop: 2 }}>
            {timeAgo(post.createdAt)} · {post.readingTime} min read · {post.views} views
          </div>
        </div>
        {user && user._id === post.author?._id && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <Link href={`/write?edit=${post._id}`} className="btn btn-outline btn-sm">Edit</Link>
          </div>
        )}
      </div>

      {/* Content */}
      <div
        className="article-content"
        dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>') }}
      />

      {/* Like button */}
      <div style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--border)', display: 'flex', gap: 12 }}>
        <button
          className={`btn ${liked ? 'btn-primary' : 'btn-outline'}`}
          onClick={handleLike}
        >
          ❤️ {likeCount} {liked ? 'Liked' : 'Like'}
        </button>
      </div>

      {/* Comments */}
      <CommentsSection postId={post._id} />
    </article>
  );
}
