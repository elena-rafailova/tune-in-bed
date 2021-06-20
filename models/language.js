const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const languageSchema = new Schema({
    title: { type: String, required: true, unique: true },
});

module.exports = mongoose.model('Language', languageSchema);
