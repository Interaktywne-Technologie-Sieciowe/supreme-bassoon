const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const { requireAuth } = require("../middlewares/auth");
const { requireMinRole } = require("../middlewares/roles");

router.get("/", eventController.getAllEvents);
router.get("/:id", eventController.getEventById);
router.post("/", requireAuth, requireMinRole("admin"), eventController.createEvent);
router.put("/:id", requireAuth, requireMinRole("admin"), eventController.updateEvent);
router.delete("/:id", requireAuth, requireMinRole("admin"), eventController.deleteEvent);

module.exports = router;
