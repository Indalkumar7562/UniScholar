const express = require('express');
const { checkEligibility, getResults } = require('../controllers/eligibility.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.post('/check', checkEligibility);
router.get('/results', getResults);

module.exports = router;
