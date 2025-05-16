// src/models/Application.js
const db = require('../config/db');

class Application {
    // Fetch teachers who have an application and are not yet in the evaluation table for that application
    static async findUnassignedApplicants() {
        const query = `
            SELECT
                app.application_id,
                t.teacher_id,
                t."Full_Name",
                t."Pic_path" AS avatar,
                t."Email" AS identifier  -- Using Email as a unique identifier for display
            FROM application app
            JOIN "Teacher" t ON app.teacher_id = t.teacher_id
            LEFT JOIN evaluation e ON app.application_id = e.application_id AND t.teacher_id = e.teacher_id
            WHERE e.evaluation_id IS NULL; 
            -- Add more conditions if needed, e.g., app.application_status = 'Submitted'
        `;
        // The WHERE e.evaluation_id IS NULL ensures we only get applicants not yet in the evaluation table.
        // You might need to adjust this query based on how you define "not yet evaluated".
        // For example, if an evaluation record is created with a 'Pending' status, you'd filter by that.
        // For now, I'm assuming if an entry exists in `evaluation` for that teacher+application, they are assigned.

        const { rows } = await db.query(query);
        return rows;
    }
}
module.exports = Application;