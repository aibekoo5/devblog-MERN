const Tag = require('../models/Tag');
const User = require('../models/User');
const { generateSlug } = require('../utils/helpers');

// GET /api/tags
const getTags = async (req, res) => {
  try {
    const tags = await Tag.find().populate('postCount').sort('-followers');
    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/tags/:slug
const getTag = async (req, res) => {
  try {
    const tag = await Tag.findOne({ slug: req.params.slug })
      .populate('postCount')
      .populate('followers', 'username avatar');
    if (!tag) return res.status(404).json({ message: 'Tag not found' });
    res.json(tag);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/tags  (admin only)
const createTag = async (req, res) => {
  try {
    const { name, description, color } = req.body;
    const slug = generateSlug(name);

    const tag = await Tag.create({ name, slug, description, color });
    res.status(201).json(tag);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/tags/:id/follow  — Many-to-many: User ↔ Tag
const followTag = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);
    if (!tag) return res.status(404).json({ message: 'Tag not found' });

    const userId = req.user._id;
    const isFollowing = tag.followers.includes(userId);

    if (isFollowing) {
      tag.followers = tag.followers.filter((id) => id.toString() !== userId.toString());
      await User.findByIdAndUpdate(userId, { $pull: { followingTags: tag._id } });
    } else {
      tag.followers.push(userId);
      await User.findByIdAndUpdate(userId, { $addToSet: { followingTags: tag._id } });
    }

    await tag.save();
    res.json({ followers: tag.followers.length, isFollowing: !isFollowing });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTags, getTag, createTag, followTag };
