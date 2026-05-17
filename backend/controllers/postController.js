const Post = require('../models/Post');
const Tag = require('../models/Tag');
const { generateSlug } = require('../utils/helpers');

// GET /api/posts  — list with search & filter
const getPosts = async (req, res) => {
  try {
    const { search, tag, author, page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const query = { published: true };

    if (search) {
      query.$text = { $search: search };
    }
    if (tag) {
      const tagDoc = await Tag.findOne({ slug: tag });
      if (tagDoc) query.tags = tagDoc._id;
    }
    if (author) {
      query.author = author;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [posts, total] = await Promise.all([
      Post.find(query)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .populate('author', 'username avatar')
        .populate('tags', 'name slug color'),
      Post.countDocuments(query),
    ]);

    res.json({
      posts,
      total,
      pages: Math.ceil(total / Number(limit)),
      page: Number(page),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/posts/:slug
const getPost = async (req, res) => {
  try {
    const post = await Post.findOneAndUpdate(
      { slug: req.params.slug, published: true },
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('author', 'username avatar bio')
      .populate('tags', 'name slug color');

    if (!post) return res.status(404).json({ message: 'Post not found' });

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username avatar bio')
      .populate('tags', 'name slug color');

    if (!post) return res.status(404).json({ message: 'Post not found' });

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/posts
const createPost = async (req, res) => {
  try {
    const { title, content, excerpt, coverImage, tags, published } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    // Unique slug
    let slug = generateSlug(title);
    const existing = await Post.findOne({ slug });
    if (existing) slug = `${slug}-${Date.now()}`;

    const post = await Post.create({
      title,
      slug,
      content,
      excerpt: excerpt || content.substring(0, 200),
      coverImage: coverImage || '',
      author: req.user._id,
      tags: tags || [],
      published: published || false,
    });

    await post.populate('author', 'username avatar');
    await post.populate('tags', 'name slug color');

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/posts/:id
const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, content, excerpt, coverImage, tags, published } = req.body;

    if (title && title !== post.title) {
      let slug = generateSlug(title);
      const existing = await Post.findOne({ slug, _id: { $ne: post._id } });
      if (existing) slug = `${slug}-${Date.now()}`;
      post.slug = slug;
      post.title = title;
    }

    if (content !== undefined) post.content = content;
    if (excerpt !== undefined) post.excerpt = excerpt;
    if (coverImage !== undefined) post.coverImage = coverImage;
    if (tags !== undefined) post.tags = tags;
    if (published !== undefined) post.published = published;

    await post.save();
    await post.populate('author', 'username avatar');
    await post.populate('tags', 'name slug color');

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/posts/:id
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/posts/:id/like
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = req.user._id;
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json({ likes: post.likes.length, isLiked: !isLiked });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getPosts, getPost, createPost, updatePost, deletePost, likePost };
