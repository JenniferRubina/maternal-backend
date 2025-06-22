
const express = require('express');
const router = express.Router();
const { getAllMothers } = require('../controllers/motherController');
router.get('/', getAllMothers);
module.exports = router;
