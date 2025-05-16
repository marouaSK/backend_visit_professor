// src/services/evaluationService.js
const supabase = require('../config/db');

exports.createEvaluation = async ({ applicantTeacherId, applicationId, evaluatorTeacherId }) => {
    // The `evaluation` table's `teacher_id` is the applicant being evaluated.
    // `evaluator_id` is the teacher performing the evaluation.
    const newEvaluation = {
        teacher_id: applicantTeacherId,
        application_id: applicationId,
        evaluator_id: evaluatorTeacherId,
        evaluation_status: 'Assigned', // Or your desired initial status
        evaluation_date: new Date().toISOString(),
    };

    const { data, error } = await supabase
        .from('evaluation')
        .insert(newEvaluation)
        .select() // To get the inserted row back
        .single(); // Assuming insert returns one row

    if (error) {
        console.error('Supabase error creating evaluation:', error);
        // Check for specific Supabase/PostgreSQL error codes if needed
        // e.g., error.code === '23503' for foreign key violation
        // e.g., error.code === '23505' for unique constraint violation
        throw new Error(error.message); // Or a more specific error
    }
    return data;
};