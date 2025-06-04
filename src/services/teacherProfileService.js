const supabase = require('../config/db'); // your MySQL connection pool

const getTeacherProfileById = async (id) => {
  const { data, error } = await supabase
    .from('Teacher')
    .select('*')
    .eq('teacher_id', id)
    .single();

  if (error) throw error;
  return data;
};

module.exports = {
  getTeacherProfileById,
};