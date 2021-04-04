const cron = require('node-cron');
const user = require('../models/user');
const User = require('../models/user');

const PAYMENT_TYPES = {
    monthly: 1,
    yearly: 2,
};

const calculateNextPayment = (paymentType, date) => {
    if (!paymentType) {
        return;
    }

    if (paymentType == PAYMENT_TYPES.monthly) {
        date.setMonth(date.getMonth() + 1);
        date.setUTCDate(date.getDate());
    } else if (paymentType == PAYMENT_TYPES.yearly) {
        date.setFullYear(date.getFullYear() + 1);
        date.setUTCDate(date.getDate());
    }

    return date;
};

let usersPaymentsTask = cron.schedule('0 0 0 * * *', async () => {
    let currentDate = new Date();
    const users = await User.find();
    if (users.length > 0) {
        users.forEach(async (user) => {
            if (user.isFreeTrial) {
                let dateCreated = new Date(user._id.getTimestamp());
                let diffDays = getDaysDifference(dateCreated, currentDate);

                if (diffDays > 14) {
                    user.isFreeTrial = false;
                }
            }

            if (user.isSubActive) {
                let userPaymentDate = new Date(user.nextPaymentDate.toString());
                let diffDays = getDaysDifference(userPaymentDate, currentDate);

                if (diffDays === 0) {
                    user.isSubActive = false;
                }
            }

            await user.save();
        });
    }
});

const getDaysDifference = (firstDate, secondDate) => {
    firstDate = new Date(
        firstDate.getFullYear(),
        firstDate.getMonth(),
        firstDate.getUTCDate()
    );

    secondDate = new Date(
        secondDate.getFullYear(),
        secondDate.getMonth(),
        secondDate.getUTCDate()
    );

    var millisecondsPerDay = 1000 * 60 * 60 * 24;
    var millisBetween = Math.abs(firstDate - secondDate);
    return Math.ceil(millisBetween / millisecondsPerDay);
};

exports.calculateNextPayment = calculateNextPayment;
exports.usersPaymentsTask = usersPaymentsTask;
