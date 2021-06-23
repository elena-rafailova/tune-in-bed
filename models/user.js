const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    image: { type: String, required: true },
    isFreeTrial: { type: Boolean, required: true, default: true },
    isSubActive: { type: Boolean, required: true, default: false },
    nextPaymentDate: { type: Date, required: false, default: null },
    planId: {
        type: mongoose.Types.ObjectId,
        requried: true,
        ref: 'Plan',
        default: null,
    },
    wishlist: { type: Array, required: true, default: [] },
    archive: { type: Array, required: true, default: [] },
    currents: { type: Array, required: true, default: [] },
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
