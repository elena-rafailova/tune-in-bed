const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const Plan = require('../models/plan');
const User = require('../models/user');
const { calculateNextPayment } = require('../helpers/payments-helper');

const listPlans = async (req, res, next) => {
    let plans;

    try {
        plans = await Plan.find();
    } catch (err) {
        return next(new HttpError('Something went wrong.', 500));
    }

    res.json({
        plans: plans.map((plans) => plans.toObject({ getters: true })),
    });
};

const savePlan = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new HttpError(
            'Invalid inputs passed, please check your data.',
            422
        );
    }

    const { planId } = req.body;

    let chosenPlan;
    try {
        chosenPlan = await Plan.findById(planId);
    } catch (err) {
        const error = new HttpError('Something went wrong.', 500);

        return next(error);
    }

    if (!chosenPlan) {
        const error = new HttpError(
            'Could not find a plan with provided id.',
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
        user.planId = planId;
        user.isSubActive = true;

        let date = new Date();
        date = await calculateNextPayment(chosenPlan.paymentType, date);
        user.nextPaymentDate = date;

        await user.save();
    } catch (err) {
        const error = new HttpError(
            'Saving of the chosen subscription plan failed, please try again.',
            500
        );

        return next(error);
    }

    res.status(200).json({ plan: planId });
};

exports.listPlans = listPlans;
exports.savePlan = savePlan;
