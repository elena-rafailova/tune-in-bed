const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const fileSchema = new Schema({
    type: { type: Number, required: true },
    title: { type: String, required: true, unique: true },
    creator: { type: String, required: true },
    description: { type: String, required: true },
    thumbUrl: { type: String, required: true },
    language: {
        type: mongoose.Types.ObjectId,
        requried: true,
        ref: 'Language',
    },
    episodes: { type: Array, required: true },
    categories: [
        {
            type: mongoose.Types.ObjectId,
            requried: true,
            ref: 'File-category',
        },
    ],
});

module.exports = mongoose.model('File', fileSchema);
