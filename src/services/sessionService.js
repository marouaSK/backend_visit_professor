const supabase = require('../config/db');

exports.fetchLatestSessionDetails = async () => {
  console.log('[sessionService.fetchLatestSessionDetails] Fetching latest session...');
  const selectString = 'session_id, session_start, session_end, admin_id'; // Ensure 'session_description' exists or remove
  console.log(`[sessionService.fetchLatestSessionDetails] SELECT: ${selectString}`);
  const { data, error } = await supabase
    .from('session')
    .select(selectString) 
    .order('session_start', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('[sessionService.fetchLatestSessionDetails] Supabase error:', JSON.stringify(error, null, 2));
    throw error;
  }
  // ... (rest of function)
  return data;
};

exports.fetchSessionsByDate = async (dateString) => {
  console.log(`[sessionService.fetchSessionsByDate] Fetching for date: ${dateString}`);
  const startOfDayUTC = `${dateString}T00:00:00.000Z`;
  const dateObj = new Date(dateString + 'T00:00:00.000Z');
  dateObj.setUTCDate(dateObj.getUTCDate() + 1);
  const startOfNextDayUTC = dateObj.toISOString();
  const selectString = 'session_id, session_start, session_end, admin_id'; // Ensure 'session_description' exists or remove
  console.log(`[sessionService.fetchSessionsByDate] SELECT: ${selectString}`);

  const { data, error } = await supabase
    .from('session')
    .select(selectString)
    .or(
      `and(session_start.gte.${startOfDayUTC},session_start.lt.${startOfNextDayUTC}),` +
      `and(session_end.gte.${startOfDayUTC},session_end.lt.${startOfNextDayUTC})`
    )
    .order('session_start', { ascending: true });

  if (error) {
    console.error(`[sessionService.fetchSessionsByDate] Supabase error for date ${dateString}:`, JSON.stringify(error, null, 2));
    throw error;
  }
  // ... (rest of function)
  return data || [];
};
exports.calculateSessionStats = async (sessionId) => {
  console.log(`[sessionService.calculateSessionStats] Calculating stats for session ${sessionId}`);
  // This select is for counting reports, does not need modification for signed URLs.
  const selectString = `application_status, evaluation (visit_report (visit_report_id))`;
  console.log(`[sessionService.calculateSessionStats] SELECT from application: ${selectString}`);
  
  const { data: applications, error: appError } = await supabase
    .from('application')
    .select(selectString)
    .eq('session_id', sessionId);

  if (appError) { 
    console.error(`[sessionService.calculateSessionStats] Supabase error for session ${sessionId}:`, JSON.stringify(appError, null, 2));
    throw appError; 
  }
  if (!applications || applications.length === 0) { 
    console.log(`[sessionService.calculateSessionStats] No applications found for session ${sessionId}. Returning default stats.`);
    return { acceptedPercentage: 0, rejectedPercentage: 0, reportsPercentage: 0, rawCounts: { accepted: 0, rejected: 0, reports: 0, total: 0 } };
  }
  
  let acceptedCount = 0, rejectedCount = 0, reportsCount = 0;
  const totalApplications = applications.length;

  applications.forEach(app => {
    if (['accepted', 'Completed', 'Active'].includes(app.application_status)) {
      acceptedCount++;
      // Check if evaluation is an array or object, and if visit_report exists
      if (app.evaluation) {
        const evaluations = Array.isArray(app.evaluation) ? app.evaluation : [app.evaluation];
        evaluations.forEach(ev => {
          if (ev.visit_report) {
            const reports = Array.isArray(ev.visit_report) ? ev.visit_report : [ev.visit_report];
            if (reports.some(report => report && report.visit_report_id)) {
              reportsCount++;
            }
          }
        });
      }
    } else if (app.application_status === 'rejected') {
      rejectedCount++;
    }
  });

  console.log(`[sessionService.calculateSessionStats] Stats for session ${sessionId}: Accepted=${acceptedCount}, Rejected=${rejectedCount}, Reports=${reportsCount}, Total=${totalApplications}`);
  return {
    acceptedPercentage: totalApplications > 0 ? Math.round((acceptedCount / totalApplications) * 100) : 0,
    rejectedPercentage: totalApplications > 0 ? Math.round((rejectedCount / totalApplications) * 100) : 0,
    reportsPercentage: acceptedCount > 0 ? Math.round((reportsCount / acceptedCount) * 100) : 0, // Ensure acceptedCount > 0
    rawCounts: { accepted: acceptedCount, rejected: rejectedCount, reports: reportsCount, total: totalApplications }
  };
};


exports.fetchEvaluatedTeachersForSession = async (sessionId, { search, page, limit }) => {
  console.log(`[sessionService.fetchEvaluatedTeachersForSession] Called for session ${sessionId}, search: '${search}', page: ${page}, limit: ${limit}`);
  const offset = (page - 1) * limit;

  const selectQuery = `
    evaluation_id,
    teacher_id,
    evaluator_id,
    evaluation_status,
    evaluation_date, 
    application!inner (
      application_id,
      session_id
    ),
    evaluatedTeacher: "Teacher"!evaluation_teacher_id_fkey ( 
      teacher_id,
      "Full_Name",
      "Email",
      "Pic_path"
    ),
    visit_report!left ( 
      visit_report_id,
      file_path
    ),
    evaluation_score ( 
      score 
    )
  `;
  console.log(`[sessionService.fetchEvaluatedTeachersForSession] SELECT query string for evaluations:\n${selectQuery}`);

  let query = supabase
    .from('evaluation')
    .select(selectQuery, { count: 'exact' })
    .eq('application.session_id', sessionId);

  if (search && search.trim() !== '') {
    console.log(`[sessionService.fetchEvaluatedTeachersForSession] Constructing search for term: '${search}'`);
    const { data: matchingTeachers, error: teacherSearchError } = await supabase
      .from('Teacher')
      .select('teacher_id')
      .or(`"Full_Name".ilike.%${search}%,"Email".ilike.%${search}%`);

    if (teacherSearchError) {
        console.error(`[sessionService.fetchEvaluatedTeachersForSession] DB Error searching "Teacher" table:`, teacherSearchError);
        throw teacherSearchError;
    }
    
    if (!matchingTeachers || matchingTeachers.length === 0) {
      console.log(`[sessionService.fetchEvaluatedTeachersForSession] No teachers found matching search term '${search}'. Returning empty.`);
      return { totalItems: 0, totalPages: 0, currentPage: page, teachers: [] };
    }
    const matchingTeacherIds = matchingTeachers.map(t => t.teacher_id);
    console.log(`[sessionService.fetchEvaluatedTeachersForSession] Found matching teacher IDs for search: ${matchingTeacherIds.join(', ')}`);
    query = query.in('teacher_id', matchingTeacherIds); 
  }

  console.log(`[sessionService.fetchEvaluatedTeachersForSession] Executing final query for evaluations for session ${sessionId}.`);
  const { data: evaluations, error, count } = await query
    .order('evaluation_id', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error(`[sessionService.fetchEvaluatedTeachersForSession] DB Error fetching evaluations (session ${sessionId}):`, JSON.stringify(error, null, 2));
    throw error;
  }

  if (!evaluations) {
    console.log(`[sessionService.fetchEvaluatedTeachersForSession] No evaluations data returned for session ${sessionId} with current filters (data is null/undefined).`);
    return { totalItems: 0, totalPages: 0, currentPage: page, teachers: [] };
  }
  if (evaluations.length === 0) {
    console.log(`[sessionService.fetchEvaluatedTeachersForSession] Zero evaluations found for session ${sessionId} with current filters.`);
  } else {
    console.log(`[sessionService.fetchEvaluatedTeachersForSession] Found ${evaluations.length} evaluation records before formatting.`);
  }

  // Asynchronously map evaluations to formatted teachers, including signed URLs
  const formattedTeachersPromises = evaluations.map(async (ev, index) => {
    console.log(`[sessionService.fetchEvaluatedTeachersForSession] Formatting teacher for evaluation record ${index + 1}, ID: ${ev.evaluation_id}`);
    const teacherDetails = ev.evaluatedTeacher; 
    
    if (!teacherDetails) {
        console.warn(`[sessionService.fetchEvaluatedTeachersForSession] Evaluation ID ${ev.evaluation_id} (for teacher_id ${ev.teacher_id}) has no 'evaluatedTeacher' data. Skipping.`);
        return null; 
    }
    console.log(`[sessionService.fetchEvaluatedTeachersForSession]   Teacher details found: ${teacherDetails["Full_Name"]}`);

    let overallScore = 0;
    if (ev.evaluation_score && Array.isArray(ev.evaluation_score) && ev.evaluation_score.length > 0) {
      overallScore = ev.evaluation_score.reduce((sum, item) => sum + (Number(item.score) || 0), 0);
      console.log(`[sessionService.fetchEvaluatedTeachersForSession]   Score from evaluation_score: ${overallScore}`);
    } else {
      console.log(`[sessionService.fetchEvaluatedTeachersForSession]   No scores found in 'evaluation_score' for evaluation ID ${ev.evaluation_id}.`);
    }

    let visitReportId = null;
    let reportFilePath = null;
    let reportSignedUrl = null; // <<<< To store the signed URL

    if (ev.visit_report && Array.isArray(ev.visit_report) && ev.visit_report.length > 0) {
        visitReportId = ev.visit_report[0].visit_report_id;
        reportFilePath = ev.visit_report[0].file_path;
        console.log(`[sessionService.fetchEvaluatedTeachersForSession]   Visit report found: ID ${visitReportId}, Path: ${reportFilePath}`);
    } else if (ev.visit_report && ev.visit_report.visit_report_id) { // Handle if not an array (less common for !left join)
        visitReportId = ev.visit_report.visit_report_id;
        reportFilePath = ev.visit_report.file_path;
        console.log(`[sessionService.fetchEvaluatedTeachersForSession]   Visit report (single object) found: ID ${visitReportId}, Path: ${reportFilePath}`);
    } else {
      // This log is now conditional, only if reportFilePath is not set by the end
    }
    
    if (reportFilePath) {
        try {
            const BUCKET_NAME = process.env.SUPABASE_VISIT_REPORTS_BUCKET || 'visit-reports'; // Use env var or your actual bucket name
            const SIGNED_URL_EXPIRES_IN = 300; // 5 minutes

            if (reportFilePath.trim() && reportFilePath.trim() !== '/') {
                const { data: signedUrlData, error: signedUrlError } = await supabase
                    .storage
                    .from(BUCKET_NAME)
                    .createSignedUrl(reportFilePath, SIGNED_URL_EXPIRES_IN);

                if (signedUrlError) {
                    console.error(`[sessionService.fetchEvaluatedTeachersForSession] Error generating signed URL for '${reportFilePath}' in bucket '${BUCKET_NAME}' (Eval ID ${ev.evaluation_id}):`, JSON.stringify(signedUrlError, null, 2));
                } else if (signedUrlData && signedUrlData.signedUrl) {
                    reportSignedUrl = signedUrlData.signedUrl;
                    console.log(`[sessionService.fetchEvaluatedTeachersForSession]   Generated signed URL for Eval ID ${ev.evaluation_id}.`);
                } else {
                     console.warn(`[sessionService.fetchEvaluatedTeachersForSession]   No signed URL data returned for Eval ID ${ev.evaluation_id}, path '${reportFilePath}'.`);
                }
            } else {
                console.warn(`[sessionService.fetchEvaluatedTeachersForSession]   Skipping signed URL generation for invalid path: '${reportFilePath}' for Eval ID ${ev.evaluation_id}.`);
            }
        } catch (e) {
            console.error(`[sessionService.fetchEvaluatedTeachersForSession] Exception during signed URL generation for Eval ID ${ev.evaluation_id}, path '${reportFilePath}':`, e);
        }
    } else {
         console.log(`[sessionService.fetchEvaluatedTeachersForSession]   No visit report file path found for evaluation ID ${ev.evaluation_id}. Cannot generate signed URL.`);
    }

    return {
      id: ev.evaluation_id, // Use evaluation_id as the primary unique ID for the list item
      teacher_id: teacherDetails.teacher_id,
      name: teacherDetails["Full_Name"],
      subtitle: teacherDetails["Email"],
      avatar: teacherDetails["Pic_path"] || null,
      score: overallScore,
      evaluation_id: ev.evaluation_id, 
      visit_report_id: visitReportId, // May still be useful for other purposes
      // report_file_path: reportFilePath, // Optional: uncomment if frontend still needs the raw path for some reason
      report_signed_url: reportSignedUrl, // <<<< New field with the signed URL
    };
  });

  const formattedTeachers = (await Promise.all(formattedTeachersPromises)).filter(Boolean); // filter(Boolean) removes any nulls if teacherDetails was missing

  console.log(`[sessionService.fetchEvaluatedTeachersForSession] Formatted ${formattedTeachers.length} teachers. Total items from count: ${count}`);
  return {
    totalItems: count || 0,
    totalPages: Math.ceil((count || 0) / limit),
    currentPage: page,
    teachers: formattedTeachers,
  };
};

// ... (fetchAllSessions - remains unchanged) ...
exports.fetchLatestSessionDetails = async () => {
  console.log('[sessionService.fetchLatestSessionDetails] Fetching latest session...');
  const selectString = 'session_id, session_start, session_end, admin_id'; // Added session_description based on usage elsewhere
  console.log(`[sessionService.fetchLatestSessionDetails] SELECT: ${selectString}`);
  const { data, error } = await supabase
    .from('session')
    .select(selectString) 
    .order('session_start', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('[sessionService.fetchLatestSessionDetails] Supabase error:', JSON.stringify(error, null, 2));
    throw error;
  }
  if (data) {
    console.log('[sessionService.fetchLatestSessionDetails] Latest session found:', data.session_id);
  } else {
    console.log('[sessionService.fetchLatestSessionDetails] No latest session found.');
  }
  return data;
};

exports.fetchSessionsByDate = async (dateString) => {
  console.log(`[sessionService.fetchSessionsByDate] Fetching for date: ${dateString}`);
  const startOfDayUTC = `${dateString}T00:00:00.000Z`;
  const dateObj = new Date(dateString + 'T00:00:00.000Z');
  dateObj.setUTCDate(dateObj.getUTCDate() + 1);
  const startOfNextDayUTC = dateObj.toISOString();
  const selectString = 'session_id, session_start, session_end, admin_id'; // Added session_description based on usage elsewhere
  console.log(`[sessionService.fetchSessionsByDate] SELECT: ${selectString}`);

  const { data, error } = await supabase
    .from('session')
    .select(selectString)
    .or(
      `and(session_start.gte.${startOfDayUTC},session_start.lt.${startOfNextDayUTC}),` +
      `and(session_end.gte.${startOfDayUTC},session_end.lt.${startOfNextDayUTC})`
    )
    .order('session_start', { ascending: true });

  if (error) {
    console.error(`[sessionService.fetchSessionsByDate] Supabase error for date ${dateString}:`, JSON.stringify(error, null, 2));
    throw error;
  }
  console.log(`[sessionService.fetchSessionsByDate] Found ${data ? data.length : 0} sessions for date ${dateString}.`);
  return data || [];
};

exports.fetchAllSessions = async () => {
    console.log('[sessionService.fetchAllSessions] Fetching all sessions...');
    const selectString = 'session_id, session_start, session_end, admin_id';
    console.log(`[sessionService.fetchAllSessions] SELECT: ${selectString}`);
    const { data, error } = await supabase
        .from('session')
        .select(selectString) 
        .order('session_start', { ascending: false });

    if (error) {
        console.error('[sessionService.fetchAllSessions] Supabase error:', error);
        throw error;
    }
    console.log(`[sessionService.fetchAllSessions] Fetched ${data ? data.length : 0} sessions.`);
    return data || [];
};