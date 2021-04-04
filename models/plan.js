const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const planSchema = new Schema({
    title: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    paymentType: { type: Number, required: true },
});

planSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Plan', planSchema);
