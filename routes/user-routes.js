const express = require('express');
const { check } = require('express-validator');

const userController = require('../controllers/user-controller');
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.get('/', userController.getUsers);

router.post(
    '/signup',
    fileUpload.single('image'),
    [
        check('name').not().isEmpty(),
        check('email').normalizeEmail().isEmail(),
        check('password').isLength({ min: 6 }),
    ],
    userController.signup
);

router.post('/login', userController.login);

router.use(checkAuth);

router.put(
    '/editProfile',
    fileUpload.single('image'),
    [check('name').not().isEmpty(), check('email').normalizeEmail().isEmail()],
    userController.editProfile
);

router.delete('/deleteProfile/:id', userController.deleteProfile);
router.get('/getUserLists', userController.getUserLists);

module.exports = router;
