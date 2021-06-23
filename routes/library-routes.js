const express = require('express');
const { check } = require('express-validator');

const libraryController = require('../controllers/library-controller');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.get('/', libraryController.listAll);
router.get('/getCategories', libraryController.getAllCategories);
router.post('/search', libraryController.searchLibrary);
router.get('/category/:catName', libraryController.getByCategory);
router.get('/:id', libraryController.getById);

router.use(checkAuth);

router.post(
    '/toggleWishlist',
    [check('fileId').not().isEmpty()],
    [check('state').not().isEmpty()],
    libraryController.toggleWishlist
);

router.post(
    '/toggleArchive',
    [check('fileId').not().isEmpty()],
    [check('state').not().isEmpty()],
    libraryController.toggleArchive
);

router.post(
    '/toggleCurrents',
    [check('fileId').not().isEmpty()],
    [check('state').not().isEmpty()],
    libraryController.toggleCurrents
);

module.exports = router;
