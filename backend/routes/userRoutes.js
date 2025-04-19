const express = require("express");
const router = express.Router();
const { getAllUsers, deleteUser, createUser } = require("../controllers/userController");
const { requireAuth } = require("../middlewares/auth");
const { requireMinRole } = require("../middlewares/roles");

router.get("/", getAllUsers);
router.post("/createUser", requireAuth, requireMinRole("admin"), createUser);
router.delete("/:id", requireAuth, requireMinRole("admin"), deleteUser);

module.exports = router;
