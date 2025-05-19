const PDFDocument = require('pdfkit');
const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

exports.generateUsageReport = async (req, res) => {
  try {
    const usersRes = await pool.query(`
      SELECT name, surname, email FROM users ORDER BY surname, name
    `);
    const users = usersRes.rows;

    const loginStats = await pool.query(`SELECT COALESCE(SUM(login_count), 0) AS total_logins FROM users`);
    const totalLogins = loginStats.rows[0].total_logins;

    const likeStats = await pool.query(`SELECT COUNT(*) AS total_likes FROM bookmarks WHERE is_active = true`);
    const totalLikes = likeStats.rows[0].total_likes;

    const eventRes = await pool.query(`
      SELECT e.name AS event_name, u.name AS user_name, u.surname AS user_surname, u.email
      FROM events e
      LEFT JOIN bookmarks b ON e.id = b.event_id AND b.is_active = true
      LEFT JOIN users u ON b.user_id = u.id
      ORDER BY e.start_date, e.name, u.name
    `);

    const eventsMap = {};
    for (const row of eventRes.rows) {
      if (!eventsMap[row.event_name]) eventsMap[row.event_name] = [];
      if (row.user_name) {
        eventsMap[row.event_name].push(`${row.user_name} ${row.user_surname} (${row.email})`);
      }
    }

    const doc = new PDFDocument();
    const filePath = path.join(__dirname, '..', 'uploads', `raport-${Date.now()}.pdf`);
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const fontPath = path.join(__dirname, '..', 'fonts', 'DejaVuSans.ttf');
    doc.registerFont('DejaVu', fontPath);
    doc.font('DejaVu');

    doc.fontSize(20).text('Raport użycia aplikacji', { align: 'center' }).moveDown();

    doc.fontSize(16).text(`Liczba zarejestrowanych użytkowników: ${users.length}`);
    doc.moveDown(0.5);

    doc.fontSize(16).text(`Łączna liczba logowań: ${totalLogins}`);
    doc.fontSize(16).text(`Łączna liczba polubień eventów: ${totalLikes}`);
    doc.moveDown(1);

    doc.fontSize(14).text('Lista użytkowników:');
    users.forEach((user, i) => {
      doc.fontSize(12).text(`${i + 1}. ${user.name} ${user.surname} (${user.email})`);
    });

    doc.moveDown();

    doc.fontSize(14).text('Wydarzenia i użyktownicy, którzy je polubili:').moveDown();

    for (const [event, users] of Object.entries(eventsMap)) {
      doc.fontSize(13).text(`• ${event}`);
      if (users.length) {
        users.forEach(u => doc.fontSize(11).text(`  - ${u}`));
      } else {
        doc.fontSize(11).text('  brak użytkowników');
      }
      doc.moveDown(0.5);
    }

    doc.end();

    stream.on('finish', () => {
      res.download(filePath, err => {
        if (err) console.error('Download error:', err);
        fs.unlink(filePath, () => {});
      });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Błąd generowania raportu' });
  }
};
