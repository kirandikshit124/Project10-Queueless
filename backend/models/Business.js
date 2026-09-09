const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            default: "",
        },
        category: {
            type: String,
            enum: [
                "clinic",
                "salon",
                "diagnostic-lab",
                "government-office",
                "service-center",
                "other",
            ],
            required: true,
        },
        address: {
            type: String,
            required: true,
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
            default: "",
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            default: "",
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        workingHours: {
            monday: {
                isOpen: { type: Boolean, default: true },
                open: { type: String, default: "09:00" },
                close: { type: String, default: "18:00" },
            },
            tuesday: {
                isOpen: { type: Boolean, default: true },
                open: { type: String, default: "09:00" },
                close: { type: String, default: "18:00" },
            },
            wednesday: {
                isOpen: { type: Boolean, default: true },
                open: { type: String, default: "09:00" },
                close: { type: String, default: "18:00" },
            },
            thursday: {
                isOpen: { type: Boolean, default: true },
                open: { type: String, default: "09:00" },
                close: { type: String, default: "18:00" },
            },
            friday: {
                isOpen: { type: Boolean, default: true },
                open: { type: String, default: "09:00" },
                close: { type: String, default: "18:00" },
            },
            saturday: {
                isOpen: { type: Boolean, default: true },
                open: { type: String, default: "09:00" },
                close: { type: String, default: "14:00" },
            },
            sunday: {
                isOpen: { type: Boolean, default: false },
                open: { type: String, default: "09:00" },
                close: { type: String, default: "14:00" },
            },
        },
    },
    {
        timestamps: true,
    }
)

const businessModel = mongoose.model("Business", businessSchema)
module.exports = businessModel