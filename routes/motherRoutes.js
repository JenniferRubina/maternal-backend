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

// Verify number and return full mother details if exists
router.post('/verify-number', async (req, res) => {
  const { phone } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM public.motherdetails WHERE contact_number = $1',
      [phone]
    );

    if (result.rows.length > 0) {
      // return the full mother details instead of just exists: true
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ message: "Mother not found" });
    }
  } catch (err) {
    console.error("Error in verify-number:", err.message);
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
