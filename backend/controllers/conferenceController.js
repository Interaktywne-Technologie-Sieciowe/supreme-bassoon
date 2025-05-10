const fs = require("fs");
const path = require("path");
const db = require("../config/database");
const { v4: uuidv4, validate: isUuid } = require("uuid");

// REPLACEME: Use proper logger
const logInfo = (msg) => console.log("[INFO]", msg);
const logError = (msg) => console.error("[ERROR]", msg);

const cleanupTempFile = async (filePath) => {
  try {
    await fs.promises.unlink(filePath);
    logInfo(`Deleted temp file: ${filePath}`);
  } catch (err) {
    logError(`Failed to delete temp file: ${filePath} - ${err.message}`);
  }
};

const withTransaction = async (callback) => {
  await db.query("BEGIN");
  try {
    const result = await callback();
    await db.query("COMMIT");
    return result;
  } catch (err) {
    await db.query("ROLLBACK");
    throw err;
  }
};

const handleErrors = (err, res) => {
  logError(err.stack || err);
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "production" ? "Something went wrong" : err.message
  });
};

const validateConference = (conference) => {
  const requiredFields = ["name", "start_date", "end_date", "location"];
  for (const field of requiredFields) {
    if (!conference[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  const startDate = new Date(conference.start_date);
  const endDate = new Date(conference.end_date);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error("Invalid date format");
  }

  if (startDate > endDate) {
    throw new Error("End date must be after start date");
  }
};

const validateEvent = (event) => {
  if (!event.name || !event.start_date || !event.end_date) {
    throw new Error("Missing required event fields");
  }

  const start = new Date(event.start_date);
  const end = new Date(event.end_date);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error("Invalid date format in event");
  }

  if (start > end) {
    throw new Error("Event end date must be after start date");
  }
};

exports.getAllConferences = async (req, res) => {
  try {
    const { rows } = await db.query("SELECT * FROM CONFERENCE ORDER BY start_date DESC");
    logInfo(`Fetched ${rows.length} conferences`);
    res.json(rows);
  } catch (err) {
    handleErrors(err, res);
  }
};

cleanEventForLite = (event) => {
  return {
    name: event.name,
    location: event.location,
    start_date: "ENTER START DATE",
    end_date: "ENTER END DATE"
  };
};
cleanConferenceForLite = (conference) => {
  return {
    name: conference.name,
    description: conference.description,
    location: conference.location,
    start_date: "ENTER START DATE",
    end_date: "ENTER END DATE"
  };
};

exports.exportConference = async (req, res) => {
  try {
    const { id } = req.params;
    const liteExport = req.headers["x-lite-export"] === "true";

    if (!isUuid(id)) {
      return res.status(400).json({ error: "Invalid conference ID format" });
    }

    const confRes = await db.query("SELECT * FROM CONFERENCE WHERE id = $1", [id]);
    const conference = confRes.rows[0];

    if (!conference) return res.status(404).json({ error: "Conference not found" });

    const eventsRes = await db.query("SELECT * FROM EVENTS WHERE conference_id = $1", [id]);
    const events = eventsRes.rows;

    const exportData = {
      conference: liteExport ? cleanConferenceForLite(conference) : conference,
      events: liteExport
        ? events.map((value, index, array) => {
            return cleanEventForLite(value);
          })
        : events
    };

    const filename = `conference-${id}-${Date.now()}.json`;
    const uploadsDir = path.join(__dirname, "..", "uploads");

    await fs.promises.mkdir(uploadsDir, { recursive: true });

    const filePath = path.join(uploadsDir, filename);
    await fs.promises.writeFile(filePath, JSON.stringify(exportData, null, 2));

    logInfo(`Exported conference ${id} with ${events.length} events to ${filename}`);

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    res.download(filePath, filename, (err) => {
      if (err) {
        logError(`Download error: ${err.message}`);
      }
      cleanupTempFile(filePath);
    });
  } catch (err) {
    handleErrors(err, res);
  }
};

exports.importConference = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "File is required" });

    const fileExt = path.extname(file.originalname).toLowerCase();
    if (fileExt !== ".json") {
      await cleanupTempFile(file.path);
      return res.status(400).json({ error: "Only JSON files are allowed" });
    }

    const filePath = path.join(__dirname, "..", "uploads", file.filename);
    let fileContent, conference, events;

    try {
      fileContent = await fs.promises.readFile(filePath, "utf-8");
      const parsed = JSON.parse(fileContent);
      conference = parsed.conference;
      events = parsed.events;

      if (!conference || !events || !Array.isArray(events)) {
        throw new Error("Invalid file format");
      }

      validateConference(conference);
      events.forEach(validateEvent);
      logInfo(`Validated conference file with ${events.length} events`);
    } catch (parseErr) {
      await cleanupTempFile(filePath);
      return res.status(400).json({ error: "Invalid JSON file", message: parseErr.message });
    }

    const newConferenceId = uuidv4();
    const now = new Date().toISOString();

    await withTransaction(async () => {
      await db.query(
        `INSERT INTO CONFERENCE (id, name, created_at, start_date, end_date, description, last_update, location)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          newConferenceId,
          conference.name,
          now,
          conference.start_date,
          conference.end_date,
          conference.description || "",
          now,
          conference.location
        ]
      );

      for (const event of events) {
        await db.query(
          `INSERT INTO EVENTS (id, name, created_at, start_date, end_date, conference_id, location, last_update)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [uuidv4(), event.name, now, event.start_date, event.end_date, newConferenceId, event.location || "", now]
        );
      }
    });

    await cleanupTempFile(filePath);

    logInfo(`Imported conference ${newConferenceId} with ${events.length} events`);

    res.json({
      message: "Conference imported successfully",
      conferenceId: newConferenceId
    });
  } catch (err) {
    if (req.file) await cleanupTempFile(req.file.path);
    handleErrors(err, res);
  }
};

exports.deleteConference = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isUuid(id)) {
      return res.status(400).json({ error: "Invalid conference ID format" });
    }

    await withTransaction(async () => {
      const confRes = await db.query("SELECT * FROM CONFERENCE WHERE id = $1", [id]);
      if (confRes.rows.length === 0) {
        throw new Error("Conference not found"); // Will trigger rollback
      }

      await db.query("DELETE FROM CONFERENCE WHERE id = $1", [id]);
    });

    logInfo(`Deleted conference ${id}`);

    res.json({ message: "Conference and related data deleted successfully" });
  } catch (err) {
    if (err.message === "Conference not found") {
      return res.status(404).json({ error: err.message });
    }
    handleErrors(err, res);
  }
};
