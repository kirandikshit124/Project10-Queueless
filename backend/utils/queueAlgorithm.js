const QueueEntry = require("../models/QueueEntry");
const { getAverageServiceTime } = require("./serviceTime");

const getActiveQueue = async (businessId, date) => {
    const queue = await QueueEntry.find({
        business: businessId,
        date: date,
        status: {
            $in: ["waiting", "serving"],
        },
    })
        .populate("customer", "name email")
        .populate("service", "name duration")
        .populate("appointment", "date startTime")
        .sort({
            joinedAt: 1,
        });
    return queue;
};

const calculateRemainingServiceTime = (servingCustomer, averageServiceTime) => {
    if (!servingCustomer) {
        return 0;
    }
    if (!servingCustomer.startedAt) {
        return averageServiceTime;
    }
    const elapsedMinutes = Math.floor(
        (Date.now() - servingCustomer.startedAt.getTime()) /
            (1000 * 60)
    )
    return Math.max(0, averageServiceTime - elapsedMinutes);
};

const calculateEstimatedWait = async (queue, currentEntry) => {
    if (!currentEntry) {
        return 0;
    }
    const waitingAhead = queue.filter(
        (entry) =>
            entry.status === "waiting" &&
            entry.joinedAt < currentEntry.joinedAt
    )
    let estimatedWait = 0;
    const servingCustomer = queue.find(
        (entry) => entry.status === "serving"
    )
    if (servingCustomer) {
        const averageServiceTime = (await getAverageServiceTime(servingCustomer.business, servingCustomer.service._id)) || servingCustomer.service.duration
        estimatedWait += calculateRemainingServiceTime(servingCustomer, averageServiceTime);
    }
    for (const entry of waitingAhead) {
        const averageServiceTime = (await getAverageServiceTime(entry.business, entry.service._id)) || entry.service.duration;
        estimatedWait += averageServiceTime;
    }
    return estimatedWait;
};

const updateQueueEstimates = async (businessId, date) => {
    const queue = await getActiveQueue(businessId, date);
    for (const entry of queue) {
        if (entry.status !== "waiting") {
            continue;
        }
        entry.estimatedWait = await calculateEstimatedWait(queue, entry);
        await entry.save();
    }
};

module.exports = { getActiveQueue, calculateEstimatedWait, updateQueueEstimates }