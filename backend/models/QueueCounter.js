const mongoose = require("mongoose");

const queueCounterSchema = new mongoose.Schema(
    {
        business: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Business",
            required: true,
            unique: true,
        },
        date: {
            type: String,
            required: true,
        },
        lastNumber: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
)

queueCounterSchema.index(
    { business: 1, date: 1 },
    { unique: true }
)

module.exports = mongoose.model("QueueCounter", queueCounterSchema);