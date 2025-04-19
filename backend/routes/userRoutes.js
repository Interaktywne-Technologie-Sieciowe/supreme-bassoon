const express = require("express");
const router = express.Router();
const { getAllUsers, adminImport, createUser } = require("../controllers/userController");
const { requireAuth } = require("../middlewares/auth");
const { requireMinRole } = require("../middlewares/roles");

router.get("/", getAllUsers);
router.post("/createUser", requireAuth, requireMinRole("admin"), createUser);

module.exports = router;
