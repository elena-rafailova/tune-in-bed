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

// use for exact matches
fileSchema.index(
    { title: 'text', creator: 'text', description: 'text' },
    { language_override: 'bg' }
);

// use for partial matches
fileSchema.statics = {
    searchPartial: function (q, callback) {
        return this.find(
            {
                $or: [
                    { title: new RegExp(q, 'gi') },
                    { creator: new RegExp(q, 'gi') },
                ],
            },
            callback
        );
    },

    searchFull: function (q, callback) {
        return this.find(
            {
                $text: { $search: q, $caseSensitive: false },
            },
            callback
        );
    },

    search: function (q, opts) {
        return this.searchFull(q, opts).then((data) => {
            return data.length ? data : this.searchPartial(q, opts);
        });
    },
};

module.exports = mongoose.model('File', fileSchema);
