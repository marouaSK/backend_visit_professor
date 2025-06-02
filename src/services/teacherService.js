// src/services/teacherService.js
const supabase = require('../config/db'); // This line is critical
console.log("--- teacherService.js --- Imported 'supabase' client from db.js. Type:", typeof supabase, supabase ? "Instance OK" : "Instance FAILED or UNDEFINED"); // LOG A

exports.findTeachersByName = async (name) => {
    console.log("--- findTeachersByName (teacherService.js) --- 'supabase' client inside function. Type:", typeof supabase, supabase ? "Instance OK" : "Instance FAILED or UNDEFINED"); // LOG B
    // Line 18 is likely here:
    const { data, error } = await supabase // If supabase is undefined, this is where .from fails
        .from('Teacher')
        .select('teacher_id, "Full_Name", "Pic_path"')
        .ilike('"Full_Name"', `%${name}%`);

    if (error) {
        console.error('Supabase error finding teachers by name:', error);
        throw new Error(error.message);
    }
    return data;
};

exports.findTeacherById = async (id) => {
    console.log("--- findTeacherById (teacherService.js) --- 'supabase' client inside function. Type:", typeof supabase, supabase ? "Instance OK" : "Instance FAILED or UNDEFINED"); // LOG C
    const { data, error } = await supabase
        .from('Teacher')
        .select('teacher_id, "Full_Name"')
        .eq('teacher_id', id)
        .single(); // Expects a single row

    if (error) {
        if (error.code === 'PGRST116') { // PostgREST code for "The result contains 0 rows"
            return null;
        }
        console.error('Supabase error finding teacher by ID:', error);
        throw new Error(error.message);
    }
    return data;
};

exports.getFullTeacherProfileById = async (id) => {
    const { data, error } = await supabase
        .from('Teacher')
        .select('*') // Select all columns for the profile
        .eq('teacher_id', id)
        .single();
    if (error) {
        if (error.code === 'PGRST116') return null;
        console.error('Supabase error finding full teacher profile by ID:', error);
        throw new Error(error.message);
    }
    return data;
};

exports.getAllTeachers = async () => {
  const { data, error } = await supabase
    .from('Teacher')
    .select('Full_Name, teacher_bio, Pic_path');

  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }

  return data;
};