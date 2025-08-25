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


router.post('/verify-number', async (req, res) => {
  const { phone } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM public.motherdetails WHERE contact_number = $1',
      [phone]
    );
    if (result.rows.length > 0) {
      res.status(200).json({ exists: true });
    } else {
      res.status(404).json({ exists: false });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
