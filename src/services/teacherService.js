const  supabase  = require('../config/db');

exports.getAllTeachers = async () => {
  const { data, error } = await supabase
    .from('Teacher')
    .select('Full_Name, teacher_bio, Pic_path');
  
  if (error) {
    throw error;
  }
  
  return data;
};
