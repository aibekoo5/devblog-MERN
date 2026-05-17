const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tag name is required'],
      unique: true,
      trim: true,
      maxlength: [30, 'Tag name cannot exceed 30 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      maxlength: [200, 'Description cannot exceed 200 characters'],
      default: '',
    },
    color: {
      type: String,
      default: '#6366f1',
      match: [/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex code'],
    },
    // Many-to-many: Tag ↔ Users (followers)
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

// Virtual: post count (used in tag detail view)
tagSchema.virtual('postCount', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'tags',
  count: true,
});

tagSchema.set('toJSON', { virtuals: true });
tagSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Tag', tagSchema);
