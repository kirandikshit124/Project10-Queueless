const express = require("express")
const serviceRouter = express.Router()
const controller = require("../controllers/serviceController")
const authMiddleware = require("../middleware/authMiddleware")
const roleMiddleware = require("../middleware/roleMiddleware")

// Public
serviceRouter.get("/business/:businessId", controller.getBusinessServices)

// Admin
serviceRouter.post("/", authMiddleware, roleMiddleware("admin"), controller.createService)
serviceRouter.put("/:id", authMiddleware, roleMiddleware("admin"), controller.updateService)
serviceRouter.delete("/:id", authMiddleware, roleMiddleware("admin"), controller.deleteService)

module.exports = serviceRouter