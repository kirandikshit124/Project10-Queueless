const express = require("express")
const appointmentRouter = express.Router();
const controller = require("../controllers/appointmentController")
const authMiddeware = require("../middleware/authMiddleware")
const roleMiddleware = require("../middleware/roleMiddleware")

appointmentRouter.get("/available-slots", authMiddeware, controller.getAvailableSlots)
appointmentRouter.post("/", authMiddeware, controller.createAppointment)
appointmentRouter.get("/my", authMiddeware, controller.getMyAppointments)
appointmentRouter.get("/:id", authMiddeware, controller.getAppointmentById)
appointmentRouter.put("/:id/cancel", authMiddeware, controller.cancelAppointment)

// Admin
appointmentRouter.get("/business/:businessId", authMiddeware, roleMiddleware("admin"), controller.getBusinessAppointments)
module.exports = appointmentRouter