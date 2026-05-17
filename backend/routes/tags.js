const express = require('express');
const router = express.Router();
const { getTags, getTag, createTag, followTag } = require('../controllers/tagController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getTags);
router.get('/:slug', getTag);
router.post('/', protect, adminOnly, createTag);
router.post('/:id/follow', protect, followTag);

module.exports = router;
