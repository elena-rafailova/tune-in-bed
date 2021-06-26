const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const File = require('../models/file');
const User = require('../models/user');
const Category = require('../models/category');
const Language = require('../models/language');

const listAll = async (req, res, next) => {
    let files;

    try {
        files = await File.find();
    } catch (err) {
        return next(new HttpError('Something went wrong.', 500));
    }

    if (files.length > 0) {
        try {
            files = await Promise.all(
                files.map((file) => getCategoriesAndLanguage(file))
            );
        } catch (err) {
            return next(new HttpError('Something went wrong.', 500));
        }
    }

    res.json({
        files: files.map((file) => file.toObject({ getters: true })),
    });
};

const getByCategory = async (req, res, next) => {
    const catName = req.params.catName;
    let category = null;

    try {
        category = await Category.findOne({
            title: catName.toLowerCase(),
        }).exec();
    } catch (err) {
        const error = new HttpError('Something went wrong.', 500);

        return next(error);
    }

    if (!category) {
        const error = new HttpError(
            'Could not find category with the provided name.',
            404
        );

        return next(error);
    }

    let chosenFiles;
    try {
        chosenFiles = await File.find({ categories: category._id });
    } catch (err) {
        const error = new HttpError('Something went wrong.', 500);

        return next(error);
    }

    if (!chosenFiles || chosenFiles.length === 0) {
        const error = new HttpError(
            'Could not find files with the provided category name.',
            404
        );

        return next(error);
    } else {
        try {
            chosenFiles = await Promise.all(
                chosenFiles.map((file) => getCategoriesAndLanguage(file))
            );
        } catch (err) {
            return next(new HttpError('Something went wrong.', 500));
        }
    }

    res.json({
        files: chosenFiles.map((file) => file.toObject({ getters: true })),
    });
};

const getById = async (req, res, next) => {
    const fileId = req.params.id;

    let file;
    try {
        file = await File.findById(fileId);
    } catch (err) {
        const error = new HttpError('Something went wrong.', 500);

        return next(error);
    }

    if (!file) {
        const error = new HttpError(
            'Could not find a file with provided id.',
            404
        );

        return next(error);
    } else {
        try {
            file = await getCategoriesAndLanguage(file);
        } catch (err) {
            return next(new HttpError('Something went wrong.', 500));
        }
    }

    res.json({
        file: file.toObject({ getters: true }),
    });
};

const toggleWishlist = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new HttpError(
            'Invalid values passed, please check your data.',
            422
        );
    }

    const { fileId, state } = req.body;

    let chosenFile;
    try {
        chosenFile = await File.findById(fileId);
    } catch (err) {
        const error = new HttpError('Something went wrong.', 500);

        return next(error);
    }

    if (!chosenFile) {
        const error = new HttpError(
            'Could not find a file with provided id.',
            404
        );

        return next(error);
    }

    let user;
    try {
        user = await User.findById(req.userData.userId);
    } catch (err) {
        const error = new HttpError('Something went wrong.', 500);

        return next(error);
    }

    if (!user) {
        const error = new HttpError(
            'Could not find a user with provided id.',
            404
        );

        return next(error);
    }

    try {
        let fileIndex = user.wishlist.findIndex((fId) => {
            return fId.toString() === fileId;
        });

        if (fileIndex > -1 && +state === 0) {
            user.wishlist.splice(fileIndex, 1);
        } else if (fileIndex === -1 && +state === 1) {
            user.wishlist.push(fileId);
        } else {
            throw new Error();
        }

        await user.save();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, please try again.',
            500
        );

        return next(error);
    }

    res.status(200).json({ success: true, wishlist: user.wishlist });
};

const toggleArchive = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new HttpError(
            'Invalid values passed, please check your data.',
            422
        );
    }

    const { fileId, state } = req.body;

    let chosenFile;
    try {
        chosenFile = await File.findById(fileId);
    } catch (err) {
        const error = new HttpError('Something went wrong.', 500);

        return next(error);
    }

    if (!chosenFile) {
        const error = new HttpError(
            'Could not find a file with provided id.',
            404
        );

        return next(error);
    }

    let user;
    try {
        user = await User.findById(req.userData.userId);
    } catch (err) {
        const error = new HttpError('Something went wrong.', 500);

        return next(error);
    }

    if (!user) {
        const error = new HttpError(
            'Could not find a user with provided id.',
            404
        );

        return next(error);
    }

    try {
        let fileIndex = user.archive.findIndex((fId) => {
            return fId.toString() === fileId;
        });

        if (fileIndex > -1 && +state === 0) {
            user.archive.splice(fileIndex, 1);
        } else if (fileIndex === -1 && +state === 1) {
            user.archive.push(fileId);

            let currentsFileIndex = user.currents.findIndex((fId) => {
                return fId.toString() === fileId;
            });

            if (currentsFileIndex > -1) {
                user.currents.splice(currentsFileIndex, 1);
            }
        } else {
            throw new Error();
        }

        await user.save();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, please try again.',
            500
        );

        return next(error);
    }

    res.status(200).json({
        success: true,
        archive: user.archive,
        currents: user.currents,
    });
};

const toggleCurrents = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new HttpError(
            'Invalid values passed, please check your data.',
            422
        );
    }

    const { fileId, state } = req.body;

    let chosenFile;
    try {
        chosenFile = await File.findById(fileId);
    } catch (err) {
        const error = new HttpError('Something went wrong.', 500);

        return next(error);
    }

    if (!chosenFile) {
        const error = new HttpError(
            'Could not find a file with provided id.',
            404
        );

        return next(error);
    }

    let user;
    try {
        user = await User.findById(req.userData.userId);
    } catch (err) {
        const error = new HttpError('Something went wrong.', 500);

        return next(error);
    }

    if (!user) {
        const error = new HttpError(
            'Could not find a user with provided id.',
            404
        );

        return next(error);
    }

    try {
        let fileIndex = user.currents.findIndex((fId) => {
            return fId.toString() === fileId;
        });

        if (fileIndex > -1 && +state === 0) {
            user.currents.splice(fileIndex, 1);
        } else if (fileIndex === -1 && +state === 1) {
            let archiveFileIndex = user.archive.findIndex((fId) => {
                return fId.toString() === fileId;
            });

            if (archiveFileIndex === -1) {
                user.currents.push(fileId);
            }
        } else {
            throw new Error();
        }

        await user.save();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, please try again.',
            500
        );

        return next(error);
    }

    res.status(200).json({
        success: true,
        currents: user.currents,
    });
};

const getAllCategories = async (req, res, next) => {
    let categories;

    try {
        categories = await Category.find();
    } catch (err) {
        return next(new HttpError('Something went wrong.', 500));
    }

    if (!categories) {
        return next(new HttpError('Cannot find categories.', 404));
    }

    res.json({
        categories: categories.map((cat) => cat.toObject({ getters: true })),
    });
};

const searchLibrary = async (req, res, next) => {
    const { searchString } = req.body;

    let searchResults = [];

    if (searchString.length) {
        try {
            // chosenFiles = await File.find({
            //     $text: { $search: searchString },
            // });

            await File.search(searchString).then((data) => {
                searchResults = data;
            });
        } catch (err) {
            const error = new HttpError('Something went wrong.', 500);

            return next(error);
        }
    }

    if (searchResults && searchResults.length) {
        try {
            searchResults = await Promise.all(
                searchResults.map((file) => getCategoriesAndLanguage(file))
            );
        } catch (err) {
            return next(new HttpError('Something went wrong.', 500));
        }
    }

    res.json({
        files: searchResults.map((file) => file.toObject({ getters: true })),
    });
};

const getCategoriesAndLanguage = async (file) => {
    try {
        file = await File.findById(file.id)
            .populate('language')
            .populate('categories');
    } catch (err) {
        console.log(err);
    }

    return file;
};

exports.listAll = listAll;
exports.getByCategory = getByCategory;
exports.getById = getById;
exports.getAllCategories = getAllCategories;
exports.toggleWishlist = toggleWishlist;
exports.toggleArchive = toggleArchive;
exports.toggleCurrents = toggleCurrents;
exports.searchLibrary = searchLibrary;
