const express = require("express");
const router = express.Router();
const { getBookmarks, addBookmark, removeBookmark } = require("../controllers/bookmarkController");
const { requireAuth } = require("../middlewares/auth");
const { requireMinRole } = require("../middlewares/roles");

router.get("/", requireAuth, requireMinRole("user"), getBookmarks);
router.post("/:eventId", requireAuth, requireMinRole("user"), addBookmark);
router.delete("/:eventId", requireAuth, requireMinRole("user"), removeBookmark);

module.exports = router;
