const express = require('express');
const router = express.Router();
const pool = require('../db'); // Ensure db.js is properly connected

// GET all mothers from mother_details


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
router.post('/diet/:rch_id', async (req, res) => {
  const { rch_id } = req.params;
  try {
    const result = await pool.query(
      'SELECT meal_timing, food_items FROM diet WHERE rch_id = $1',
      [rch_id]
    );

    if (result.rows.length > 0) {
      res.status(200).json(result.rows);
    } else {
      res.status(404).json({ message: "No diet records found" });
    }
  } catch (err) {
    console.error("Error in /diet:", err);
    res.status(500).json({ error: err.message });
  }
});


// Get appointment details by RCH ID
router.post('/appointment/:rch_id', async (req, res) => {
  const { rch_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT 
        a.visit_type, 
        a.appointment_datetime, 
        h.name AS doctor_name
      FROM appointment a
      JOIN healthcare_worker h 
        ON a.doctor = h.id
      WHERE a.rch_id = $1`,
      [rch_id]
    );

    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ message: "No appointments found" });
    }
  } catch (err) {
    console.error("Error in /appointment:", err.message);
    res.status(500).json({ error: err.message });
  }
});


// Get mother details (ANC visit) by RCH ID
router.post('/mother-details/:rch_id', async (req, res) => {
  const { rch_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT hb, bp_systolic, bp_diastolic 
       FROM public.anc_visit
       WHERE rch_id = $1`,
      [rch_id]
    );

    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ message: "No ANC visit details found" });
    }
  } catch (err) {
    console.error("Error in /mother-details:", err.message);
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
