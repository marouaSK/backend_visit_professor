// src/services/evaluationStatusService.js
const supabase = require('../config/db');

exports.fetchAllEvaluationStatuses = async () => {
    console.log("Attempting to call RPC: get_evaluation_statuses");
    const { data, error, status, statusText } = await supabase.rpc('get_evaluation_statuses');

    if (error) {
        console.error('Supabase RPC error (get_evaluation_statuses):', JSON.stringify(error, null, 2));
        console.error(`Supabase RPC error status: ${status}, statusText: ${statusText}`);
        throw new Error(error.message || `RPC failed with status ${status}`);
    }

    console.log("Data received from RPC 'get_evaluation_statuses':", data ? data.length : 'null/undefined');

    if (!data || !Array.isArray(data)) {
        console.warn("RPC 'get_evaluation_statuses' did not return a valid array. Returning empty array.");
        return [];
    }

    // Transform data to match frontend expectations if needed
    // The RPC structure already aligns well with your 'initialData'
    return data.map(item => ({
        id: `eval-${item.evaluation_id}`, // Frontend expects an 'id' like "eval-1"
        type: "evaluation_pair", // Consistent type
        status: item.evaluation_status_derived,
        evaluator: {
            id: `user-evaluator-${item.evaluator_id}`, // Consistent ID format
            name: item.evaluator_name,
            identifier: item.evaluator_identifier,
            avatar: item.evaluator_avatar || `https://via.placeholder.com/60/C7C7C7/3A6B7E?Text=${item.evaluator_name ? item.evaluator_name.substring(0,2).toUpperCase() : 'EV'}`,
        },
        teacher: {
            id: `user-teacher-${item.teacher_id}`, // Consistent ID format for navigation
            name: item.teacher_name,
            identifier: item.teacher_identifier,
            avatar: item.teacher_avatar || `https://via.placeholder.com/60/A0D2DB/3A6B7E?Text=${item.teacher_name ? item.teacher_name.substring(0,2).toUpperCase() : 'TE'}`,
            score: item.evaluation_status_derived === 'submitted' ? (item.overall_score || 'N/A') : null, // Display score only if submitted
            // Store original teacher_id if needed for direct navigation w/o 'user-teacher-' prefix
            original_teacher_id: item.teacher_id 
        },
        // Store original evaluator_id if needed
        original_evaluator_id: item.evaluator_id
    }));
};