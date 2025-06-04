const express = require('express');
const router = express.Router();

const { fetchTeacherProfileById } = require('../controllers/teacherProfileController.js');

router.get('/:id', fetchTeacherProfileById);

module.exports = router;
