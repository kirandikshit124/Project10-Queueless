const QueueEntry = require("../models/QueueEntry");
const Appointment = require("../models/Appointment");
const Business = require("../models/Business");
const Service = require("../models/Service");
const { getActiveQueue, getPeopleAhead, calculateEstimatedWait } = require("../utils/queueAlgorithm");

exports.checkIn = async (req, res) => {
    const {appointmentId} = req.body;
    if (!appointmentId) {
        return res.status(400).json({
            success: false,
            message: "Appointment ID is required",
        });
    }
    try {
        const appointment = await Appointment.findById(appointmentId).populate("service");
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found",
            })
        }
        if (appointment.customer.toString() !== req.user._id.toString()) {       // Make sure appointment belongs to logged-in customer
            return res.status(403).json({
                success: false,
                message: "You are not allowed to check in for this appointment",
            })
        }
        if (appointment.status !== "booked") {
            return res.status(400).json({
                success: false,
                message: `Appointment cannot be checked in because it is ${appointment.status}`,
            })
        }
        const existingEntry = await QueueEntry.findOne({        // Prevent duplicate check-in
                appointment: appointment._id,
                status: {
                    $in: ["waiting", "serving"],
                },
            })
        if (existingEntry) {
            return res.status(400).json({
                success: false,
                message: "You are already in the queue",
                queueEntry: existingEntry,
            })
        }
        const activeQueue = await QueueEntry.find({            // Get current queue
                business: appointment.business,
                status: {
                    $in: ["waiting", "serving"],
                },
            }).sort({
                joinedAt: 1,
            })
        const lastQueueEntry =await QueueEntry.findOne({business: appointment.business,}).sort({queueNumber: -1})            // Generate queue number
        const queueNumber = lastQueueEntry ? lastQueueEntry.queueNumber + 1 : 1;
        const peopleAhead = activeQueue.filter((entry) => entry.status === "waiting").length        // Count waiting customers
        const estimatedWait = calculateEstimatedWait( peopleAhead, appointment.service.duration)
        const queueEntry = await QueueEntry.create({
                customer: req.user._id,
                business: appointment.business,
                service: appointment.service._id,
                appointment: appointment._id,
                queueNumber,
                estimatedWait,
            })
        appointment.status = "checked-in";            // Update appointment
        await appointment.save()
        const populatedEntry = await QueueEntry.findById(queueEntry._id).populate("customer", "name email").populate("business", "name").populate("service", "name duration");
        return res.status(201).json({
            success: true,
            message: "Check-in successful",
            queueEntry: populatedEntry,
            peopleAhead,
            estimatedWait,
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        })
    }
}

exports.getLiveQueue = async (req, res) => {
    try {
        const business = await Business.findById(req.params.businessId)
        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found",
            })
        }
        const queue = await getActiveQueue(req.params.businessId)
        return res.status(200).json({
            success: true,
            queue,
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        })
    }
}

exports.getMyQueuePosition = async (req, res) => {
    const {businessId} = req.query
    if (!businessId) {
        return res.status(400).json({
            success: false,
            message: "Business ID is required",
        })
    }
    try {
        const queue = await QueueEntry.find({
                business: businessId,
                status: {
                    $in: ["waiting", "serving"],
                },
            }).populate(
                    "service",
                    "name duration"
                ).sort({
                    joinedAt: 1,
                })
        const myEntry = queue.find((entry) => entry.customer.toString() === req.user._id.toString())
        if (!myEntry) {
            return res.status(404).json({
                success: false,
                message: "You are not currently in the queue",
            })
        }
        const peopleAhead = getPeopleAhead(queue,myEntry._id)
        const averageServiceTime = myEntry.service.duration;
        const estimatedWait = calculateEstimatedWait(peopleAhead, averageServiceTime)
        return res.status(200).json({
            success: true,
            queueEntry: {
                id: myEntry._id,
                queueNumber: myEntry.queueNumber,
                status: myEntry.status,
                joinedAt: myEntry.joinedAt,
            },
            peopleAhead,
            estimatedWait,
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        })
    }
}

exports.callNextCustomer = async (req, res) => {
    const {businessId} = req.body
    if (!businessId) {
        return res.status(400).json({
            success: false,
            message: "Business ID is required",
        })
    }
    try {
        const business = await Business.findById(businessId)
        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found",
            })
        }
        if (business.owner.toString() !== req.user._id.toString()) {            // Check ownership
            return res.status(403).json({
                success: false,
                message: "You are not allowed to manage this queue",
            })
        }
        const currentlyServing = await QueueEntry.findOne({            // Don't call another customer if someone is already being served
                business: businessId,
                status: "serving",
            })
        if (currentlyServing) {
            return res.status(409).json({
                success: false,
                message: "A customer is already being served",
                queueEntry: currentlyServing,
            })
        }
        const nextCustomer = await QueueEntry.findOne({            // Get next waiting customer
                    business: businessId,
                    status: "waiting",
                }).sort({
                    joinedAt: 1,
                })
        if (!nextCustomer) {
            return res.status(404).json({
                success: false,
                message: "No customers waiting in the queue",
            })
        }
        nextCustomer.status = "serving";
        nextCustomer.calledAt = new Date();
        nextCustomer.estimatedWait = 0;
        await nextCustomer.save();
        if (nextCustomer.appointment) {             // Update appointment
            await Appointment.findByIdAndUpdate(
                nextCustomer.appointment,
                {
                    status: "checked-in",
                }
            )
        }
        const populatedEntry = await QueueEntry.findById(nextCustomer._id).populate("customer", "name email").populate("service", "name duration");
        return res.status(200).json({
            success: true,
            message: "Next customer called",
            queueEntry: populatedEntry,
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        })
    }
};

exports.completeCustomer = async (req, res) => {
    try {
        const queueEntry = await QueueEntry.findById(req.params.id).populate("business")
        if (!queueEntry) {
            return res.status(404).json({
                success: false,
                message: "Queue entry not found",
            })
        }
        if (queueEntry.business.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to manage this queue",
            })
        }
        if (queueEntry.status !== "serving") {
            return res.status(400).json({
                success: false,
                message: "Only a serving customer can be completed",
            })
        }
        queueEntry.status = "completed";
        queueEntry.completedAt = new Date();
        await queueEntry.save();
        if (queueEntry.appointment) {
            await Appointment.findByIdAndUpdate(
                queueEntry.appointment,
                {
                    status: "completed",
                }
            )
        }
        return res.status(200).json({
            success: true,
            message: "Customer marked as completed",
            queueEntry
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        })
    }
};

exports.markNoShow = async (req, res) => {
    try {
        const queueEntry = await QueueEntry.findById(req.params.id).populate("business");
        if (!queueEntry) {
            return res.status(404).json({
                success: false,
                message: "Queue entry not found",
            })
        }
        if (queueEntry.business.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to manage this queue",
            })
        }
        if (!["waiting", "serving"].includes(queueEntry.status)) {
            return res.status(400).json({
                success: false,
                message: "This queue entry cannot be marked as no-show",
            })
        }
        queueEntry.status = "no-show";
        queueEntry.completedAt = new Date();
        await queueEntry.save();
        if (queueEntry.appointment) {
            await Appointment.findByIdAndUpdate(
                queueEntry.appointment,
                {
                    status: "no-show",
                }
            )
        }
        return res.status(200).json({
            success: true,
            message: "Customer marked as no-show",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        })
    }
}

exports.leaveQueue = async (req, res) => {
    try {
        const queueEntry = await QueueEntry.findById(req.params.id)
        if (!queueEntry) {
            return res.status(404).json({
                success: false,
                message: "Queue entry not found",
            })
        }
        if (queueEntry.customer.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to leave this queue",
            });
        }
        if (queueEntry.status !== "waiting") {
            return res.status(400).json({
                success: false,
                message: "Only waiting customers can leave the queue",
            });
        }
        queueEntry.status = "cancelled"
        await queueEntry.save()
        if (queueEntry.appointment) {
            await Appointment.findByIdAndUpdate(
                queueEntry.appointment,
                {
                    status: "cancelled",
                }
            )
        }
        return res.status(200).json({
            success: true,
            message: "You have left the queue",
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        })
    }
}