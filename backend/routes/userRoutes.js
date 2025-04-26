const express = require("express");
const router = express.Router();
const { getAllUsers, deleteUser, createUser, resetPassword } = require("../controllers/userController");
const { requireAuth } = require("../middlewares/auth");
const { requireMinRole } = require("../middlewares/roles");

router.get("/", getAllUsers);
router.post("/createUser", requireAuth, requireMinRole("admin"), createUser);
router.post("/resetPassword", resetPassword);
router.delete("/:id", requireAuth, requireMinRole("admin"), deleteUser);

module.exports = router;
