const Service = require("../models/Service")
const Business = require("../models/Business")

exports.createService = async (req, res) => {
    const { business, name, description, duration, price } = req.body;
    if ( !business || !name || !duration ) {
        return res.status(400).json({
            success: false,
            message: "Please provide business, name and duration"
        })
    }
    try {
        const businessExists = await Business.findById(business)
        if (!businessExists) {
            return res.status(404).json({
                success: false,
                message: "Business not found"
            })
        }
        if (businessExists.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to manage this business"
            })
        }
        const service = await Service.create({ business, name, description, duration, price })
        return res.status(201).json({
            success: true,
            message: "Service created successfully",
            service,
         })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

exports.getBusinessServices = async (req, res) => {
    try {
        const services = await Service.find({ business: req.params.businessId, isActive: true, }).sort({ createdAt: -1 })
        return res.status(200).json({
            success: true,
            services,
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

exports.updateService = async (req, res) => {
    const { name, description, duration, price, isActive } = req.body
    try {
        const service = await Service.findById(req.params.id)
        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            })
        }
        const business = await Business.findById(service.business)
        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found"
            })
        }
        if (business.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to update this service"
            })
        }
        service.name = name ?? service.name
        service.description = description ?? service.description;
        service.duration = duration ?? service.duration;
        service.price = price ?? service.price;
        service.isActive = isActive ?? service.isActive;
        await service.save()
        return res.status(200).json({
            success: true,
            message: "Service updated successfully",
            service,
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

exports.deleteService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id)
        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            })
        }
        const business = await Business.findById(service.business);
        if (business.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to delete this service"
            })
        }
        service.isActive = false;  // Soft delete
        await service.save()
        return res.status(200).json({
            success: true,
            message: "Service deleted successfully"
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}