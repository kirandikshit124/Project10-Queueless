const QueueEntry = require("../models/QueueEntry");

const getAverageServiceTime = async (businessId, serviceId) => {
    const completedEntries = await QueueEntry.find({
        business: businessId,
        service: serviceId,
        status: "completed",
        actualServiceDuration: {
            $gt: 0,
        },
    }).sort({ completedAt: -1 }).limit(20);
    if (completedEntries.length === 0) {
        return null;
    }
    const totalDuration = completedEntries.reduce(
        (total, entry) => total + entry.actualServiceDuration,
        0
    )
    return Math.ceil(totalDuration / completedEntries.length);
};

module.exports = { getAverageServiceTime }