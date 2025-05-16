const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');

router.get('/', teacherController.getAllTeachers);
router.get('/search', teacherController.searchTeachers);
router.get('/:id', teacherController.getTeacherById);

module.exports = router;
