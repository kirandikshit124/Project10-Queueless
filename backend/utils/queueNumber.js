const QueueCounter = require("../models/QueueCounter");

const getNextQueueNumber = async (businessId) => {
    const counter = await QueueCounter.findOneAndUpdate(
        { business: businessId },
        {
            $inc: {
                lastNumber: 1,
            },
        },
        {
            new: true,
            upsert: true,
        }
    )
    return counter.lastNumber;
};

module.exports = getNextQueueNumber;