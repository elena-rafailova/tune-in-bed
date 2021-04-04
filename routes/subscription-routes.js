const express = require('express');
const { check } = require('express-validator');

const subscriptionController = require('../controllers/subscription-controller');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.get('/', subscriptionController.listPlans);

router.use(checkAuth);

router.post(
    '/savePlan',
    [check('planId').not().isEmpty()],
    subscriptionController.savePlan
);

module.exports = router;
