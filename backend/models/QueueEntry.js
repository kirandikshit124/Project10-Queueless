const mongoose = require("mongoose");

const queueEntrySchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        business: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Business",
            required: true,
        },
        service: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service",
            required: true,
        },
        appointment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
            default: null,
        },
        queueNumber: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: [
                "waiting",
                "serving",
                "completed",
                "no-show",
                "cancelled",
            ],
            default: "waiting",
        },
        joinedAt: {
            type: Date,
            default: Date.now,
        },
        calledAt: {
            type: Date,
            default: null,
        },
        completedAt: {
            type: Date,
            default: null,
        },
        estimatedWait: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

queueEntrySchema.index({ business: 1, status: 1, joinedAt: 1 })  // Find active queue quickly
queueEntrySchema.index({ customer: 1, business: 1, status: 1 })  // Find customer's queue entry

module.exports = mongoose.model("QueueEntry", queueEntrySchema )