'use client';

import { useState, useEffect, useCallback } from 'react';
import { postsAPI } from '@/lib/api';
import PostCard from './PostCard';

export default function PostsFeed({ tagSlug, authorId }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState('-createdAt');

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, sort, limit: 10 };
      if (search) params.search = search;
      if (tagSlug) params.tag = tagSlug;
      if (authorId) params.author = authorId;

      const data = await postsAPI.getAll(params);
      setPosts(data.posts);
      setTotalPages(data.pages);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [page, sort, search, tagSlug, authorId]);

  useEffect(() => {
    const t = setTimeout(fetchPosts, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchPosts, search]);

  return (
    <div>
      {/* Search */}
      <div className="search-bar">
        <span>🔍</span>
        <input
          type="text"
          placeholder="Search posts..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {/* Sort tabs */}
      <div className="tabs">
        {[
          { label: 'Latest', val: '-createdAt' },
          { label: 'Popular', val: '-likes' },
          { label: 'Most read', val: '-views' },
        ].map((t) => (
          <button
            key={t.val}
            className={`tab-btn${sort === t.val ? ' active' : ''}`}
            onClick={() => { setSort(t.val); setPage(1); }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Posts */}
      {loading ? (
        <div className="flex-center" style={{ padding: 48 }}>
          <span className="spinner" />
        </div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <p className="empty-state-text">No posts found</p>
        </div>
      ) : (
        posts.map((post) => <PostCard key={post._id} post={post} />)
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`page-btn${p === page ? ' active' : ''}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
