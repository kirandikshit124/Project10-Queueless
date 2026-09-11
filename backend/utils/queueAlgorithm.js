const QueueEntry = require("../models/QueueEntry");

const getActiveQueue = async (businessId) => {
    return await QueueEntry.find({
        business: businessId,
        status: {
            $in: ["waiting", "serving"],
        },
    })
        .populate("customer", "name email")
        .populate("service", "name duration")
        .sort({
            joinedAt: 1,
        });
}

const getPeopleAhead = (queue, queueEntryId) => {
    const index = queue.findIndex(
        (entry) => entry._id.toString() === queueEntryId.toString()
    )
    if (index === -1) {
        return 0;
    }
    return queue.slice(0, index)
        .filter(
            (entry) =>
                entry.status === "waiting"
        ).length;
}

const calculateEstimatedWait = (peopleAhead, averageServiceTime) => {
    return Math.max( 0, peopleAhead * averageServiceTime )
}

module.exports = { getActiveQueue, getPeopleAhead, calculateEstimatedWait }