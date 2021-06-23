const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');
const User = require('../models/user');

const getUsers = async (req, res, next) => {
    let users;

    try {
        users = await User.find({}, '-password');
    } catch (err) {
        return next(new HttpError('Something went wrong.', 500));
    }

    res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError('Invalid inputs passed, please check your data.', 422)
        );
    }

    const { name, email, password } = req.body;
    let existingUser;

    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        return next(new HttpError('Something went wrong.', 500));
    }

    if (existingUser) {
        const error = new HttpError(
            'User exists already, please log in instead.',
            422
        );
        return next(error);
    }

    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
        const error = new HttpError(
            'Could not create user, please try again.',
            500
        );
        return next(error);
    }

    const createdUser = new User({
        name,
        email,
        password: hashedPassword,
        image: req.file.path,
    });

    try {
        await createdUser.save();
    } catch (err) {
        return next(new HttpError('Signing up went wrong' + err, 500));
    }

    let token;
    try {
        token = await jwt.sign(
            { userId: createdUser.id, email: createdUser.email },
            process.env.JWT_KEY,
            { expiresIn: '1h' }
        );
    } catch (err) {
        return next(new HttpError('Signing up went wrong', 500));
    }

    delete createdUser.password;

    res.status(201).json({
        userId: createdUser.id,
        email: createdUser.email,
        token: token,
        user: createdUser,
    });
};

const login = async (req, res, next) => {
    const { email, password } = req.body;
    let identifiedUser;

    try {
        identifiedUser = await User.findOne({ email: email });
    } catch (err) {
        return next(new HttpError('Something went wrong.', 500));
    }

    if (!identifiedUser) {
        return next(
            new HttpError(
                'Could not identify user, credentials seem to be wrong',
                403
            )
        );
    }

    let isValidPass = false;
    try {
        isValidPass = await bcrypt.compare(password, identifiedUser.password);
    } catch (err) {
        return next(
            new HttpError(
                'Could not log you in, please check your credentials',
                500
            )
        );
    }

    if (!isValidPass) {
        return next(
            new HttpError(
                'Could not identify user, credentials seem to be wrong',
                403
            )
        );
    }

    let token;
    try {
        token = await jwt.sign(
            { userId: identifiedUser.id, email: identifiedUser.email },
            process.env.JWT_KEY,
            { expiresIn: '1h' }
        );
    } catch (err) {
        return next(new HttpError('Logging in went wrong', 500));
    }

    delete identifiedUser.password;

    res.json({
        userId: identifiedUser.id,
        email: identifiedUser.email,
        token: token,
        user: identifiedUser,
    });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
