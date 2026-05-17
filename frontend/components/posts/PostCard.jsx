import Link from 'next/link';
import Avatar from '@/components/ui/Avatar';

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function PostCard({ post }) {
  return (
    <article className="post-card">
      <div className="post-card-meta">
        <Avatar user={post.author} size="sm" />
        <span className="text-sm">
          <Link href={`/profile/${post.author?.username}`} style={{ color: 'var(--text)', fontWeight: 600 }}>
            {post.author?.username}
          </Link>
          <span className="text-muted"> · {timeAgo(post.createdAt)}</span>
        </span>
      </div>

      <h2 className="post-card-title">
        <Link href={`/posts/${post.slug}`}>{post.title}</Link>
      </h2>

      {post.excerpt && <p className="post-card-excerpt">{post.excerpt}</p>}

      <div className="post-card-footer">
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', flex: 1 }}>
          {post.tags?.map((tag) => (
            <Link key={tag._id} href={`/tags/${tag.slug}`} className="tag">
              <span className="tag-dot" style={{ background: tag.color || '#6366f1' }} />
              {tag.name}
            </Link>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <span className="post-stat">❤️ {post.likes?.length ?? 0}</span>
          <span className="post-stat">💬 {post.commentCount ?? 0}</span>
          <span className="post-stat">👁 {post.views ?? 0}</span>
          <span className="post-stat">⏱ {post.readingTime}m</span>
        </div>
      </div>
    </article>
  );
}
