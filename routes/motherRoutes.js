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

router.post('/diet', async (req, res) => {
  const { rch_id } = req.body;
  try {
    const result = await pool.query(
      'SELECT meal_timing, food_items FROM diet'
    );
    if (result.rows.length > 0) {
      res.status(200).json(result.rows);
    } else {
      res.status(404).json({ message: "No diet records found" });
    }
  } catch (err) {
    console.error("Error in /diet:", err.message);
    res.status(500).json({ error: err.message });
  }
});


// router.post('/diet/:rch_id', async (req, res) => {
//   const { rch_id } = req.params;
//   try {
//     const result = await pool.query(
//       'SELECT meal_timing, food_items FROM diet WHERE rch_id = $1',
//       [rch_id]
//     );

//     if (result.rows.length > 0) {
//       res.status(200).json(result.rows);
//     } else {
//       res.status(404).json({ message: "No diet records found" });
//     }
//   } catch (err) {
//     console.error("Error in /diet:", err);
//     res.status(500).json({ error: err.message });
//   }
// });


// Get appointment details by RCH ID
// router.post('/appointment', async (req, res) => {
//   const { rch_id } = req.body; // ✅ Read from request body
//   try {
//     const result = await pool.query(
//       `SELECT 
//         a.visit_type, 
//         a.appointment_datetime, 
//         h.name AS doctor_name
//       FROM appointment a
//       JOIN healthcare_worker h 
//         ON a.doctor = h.id
//       WHERE a.rch_id = $1`, // ✅ Use a parameterized query
//       [rch_id]               // ✅ Pass the value here
//     );

//     if (result.rows.length > 0) {
//       res.status(200).json(result.rows); // ✅ Return all rows
//     } else {
//       res.status(404).json({ message: "No appointments found" });
//     }
//   } catch (err) {
//     console.error("Error in /appointment:", err.message);
//     res.status(500).json({ error: err.message });
//   }
// });

router.post('/appointment', async (req, res) => {
  const { rch_id } = req.body;
  try {
    const result = await pool.query(
      `SELECT a.visit_type, a.appointment_datetime, h.name AS doctor_name , a.id, a.status FROM appointment a JOIN healthcare_worker h ON a.doctor = h.id WHERE a.rch = $1` , [rch_id]  
    );
    if (result.rows.length > 0) {
      res.status(200).json(result.rows);
    } else {
      res.status(404).json({ message: "No diet records found" });
    }
  } catch (err) {
    console.error("Error in /diet:", err.message);
    res.status(500).json({ error: err.message });
  }
});


router.post('/reschedule-appointment', async (req, res) => {
  const { appointment_id, new_date, new_time, new_session } = req.body;

  try {
    await pool.query(
      `UPDATE appointment
SET 
    appointment_datetime = make_timestamp(
        EXTRACT(YEAR FROM new_date)::int,
        EXTRACT(MONTH FROM new_date)::int,
        EXTRACT(DAY FROM new_date)::int,
        EXTRACT(HOUR FROM new_time)::int,
        EXTRACT(MINUTE FROM new_time)::int,
        0
    )::timestamp,
    session = new_session,
    status = 'rescheduled',
    reason = 'Rescheduled by user'
FROM (
    SELECT 
        $1::date AS new_date,
        $2::time AS new_time,
        $3::text AS new_session
) params
WHERE appointment.id = $4;`,
      [new_date, new_time, new_session, appointment_id]
    );

    res.status(200).json({ message: "Appointment rescheduled successfully" });
  } catch (err) {
    console.error("Error in /reschedule-appointment:", err.message);
    res.status(500).json({ error: err.message });
  }
});




// Get mother details (ANC visit) by RCH ID
// router.post('/mother-details', async (req, res) => {
//   const { rch_id } = req.params;
//   try {
//     const result = await pool.query(
//       `SELECT hb, bp_systolic, bp_diastolic FROM public.anc_visit WHERE rch_id = $1`, [rch_id]
//     );

//     if (result.rows.length > 0) {
//       res.status(200).json(result.rows);
//     } else {
//       res.status(404).json({ message: "No ANC visit details found" });
//     }
//   } catch (err) {
//     console.error("Error in /mother-details:", err.message);
//     res.status(500).json({ error: err.message });
//   }
// });

router.post('/mother-details', async (req, res) => {
  const { rch_id } = req.body;
  try {
    const result = await pool.query(
      `SELECT hb, weight,  bp_systolic, bp_diastolic FROM public.anc_visit WHERE rch_id = $1`, [rch_id]  
    );
    if (result.rows.length > 0) {
      res.status(200).json(result.rows);
    } else {
      res.status(404).json({ message: "No diet records found" });
    }
  } catch (err) {
    console.error("Error in /diet:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/available-slots', async (req, res) => {
  const { rch_id } = req.body;
  try {
    const result = await pool.query(
      `WITH target_doctor AS (
    
    SELECT da.doctor
    FROM doctor_assignment da
    WHERE da.rch_id = $1  
),
missed_dates AS (
    SELECT DISTINCT a.appointment_datetime::date AS missed_date
    FROM appointment a
    JOIN target_doctor td ON a.doctor = td.doctor
    WHERE a.status = 'missed'
    ORDER BY missed_date ASC
    LIMIT 5
),
doctor_duty AS (
    SELECT 
        COALESCE(hw.duty_start_time, '09:00')::time AS start_time,
        COALESCE(hw.duty_end_time, '17:00')::time AS end_time
    FROM healthcare_worker hw
    JOIN target_doctor td ON hw.id = td.doctor
),
day_slots AS (
    SELECT 
        md.missed_date + g AS slot_date,
        (dd.start_time + (n * interval '30 minutes'))::time AS slot_time,
        CASE 
            WHEN (dd.start_time + (n * interval '30 minutes'))::time < '12:30'::time THEN 'forenoon'
            ELSE 'afternoon'
        END AS session
    FROM missed_dates md
    CROSS JOIN generate_series(1, 5) g  -- 5-day window from missed_date
    CROSS JOIN doctor_duty dd
    CROSS JOIN generate_series(
        0,
        ((EXTRACT(EPOCH FROM (dd.end_time - dd.start_time)) / 60) / 30)::int - 1
    ) n
),
taken_slots AS (
    SELECT 
        a.appointment_datetime::date AS appt_date,
        a.appointment_datetime::time AS appt_time
    FROM appointment a
    JOIN target_doctor td ON a.doctor = td.doctor
),
leave_days AS (
    SELECT dl.leave_date
    FROM doctor_leave dl
    JOIN target_doctor td ON dl.doctor = td.doctor
),
session_summary AS (
    SELECT 
        ds.slot_date,
        ds.session,
        ARRAY_AGG(ds.slot_time ORDER BY ds.slot_time) 
            FILTER (WHERE ts.appt_time IS NULL) AS free_slot_times,
        COUNT(*) FILTER (WHERE ts.appt_time IS NULL) AS free_slots,
        CASE 
            WHEN ds.slot_date IN (SELECT leave_date FROM leave_days) THEN 'leave'
            WHEN COUNT(*) FILTER (WHERE ts.appt_time IS NULL) > 0 THEN 'available'
            ELSE 'overflow'
        END AS session_status
    FROM day_slots ds
    LEFT JOIN taken_slots ts 
        ON ds.slot_date = ts.appt_date 
       AND ds.slot_time = ts.appt_time
    GROUP BY ds.slot_date, ds.session
)
SELECT *
FROM session_summary
WHERE session_status != 'leave'
ORDER BY slot_date, session;`, [rch_id]  
    );
   if (result.rows.length > 0) {
  const formatted = result.rows.map(r => ({
    slotDate: r.slot_date,
    session: r.session,
    freeSlotTimes: r.free_slot_times || [], // will still be a string if not casted
    freeSlots: Number(r.free_slots),
    sessionStatus: r.session_status
  }));
  res.status(200).json(formatted);
} else {
  res.status(404).json({ message: "No slots found" });
}
  } catch (err) {
    console.error("Error in /diet:", err.message);
    res.status(500).json({ error: err.message });
  }
});



router.get('/mother-details', async (req, res) => {
  const rch_id = req.query.rch_id;  // Get rch_id from query parameters

  if (!rch_id) {
    return res.status(400).json({ message: "rch_id is required" });
  }

  try {
    const result = await pool.query(
      `SELECT hb, weight, bp_systolic, bp_diastolic FROM public.anc_visit WHERE rch_id = $1`, [rch_id]
    );
    if (result.rows.length > 0) {
      res.status(200).json(result.rows);
    } else {
      res.status(404).json({ message: "No mother details found" });
    }
  } catch (err) {
    console.error("Error in /mother-details GET:", err.message);
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;
