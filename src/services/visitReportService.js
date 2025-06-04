// src/services/visitReportService.js
const supabase = require('../config/db');
const config = require('../config'); // To get the bucket name

// Use the bucket name from config
const REPORTS_BUCKET_NAME = config.SUPABASE_REPORTS_BUCKET_NAME;

console.log('--- visitReportService.js file is being loaded ---'); // DEBUG
console.log(`--- visitReportService.js --- Using reports bucket: ${REPORTS_BUCKET_NAME}`); // DEBUG

exports.generateSignedUrlForReport = async (visitReportId) => {
  console.log(`[visitReportService.generateSignedUrlForReport] Generating signed URL for visit report ID: ${visitReportId}`);

  if (!REPORTS_BUCKET_NAME) {
    console.error("[visitReportService.generateSignedUrlForReport] SUPABASE_REPORTS_BUCKET_NAME is not configured.");
    throw new Error("Server configuration error: Reports bucket name missing.");
  }

  const { data: report, error: fetchError } = await supabase
    .from('visit_report')
    .select('file_path')
    .eq('visit_report_id', visitReportId)
    .single();

  if (fetchError) {
    console.error(`[visitReportService.generateSignedUrlForReport] Error fetching report ${visitReportId}:`, JSON.stringify(fetchError, null, 2));
    throw fetchError;
  }

  if (!report) {
    console.warn(`[visitReportService.generateSignedUrlForReport] Visit report with ID ${visitReportId} not found.`);
    const notFoundError = new Error('Visit report not found.');
    notFoundError.status = 404;
    throw notFoundError;
  }

  if (!report.file_path) {
    console.warn(`[visitReportService.generateSignedUrlForReport] Visit report ${visitReportId} has no file_path.`);
    const noPathError = new Error('File path missing for this report.');
    noPathError.status = 400;
    throw noPathError;
  }

  const { data: signedUrlData, error: signError } = await supabase
    .storage
    .from(REPORTS_BUCKET_NAME)
    .createSignedUrl(report.file_path, 60 * 5); // Expires in 5 minutes (300 seconds)

  if (signError) {
    console.error(`[visitReportService.generateSignedUrlForReport] Error generating signed URL for ${report.file_path}:`, JSON.stringify(signError, null, 2));
    throw signError;
  }

  if (!signedUrlData || !signedUrlData.signedUrl) {
    console.error(`[visitReportService.generateSignedUrlForReport] Failed to get signedUrl from Supabase response for ${report.file_path}.`);
    throw new Error('Failed to generate signed URL.');
  }

  console.log(`[visitReportService.generateSignedUrlForReport] Signed URL generated for ${report.file_path}`);
  return { signedUrl: signedUrlData.signedUrl };
};