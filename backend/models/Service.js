const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
    {
        business: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Business",
            required: true,
        },
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
        duration: {
            type: Number,
            required: true,
            min: 1,
        },
        price: {
            type: Number,
            min: 0,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
)
serviceSchema.index({
    business: 1,
    isActive: 1,
})

const serviceModel = mongoose.model("Service", serviceSchema)
module.exports = serviceModel