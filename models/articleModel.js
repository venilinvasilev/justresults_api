const mongoose = require('mongoose');

const articleSchema = mongoose.Schema({
    topic: {
        type: String,
        required: [true, 'Article topic must have a name'],
        unique: true,
        maxLength: [40, 'Article topic must not have more than 40 characters'],
        minLength: [10, 'Article topic must not have less than 10 characters'],
    },
    description: {
        type: String,
        required: [true, 'Article must have a description'],
    },
    category: {
        type: String,
        enum: ['training', 'nutrition', 'supplements', 'health'],
    },
    content: {
        type: String,
        required: [true, 'Article must have content']
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    likes: {
        type: Number,
        default: 0
    },
    // ownerId: String,
    creator: String,
    id: false,
    __v: {
        type: Number,
        select: false
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;
