const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
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
        date: {
            type: String,
            required: true,
        },
        startTime: {
            type: String,
            required: true,
        },
        endTime: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: [
                "booked",
                "checked-in",
                "completed",
                "cancelled",
                "no-show",
            ],
            default: "booked",
        },
        notes: {
            type: String,
            trim: true,
            default: "",
        }
    },
    {
        timestamps: true,
    }
)

// Useful for finding appointments quickly
appointmentSchema.index({
    business: 1,
    date: 1,
    startTime: 1,
})
appointmentSchema.index({
    customer: 1,
    date: 1,
})

const appointmentModel = mongoose.model("Appointment", appointmentSchema)
module.exports = appointmentModel