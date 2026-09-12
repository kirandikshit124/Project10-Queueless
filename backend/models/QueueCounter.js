const mongoose = require("mongoose");

const queueCounterSchema = new mongoose.Schema(
    {
        business: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Business",
            required: true,
            unique: true,
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

module.exports = mongoose.model("QueueCounter", queueCounterSchema);