const express = require("express");
const controller = require("../controllers/queueController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const queueRouter = express.Router();

// CUSTOMER
queueRouter.post("/check-in",authMiddleware, controller.checkIn)
queueRouter.get("/live/:businessId", authMiddleware, controller.getLiveQueue)
queueRouter.get("/my-position", authMiddleware, controller.getMyQueuePosition)
queueRouter.put("/:id/leave", authMiddleware, controller.leaveQueue)

// ADMIN
queueRouter.post("/call-next", authMiddleware, roleMiddleware("admin"), controller.callNextCustomer)
queueRouter.put("/:id/complete", authMiddleware, roleMiddleware("admin"), controller.completeCustomer)
queueRouter.put("/:id/no-show", authMiddleware, roleMiddleware("admin"), controller.markNoShow)

module.exports = queueRouter;