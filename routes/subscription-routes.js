const express = require('express');
const { check } = require('express-validator');

const subscriptionController = require('../controllers/subscription-controller');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.get('/', subscriptionController.listPlans);

router.use(checkAuth);

router.get('/savePlan/:id', subscriptionController.savePlan);

router.get('/getPlanInfo/:id', subscriptionController.getPlanInfo);

module.exports = router;
