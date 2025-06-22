const express = require('express');
const router = express.Router();
const pool = require('../db'); // Ensure db.js is properly connected

// GET all mothers from mother_details
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM mother_details');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Database Error in /mothers:", error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
