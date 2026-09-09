const express = require("express")
const businessRouter = express.Router()
const controller = require("../controllers/businessController")
const authMiddleware = require("../middleware/authMiddleware")
const roleMiddleware = require("../middleware/roleMiddleware")

// Public
businessRouter.get("/", controller.getBusinesses);
businessRouter.get("/:id", controller.getBusinessById);

// Admin
businessRouter.post("/", authMiddleware, roleMiddleware("admin"), controller.createBusiness)
businessRouter.put("/:id", authMiddleware, roleMiddleware("admin"), controller.updateBusiness)
businessRouter.delete("/:id", authMiddleware, roleMiddleware("admin"), controller.deleteBusiness)

module.exports = businessRouter