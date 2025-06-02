// src/controllers/teacherController.js
const teacherService = require('../services/teacherService');

exports.getAllTeachers = async (req, res, next) => {
    try {
        const teachers = await teacherService.getAllTeachers();
        res.json(teachers);
    } catch (error) {
        console.error('Error in getAllTeachers controller:', error);
        next(error); // ✅ ONLY forward it — let global error handler decide what to do
    }
};


exports.searchTeachers = async (req, res, next) => {
    try {
        const { name } = req.query;
        if (!name) {
            return res.status(400).json({ message: "Search name query parameter is required." });
        }
        const teachers = await teacherService.findTeachersByName(name);
        res.status(200).json(teachers);
    } catch (error) {
        // console.error('Error in searchTeachers controller:', error);
        // res.status(500).json({ message: error.message || 'Failed to search teachers' });
        next(error);
    }
};

exports.getTeacherById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const teacher = await teacherService.getFullTeacherProfileById(id); // New service function
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        res.json(teacher);
    } catch (error) {
        next(error);
    }
};