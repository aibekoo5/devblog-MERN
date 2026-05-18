const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { notifyUser } = require('../utils/websocket');

// GET /api/posts/:postId/comments
const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({
      post: req.params.postId,
      parentComment: null,
    })
      .populate('author', 'username avatar')
      .populate({
        path: 'parentComment',
        populate: { path: 'author', select: 'username avatar' },
      })
      .sort('createdAt');

    // Attach replies to each top-level comment
    const replies = await Comment.find({
      post: req.params.postId,
      parentComment: { $ne: null },
    }).populate('author', 'username avatar');

    const commentsWithReplies = comments.map((c) => ({
      ...c.toJSON(),
      replies: replies.filter(
        (r) => r.parentComment?.toString() === c._id.toString()
      ),
    }));

    res.json(commentsWithReplies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/posts/:postId/comments
const createComment = async (req, res) => {
  try {
    const { content, parentComment } = req.body;

    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = await Comment.create({
      content,
      author: req.user._id,
      post: req.params.postId,
      parentComment: parentComment || null,
    });

    await comment.populate('author', 'username avatar');

    // Send notification to post author if commenter is not the author
    if (post.author.toString() !== req.user._id.toString()) {
      notifyUser(post.author, {
        message: `${req.user.username || 'Someone'} commented on your post "${post.title}"`,
        type: 'comment',
        postId: post._id,
        postSlug: post.slug,
      });
    }

    // Send notification to parent comment author if this is a reply
    if (parentComment) {
      const parentComment_obj = await Comment.findById(parentComment);
      if (parentComment_obj && parentComment_obj.author.toString() !== req.user._id.toString()) {
        notifyUser(parentComment_obj.author, {
          message: `${req.user.username || 'Someone'} replied to your comment`,
          type: 'reply',
          postId: post._id,
          postSlug: post.slug,
        });
      }
    }

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/comments/:id
const updateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    comment.content = req.body.content;
    comment.isEdited = true;
    await comment.save();
    await comment.populate('author', 'username avatar');

    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/comments/:id
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (
      comment.author.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await comment.deleteOne();
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getComments, createComment, updateComment, deleteComment };
