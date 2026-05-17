const express = require('express');
const router = express.Router();
const { getPosts, getPost, createPost, updatePost, deletePost, likePost } = require('../controllers/postController');
const { getComments, createComment } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

router.get('/', getPosts);
router.get('/:slug', getPost);
router.post('/', protect, createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, likePost);

// Comments nested under posts
router.get('/:postId/comments', getComments);
router.post('/:postId/comments', protect, createComment);

module.exports = router;
