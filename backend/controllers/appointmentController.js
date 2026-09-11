const Appointment = require("../models/Appointment")
const Business = require("../models/Business")
const Service = require("../models/Service")
const { timeToMinutes, addMinutesToTime } = require("../utils/timeUtils")
const { getDayName } = require("../utils/dateUtils");

exports.getAvailableSlots = async (req, res) => {
    const { businessId, serviceId, date } = req.query
    if (!businessId || !serviceId || !date) {
        return res.status(400).json({
            success: false,
            message: "Business, service and date are required",
        })
    }
    try {
        const business = await Business.findById(businessId);
        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found",
            })
        }
        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found",
            })
        }
        if ( service.business.toString() !== business._id.toString()) {
            return res.status(400).json({
                success: false,
                message: "Service does not belong to this business",
            })
        }
        const dayName = getDayName(date);
        const daySchedule = business.workingHours[dayName]
        if (!daySchedule || !daySchedule.isOpen) {
            return res.status(200).json({
                success: true,
                slots: [],
                message: "Business is closed on this day",
            })
        }
        const appointments = await Appointment.find({business: businessId, date, status: {$nin: ["cancelled", "no-show"]}}).select("startTime endTime")
        const openMinutes = timeToMinutes(daySchedule.open);
        const closeMinutes = timeToMinutes(daySchedule.close)
        const slots = []
        const SLOT_INTERVAL = service.duration;
        for ( let current = openMinutes; current + service.duration <= closeMinutes; current += SLOT_INTERVAL) {
            const startTime = addMinutesToTime( daySchedule.open, current - openMinutes )
            const endTime = addMinutesToTime( startTime, service.duration )
            const hasConflict = appointments.some((appointment) => {
                    const existingStart = timeToMinutes( appointment.startTime )
                    const existingEnd = timeToMinutes(appointment.endTime)
                    const newStart = timeToMinutes(startTime)
                    const newEnd = timeToMinutes(endTime);
                    return (
                        newStart < existingEnd &&
                        newEnd > existingStart
                    )
                })
            if (!hasConflict) {
                slots.push({
                    startTime,
                    endTime,
                })
            }
        }
        return res.status(200).json({
            success: true,
            slots,
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        })
    }
}

exports.createAppointment = async (req, res) => {
    const { business, service, date, startTime, notes } = req.body
    if ( !business || !service || !date || !startTime ) {
        return res.status(400).json({
            success: false,
            message: "Please provide all appointment details",
        })
    }
    try {
        const businessData = await Business.findById(business);
        if (!businessData) {
            return res.status(404).json({
                success: false,
                message: "Business not found",
            })
        }
        const serviceData = await Service.findById(service);
        if (!serviceData) {
            return res.status(404).json({
                success: false,
                message: "Service not found",
            })
        }
        if ( serviceData.business.toString() !== business.toString()) {
            return res.status(400).json({
                success: false,
                message: "Service does not belong to this business",
            })
        }
        if (!serviceData.isActive) {
            return res.status(400).json({
                success: false,
                message: "This service is currently unavailable",
            })
        }
        const dayName = getDayName(date);     // Check working day
        const schedule = businessData.workingHours[dayName]
        if (!schedule || !schedule.isOpen) {
            return res.status(400).json({
                success: false,
                message: "Business is closed on this day",
            })
        }
        const endTime = addMinutesToTime( startTime, serviceData.duration )
        const requestedStart = timeToMinutes(startTime)
        const requestedEnd = timeToMinutes(endTime)
        const opening = timeToMinutes(schedule.open)
        const closing = timeToMinutes(schedule.close)
        if ( requestedStart < opening || requestedEnd > closing ) {      // Check whether appointment is within working hours
            return res.status(400).json({
                success: false,
                message: "Appointment is outside working hours",
            })
        }
        const appointments = await Appointment.find({ business, date, status: {$nin: ["cancelled", "no-show"]}}).select("startTime endTime")
        const hasConflict = appointments.some((appointment) => {
                const existingStart = timeToMinutes(appointment.startTime)
                const existingEnd = timeToMinutes(appointment.endTime)
                return (
                    requestedStart < existingEnd &&
                    requestedEnd > existingStart
                )
            })
        if (hasConflict) {
            return res.status(409).json({
                success: false,
                message: "This time slot is no longer available",
            })
        }
        const appointment = await Appointment.create({ customer: req.user._id, business, service, date, startTime, endTime, notes })
        const populatedAppointment =
            await Appointment.findById(appointment._id).populate("business", "name address").populate("service", "name duration price")
        return res.status(201).json({
            success: true,
            message: "Appointment booked successfully",
            appointment: populatedAppointment,
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        })
    }
}

exports.getMyAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({customer: req.user._id}).populate("business","name category address").populate("service","name duration price").sort({date: 1,startTime: 1,})
        return res.status(200).json({
            success: true,
            appointments,
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        })
    }
}

exports.getAppointmentById = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id).populate("business", "name category address phone").populate("service", "name duration price")
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found",
            })
        }
        if (appointment.customer.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to view this appointment",
            })
        }
        return res.status(200).json({
            success: true,
            appointment,
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        })
    }
}

exports.cancelAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found",
            })
        }
        if (appointment.customer.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to cancel this appointment",
            })
        }
        if (["completed", "cancelled", "no-show"].includes(appointment.status)) {
            return res.status(400).json({
                success: false,
                message: "This appointment cannot be cancelled",
            })
        }
        appointment.status = "cancelled";
        await appointment.save()
        return res.status(200).json({
            success: true,
            message: "Appointment cancelled successfully",
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        })
    }
}

exports.getBusinessAppointments = async (req, res) => {
    try {
        const business = await Business.findById( req.params.businessId )
        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found",
            })
        }
        if ( business.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to view these appointments",
            })
        }
        const filter = {business: req.params.businessId}
        if (req.query.date) {
            filter.date = req.query.date;
        }
        const appointments = await Appointment.find(filter).populate("customer","name email").populate("service","name duration price").sort({date: 1,startTime: 1})
        return res.status(200).json({
            success: true,
            appointments,
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        })
    }
}