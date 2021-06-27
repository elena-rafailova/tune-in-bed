const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const languageSchema = new Schema({
    ISO: { type: String, required: true, unique: true },
});

module.exports = mongoose.model('Language', languageSchema);
