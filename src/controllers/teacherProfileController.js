const { getTeacherProfileById } = require('../services/teacherProfileService.js');

const fetchTeacherProfileById = async (req, res) => {
  const { id } = req.params;
  try {
    const profile = await getTeacherProfileById(id); // Service layer function
    if (!profile) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    res.status(200).json(profile);
  } catch (err) {
    console.error('Error in controller:', err);
    res.status(500).json({ error: 'Failed to fetch teacher profile by ID' });
  }
};

module.exports = { fetchTeacherProfileById };