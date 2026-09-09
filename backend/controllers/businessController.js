const Business = require("../models/Business");

exports.createBusiness = async (req, res) => {
    const { name, description, category, address, phone, email, workingHours } = req.body
    if (!name || !category || !address) {
        return res.status(400).json({
            success: false,
            message: "Please provide business name, category and address"
        })
    }
    try {
        const business = await Business.create({ name, description, category, address, phone, email, workingHours, owner: req.user._id })
        return res.status(201).json({
            success: true,
            message: "Business created successfully",
            business,
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

exports.getBusinesses = async (req, res) => {
    try {
        const businesses = await Business.find().populate("owner", "name email").sort({ createdAt: -1 })
        return res.status(200).json({
            success: true,
            businesses,
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

exports.getBusinessById = async (req, res) => {
    try {
        const business = await Business.findById(req.params.id).populate("owner", "name email")
        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found"
            })
        }
        return res.status(200).json({
            success: true,
            business,
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

exports.updateBusiness = async (req, res) => {
    const { name, description, category, address, phone, email, workingHours } = req.body;
    try {
        const business = await Business.findById(
            req.params.id
        )
        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found"
            })
        }
        if (
            business.owner.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to update this business"
            })
        }
        business.name = name ?? business.name
        business.description = description ?? business.description
        business.category = category ?? business.category
        business.address = address ?? business.address
        business.phone = phone ?? business.phone
        business.email = email ?? business.email
        business.workingHours = workingHours ?? business.workingHours
        await business.save()
        return res.status(200).json({
            success: true,
            message: "Business updated successfully",
            business,
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

exports.deleteBusiness = async (req, res) => {
    try {
        const business = await Business.findById(
            req.params.id
        )
        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found"
            })
        }
        if (
            business.owner.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to delete this business"
            })
        }
        await business.deleteOne();
        return res.status(200).json({
            success: true,
            message: "Business deleted successfully"
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}