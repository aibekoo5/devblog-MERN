'use client';

import { useState, useEffect } from 'react';
import { commentsAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Avatar from '@/components/ui/Avatar';

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function CommentItem({ comment, postId, onDelete }) {
  const { user } = useAuth();
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState(comment.replies || []);
  const [submitting, setSubmitting] = useState(false);

  const submitReply = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      const reply = await commentsAPI.create(postId, {
        content: replyText,
        parentComment: comment._id,
      });
      setReplies((prev) => [...prev, reply]);
      setReplyText('');
      setShowReply(false);
    } catch (e) {
      alert(e.message);
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await commentsAPI.delete(id);
      onDelete(id);
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div>
      <div className="comment-item">
        <Avatar user={comment.author} size="sm" />
        <div className="comment-body">
          <div>
            <span className="comment-author">{comment.author?.username}</span>
            <span className="comment-time">{timeAgo(comment.createdAt)}</span>
            {comment.isEdited && <span className="comment-time"> (edited)</span>}
          </div>
          <p className="comment-text">{comment.content}</p>
          <div className="comment-actions">
            {user && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowReply((v) => !v)}
              >
                Reply
              </button>
            )}
            {user && user._id === comment.author?._id && (
              <button
                className="btn btn-ghost btn-sm text-danger"
                onClick={() => handleDelete(comment._id)}
              >
                Delete
              </button>
            )}
          </div>
          {showReply && (
            <div className="mt-8">
              <textarea
                className="form-input form-textarea"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${comment.author?.username}...`}
                style={{ minHeight: 72 }}
              />
              <div className="flex gap-8 mt-4">
                <button className="btn btn-primary btn-sm" onClick={submitReply} disabled={submitting}>
                  {submitting ? 'Posting...' : 'Post reply'}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowReply(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
      {replies.length > 0 && (
        <div className="comment-reply">
          {replies.map((r) => (
            <div className="comment-item" key={r._id}>
              <Avatar user={r.author} size="sm" />
              <div className="comment-body">
                <div>
                  <span className="comment-author">{r.author?.username}</span>
                  <span className="comment-time">{timeAgo(r.createdAt)}</span>
                </div>
                <p className="comment-text">{r.content}</p>
                {user && user._id === r.author?._id && (
                  <div className="comment-actions">
                    <button className="btn btn-ghost btn-sm text-danger" onClick={() => handleDelete(r._id)}>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentsSection({ postId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    commentsAPI.getByPost(postId)
      .then(setComments)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [postId]);

  const submitComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const comment = await commentsAPI.create(postId, { content: newComment });
      setComments((prev) => [comment, ...prev]);
      setNewComment('');
    } catch (e) {
      alert(e.message);
    }
    setSubmitting(false);
  };

  const handleDelete = (id) => {
    setComments((prev) => prev.filter((c) => c._id !== id));
  };

  return (
    <section className="comments-section">
      <h3 style={{ marginBottom: 16 }}>Comments ({comments.length})</h3>

      {user ? (
        <div className="card mb-16">
          <textarea
            className="form-input form-textarea"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            style={{ border: 'none', padding: 0, outline: 'none', resize: 'none', minHeight: 80 }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={submitComment} disabled={submitting}>
              {submitting ? 'Posting...' : 'Post comment'}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-muted text-sm mb-16">
          <a href="/login">Sign in</a> to leave a comment.
        </p>
      )}

      {loading ? (
        <div className="flex-center" style={{ padding: 24 }}><span className="spinner" /></div>
      ) : comments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💬</div>
          <p className="empty-state-text">No comments yet. Be the first!</p>
        </div>
      ) : (
        comments.map((c) => (
          <CommentItem key={c._id} comment={c} postId={postId} onDelete={handleDelete} />
        ))
      )}
    </section>
  );
}
