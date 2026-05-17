'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { postsAPI, tagsAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function WriteEditor() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [coverImagePreview, setCoverImagePreview] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [published, setPublished] = useState(false);
  const [allTags, setAllTags] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  // Load all tags
  useEffect(() => {
    tagsAPI.getAll().then(setAllTags).catch(() => {});
  }, []);

  // Load post if editing
  useEffect(() => {
    if (!editId) return;
    postsAPI.getAll({ limit: 1 }).catch(() => {});
    // Fetch post by id via search (workaround — ideally add GET /posts/:id route)
  }, [editId]);

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      // Use UploadThing SDK v7 — uploadFiles sends to /api/uploadthing automatically
      const { uploadFiles } = await import('@uploadthing/react');
      const [res] = await uploadFiles('postCoverUploader', { files: [file] });
      setCoverImage(res.url);
      setCoverImagePreview(res.url);
    } catch {
      const previewUrl = URL.createObjectURL(file);
      setCoverImage('');
      setCoverImagePreview(previewUrl);
      setError('Cover upload failed. This preview is local only and will not be saved until upload succeeds.');
    }
    setUploading(false);
  };

  const toggleTag = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = async (pub) => {
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required.');
      return;
    }
    if (coverImagePreview && !coverImage) {
      setError('Cover image upload failed. Please re-upload or remove the cover image before publishing.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const body = {
        title,
        content,
        excerpt,
        coverImage,
        tags: selectedTags,
        published: pub,
      };
      if (editId) {
        await postsAPI.update(editId, body);
      } else {
        await postsAPI.create(body);
      }
      router.push('/');
    } catch (e) {
      setError(e.message);
    }
    setSubmitting(false);
  };

  const coverSrc = coverImagePreview || coverImage;
  const isLocalPreview = coverImagePreview.startsWith('blob:');

  if (loading) return <div className="flex-center" style={{ padding: 80 }}><span className="spinner" /></div>;
  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="write-page">
      <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 24 }}>
        {editId ? 'Edit post' : 'New post'}
      </h1>

      {/* Cover image upload */}
      {coverSrc ? (
        <div style={{ position: 'relative', marginBottom: 20 }}>
          {isLocalPreview ? (
            <img
              src={coverSrc}
              alt="Cover"
              className="cover-preview"
              style={{ width: 760, height: 240, objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <Image
              src={coverSrc}
              alt="Cover"
              width={760}
              height={240}
              className="cover-preview"
              style={{ objectFit: 'cover' }}
            />
          )}
          <button
            className="btn btn-outline btn-sm"
            style={{ position: 'absolute', top: 10, right: 10 }}
            onClick={() => {
              setCoverImage('');
              setCoverImagePreview('');
            }}
          >
            Remove
          </button>
        </div>
      ) : (
        <label className="cover-upload-area">
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleCoverUpload}
          />
          <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>🖼️</div>
          <p className="text-sm text-muted">
            {uploading ? 'Uploading...' : 'Click to add a cover image'}
          </p>
        </label>
      )}

      {/* Title */}
      <input
        className="write-title-input"
        placeholder="Post title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* Excerpt */}
      <div className="form-group">
        <label className="form-label">Short excerpt (optional)</label>
        <textarea
          className="form-input form-textarea"
          placeholder="A brief summary of your post..."
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          style={{ minHeight: 60 }}
        />
      </div>

      {/* Content */}
      <div className="form-group">
        <label className="form-label">Content</label>
        <textarea
          className="form-input form-textarea"
          placeholder="Write your post... (Markdown supported)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ minHeight: 360, fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}
        />
      </div>

      {/* Tags */}
      {allTags.length > 0 && (
        <div className="form-group">
          <label className="form-label">Tags</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {allTags.map((tag) => {
              const active = selectedTags.includes(tag._id);
              return (
                <button
                  key={tag._id}
                  type="button"
                  onClick={() => toggleTag(tag._id)}
                  className="tag"
                  style={{
                    background: active ? 'var(--accent-bg)' : undefined,
                    borderColor: active ? 'var(--accent)' : undefined,
                    color: active ? 'var(--accent-text)' : undefined,
                    cursor: 'pointer',
                  }}
                >
                  <span className="tag-dot" style={{ background: tag.color || '#6366f1' }} />
                  {tag.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {error && <p className="form-error mb-16">{error}</p>}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <button
          className="btn btn-primary"
          onClick={() => handleSubmit(true)}
          disabled={submitting}
        >
          {submitting ? 'Publishing...' : 'Publish'}
        </button>
        <button
          className="btn btn-outline"
          onClick={() => handleSubmit(false)}
          disabled={submitting}
        >
          Save draft
        </button>
        <button className="btn btn-ghost" onClick={() => router.back()}>
          Cancel
        </button>
      </div>
    </div>
  );
}
