// src/services/criteriaService.js
const supabase = require('../config/db');
console.log("--- criteriaService.js --- Imported 'supabase' client from db.js. Type:", typeof supabase);

exports.getAllCriteria = async () => {
    console.log("--- criteriaService.js --- getAllCriteria function CALLED."); // DEBUG LOG S1
    console.log("--- criteriaService.js --- Supabase client type in getAllCriteria:", typeof supabase); // DEBUG LOG S2
    try {
        console.log("--- criteriaService.js --- About to query Supabase 'criteria' table."); // DEBUG LOG S3
        const { data, error, status, count } = await supabase
            .from('criteria')
            .select('criteria_id, criteria_title, max_score, criteria_description')
            .order('criteria_id', { ascending: true });

        console.log("--- criteriaService.js --- Supabase query finished. Error:", error ? error.message : "No error. Status:", status, "Count:", count); // DEBUG LOG S4

        if (error) {
            console.error('--- criteriaService.js --- Supabase error object:', JSON.stringify(error, null, 2));
            throw new Error(error.message || `Supabase query failed with status ${status}`);
        }
        console.log("--- criteriaService.js --- Criteria fetched successfully. Data length:", data ? data.length : 'undefined/null'); // DEBUG LOG S5
        return data;
    } catch (serviceError) {
        console.error("--- criteriaService.js --- Error caught within getAllCriteria service:", serviceError.message); // DEBUG LOG S6
        console.error("Full error object in service:", serviceError);
        throw serviceError; // Re-throw the error to be caught by the controller
    }
};