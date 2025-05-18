// src/services/sessionService.js
const supabase = require('../config/db');

exports.fetchAllSessions = async () => {
  console.log('[sessionService.fetchAllSessions] Fetching all sessions...');
  const { data, error } = await supabase
    .from('session') // Assumes table name is 'session'
    .select('session_id, session_start, session_end, session_description, admin_id') // admin_id from your session DDL
    .order('session_start', { ascending: false });
  if (error) {
    console.error('[sessionService.fetchAllSessions] Supabase error:', JSON.stringify(error, null, 2));
    throw error;
  }
  console.log(`[sessionService.fetchAllSessions] Found ${data ? data.length : 0} sessions.`);
  return data;
};

exports.fetchLatestSession = async () => {
  console.log('[sessionService.fetchLatestSession] Fetching latest session...');
  const { data, error } = await supabase
    .from('session')
    .select('session_id, session_start, session_end, session_description, admin_id')
    .order('session_start', { ascending: false })
    .limit(1)
    .maybeSingle(); // Returns object or null, doesn't error for 0 rows
  if (error) {
    console.error('[sessionService.fetchLatestSession] Supabase error:', JSON.stringify(error, null, 2));
    throw error;
  }
  console.log(`[sessionService.fetchLatestSession] Latest session found: ${data ? data.session_id : 'None'}`);
  return data;
};

exports.calculateSessionStats = async (sessionId) => {
  console.log(`[sessionService.calculateSessionStats] Called for session ID: ${sessionId}`);

  const countApplicationsByStatus = async (status) => {
    let query = supabase
      .from('application') // Assumes table name 'application'
      .select('*', { count: 'exact', head: true })
      .eq('session_id', sessionId); // Assumes application.session_id is BIGINT
    if (status) {
      query = query.eq('application_status', status);
    }
    const { count, error } = await query;
    if (error) {
      console.error(`[sessionService.calculateSessionStats] DB Error in countApplications (status: ${status || 'any'}):`, JSON.stringify(error, null, 2));
      throw error;
    }
    console.log(`[sessionService.calculateSessionStats] Application count for status '${status || 'all'}': ${count}`);
    return count || 0;
  };

  let totalApplications, acceptedCount, rejectedCount;
  try {
    totalApplications = await countApplicationsByStatus(null);
    console.log(`[sessionService.calculateSessionStats] totalApplications: ${totalApplications}`);

    if (totalApplications === 0) {
      console.log(`[sessionService.calculateSessionStats] No applications for session ${sessionId}, returning zero stats.`);
      return { acceptedPercentage: 0, rejectedPercentage: 0, reportsPercentage: 0, rawCounts: { accepted: 0, rejected: 0, reports: 0, total: 0 } };
    }

    acceptedCount = await countApplicationsByStatus('accepted');
    console.log(`[sessionService.calculateSessionStats] acceptedCount: ${acceptedCount}`);
    rejectedCount = await countApplicationsByStatus('rejected');
    console.log(`[sessionService.calculateSessionStats] rejectedCount: ${rejectedCount}`);
  } catch (error) {
      throw error;
  }


  let reportCount = 0;
  try {
    console.log(`[sessionService.calculateSessionStats] Starting reportCount calculation for session ${sessionId}`);
    const { data: evaluationsInSession, error: evalError } = await supabase
      .from('evaluation')
      .select(`
        evaluation_id,
        application!inner ( session_id ) 
      `)
      .eq('application.session_id', sessionId);

    if (evalError) {
      console.error(`[sessionService.calculateSessionStats] DB Error fetching evaluations for session ${sessionId} (Step 1 Report Count):`, JSON.stringify(evalError, null, 2));
      throw evalError;
    }

    console.log(`[sessionService.calculateSessionStats] Found ${evaluationsInSession ? evaluationsInSession.length : 0} evaluation(s) linked to session ${sessionId}.`);

    if (evaluationsInSession && evaluationsInSession.length > 0) {
      const evaluationIds = evaluationsInSession.map(ev => ev.evaluation_id);
      if (evaluationIds.length === 0) {
          console.log('[sessionService.calculateSessionStats] No valid evaluation IDs found to check reports against.');
      } else {
        console.log(`[sessionService.calculateSessionStats] Evaluation IDs for report check: ${evaluationIds.join(', ') || 'None'}`);
        const { count: reportsFoundCount, error: reportCheckError } = await supabase
          .from('visit_report')
          .select('evaluation_id', { count: 'exact', head: true })
          .in('evaluation_id', evaluationIds);

        if (reportCheckError) {
          console.error(`[sessionService.calculateSessionStats] DB Error counting visit_reports for evaluation IDs (Step 2 Report Count):`, JSON.stringify(reportCheckError, null, 2));
          throw reportCheckError;
        }
        reportCount = reportsFoundCount || 0;
        console.log(`[sessionService.calculateSessionStats] Found ${reportCount} visit reports for these evaluations.`);
      }
    } else {
      reportCount = 0;
    }
  } catch (error) {
    reportCount = 0;
    console.error(`[sessionService.calculateSessionStats] General error in reportCount block for session ${sessionId}:`, JSON.stringify(error, null, 2));
    throw error;
  }

  console.log(`[sessionService.calculateSessionStats] Final raw counts for session ${sessionId}: totalApps=${totalApplications}, accepted=${acceptedCount}, rejected=${rejectedCount}, reports=${reportCount}`);
  return {
    acceptedPercentage: totalApplications > 0 ? parseFloat(((acceptedCount / totalApplications) * 100).toFixed(1)) : 0,
    rejectedPercentage: totalApplications > 0 ? parseFloat(((rejectedCount / totalApplications) * 100).toFixed(1)) : 0,
    reportsPercentage: totalApplications > 0 ? parseFloat((((reportCount || 0) / totalApplications) * 100).toFixed(1)) : 0,
    rawCounts: { accepted: acceptedCount, rejected: rejectedCount, reports: reportCount, total: totalApplications }
  };
};


exports.fetchEvaluatedTeachersForSession = async (sessionId, { search, page, limit }) => {
  console.log(`[sessionService.fetchEvaluatedTeachers] Called for session ${sessionId}, search: '${search}', page: ${page}, limit: ${limit}`);
  const offset = (page - 1) * limit;

  let query = supabase
    .from('evaluation')
    .select(`
      evaluation_id,
      teacher_id, 
      evaluator_id,
      evaluation_status,
      evaluation_date, 
      evaluation_data, 
      application!inner (session_id), 
      evaluatedTeacher:"Teacher"!evaluation_teacher_id_fkey (teacher_id, "Full_Name", "Email", "Pic_path"),
      visit_report (visit_report_id, file_path),
      evaluation_score (score)
    `, { count: 'exact' })
    .eq('application.session_id', sessionId);

  if (search) {
    console.warn("[sessionService.fetchEvaluatedTeachers] Search on joined teacher fields needs custom DB setup (VIEW or FUNCTION). Search term ignored for now.");
  }

  const { data: evaluations, error, count } = await query
    .order('evaluation_id', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error(`[sessionService.fetchEvaluatedTeachers] DB Error for session ${sessionId}:`, JSON.stringify(error, null, 2));
    throw error;
  }
  console.log(`[sessionService.fetchEvaluatedTeachers] Fetched ${evaluations ? evaluations.length : 0} records for page. Total available: ${count}`);

  const formattedTeachers = evaluations.map(ev => {
    const teacherDetails = ev.evaluatedTeacher;

    if (!teacherDetails) {
      console.warn(`[sessionService.fetchEvaluatedTeachers] Evaluation ID ${ev.evaluation_id} in session ${sessionId} is missing 'evaluatedTeacher' data. Teacher ID was ${ev.teacher_id}. Skipping.`);
      return null;
    }

    let overallScore = 0;
    if (ev.evaluation_score && ev.evaluation_score.length > 0) {
      overallScore = ev.evaluation_score.reduce((sum, item) => sum + (Number(item.score) || 0), 0);
    } else if (ev.evaluation_data && typeof ev.evaluation_data.overall_score === 'number') { 
        overallScore = ev.evaluation_data.overall_score;
    }

    return {
      id: teacherDetails.teacher_id,
      name: teacherDetails["Full_Name"], // Assumes "Full_Name" in "Teacher" table
      subtitle: teacherDetails["Email"],   // Assumes "Email" in "Teacher" table
      avatar: teacherDetails["Pic_path"] || null, // Assumes "Pic_path" in "Teacher" table
      score: overallScore,
      evaluation_id: ev.evaluation_id,
      visit_report_id: ev.visit_report ? ev.visit_report.visit_report_id : null,
      report_file_path: ev.visit_report ? ev.visit_report.file_path : null,
    };
  }).filter(Boolean);

  return {
    totalItems: count || 0,
    totalPages: Math.ceil((count || 0) / limit),
    currentPage: page,
    teachers: formattedTeachers,
  };
};