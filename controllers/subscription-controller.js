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
        plans: plans.map((plan) => plan.toObject({ getters: true })),
    });
};

const savePlan = async (req, res, next) => {
    const planId = req.params.id;

    if (!planId) {
        const error = new HttpError('You have not provided an id.', 422);

        return next(error);
    }

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

    let date = new Date();
    try {
        user.planId = planId;
        user.isSubActive = true;

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

    res.status(200).json({
        planId: planId,
        success: true,
        nextPaymentDate: date,
    });
};

const getPlanInfo = async (req, res, next) => {
    const id = req.params.id;

    if (!id) {
        return next(new HttpError('You have not provided an id.', 422));
    }

    try {
        plan = await Plan.findOne({ _id: id });
    } catch (err) {
        return next(new HttpError('Something went wrong.', 500));
    }

    res.json({
        success: true,
        plan: plan.toObject({ getters: true }),
    });
};

exports.listPlans = listPlans;
exports.savePlan = savePlan;
exports.getPlanInfo = getPlanInfo;
