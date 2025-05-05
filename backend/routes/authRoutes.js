const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middlewares/auth");
const authController = require("../controllers/authController");

router.post("/", authController.login);
router.post("/reset-password", authController.resetPassword);
router.get("/me", requireAuth, authController.refreshLogin);
router.post("/logout", requireAuth, authController.logout);

module.exports = router;
