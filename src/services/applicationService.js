// src/services/applicationService.js
const supabase = require('../config/db');

async function findUnassignedApplicantsViaRpc() {
    console.log("Attempting to call RPC: get_unassigned_teacher_applications");
    const { data, error, status, statusText } = await supabase.rpc('get_unassigned_teacher_applications');

    if (error) {
        console.error('Supabase RPC error object:', JSON.stringify(error, null, 2));
        console.error(`Supabase RPC error status: ${status}, statusText: ${statusText}`);
        throw new Error(error.message || `RPC failed with status ${status}`);
    }

    console.log("Data received from RPC 'get_unassigned_teacher_applications':", JSON.stringify(data, null, 2));

    // Check if data is null or not an array before trying to map
    if (!data || !Array.isArray(data)) {
        console.warn("RPC 'get_unassigned_teacher_applications' did not return a valid array. Returning empty array.");
        return []; // Return an empty array if data is not as expected
    }

    if (data.length === 0) {
        console.log("RPC 'get_unassigned_teacher_applications' returned an empty array. No unassigned applicants found.");
        return [];
    }

    // Now we map, but we should also be defensive inside the map
    return data.map((item, index) => {
        // Add a check for item itself, and for its properties
        if (!item) {
            console.warn(`Item at index ${index} in RPC data is null or undefined. Skipping.`);
            return null; // Or some default object, or filter it out later
        }

        // Log the item structure if you're still unsure
        // console.log(`Processing item at index ${index}:`, JSON.stringify(item, null, 2));

        // Check if critical properties exist before accessing them
        const teacherId = item.teacher_id; // Column names from RPC must match!
        const applicationId = item.application_id;
        const fullName = item["Full_Name"] || item.full_name; // Check for variations if unsure
        const avatarPath = item.avatar || item.pic_path;
        const emailIdentifier = item.identifier || item.email;

        if (teacherId === undefined || teacherId === null) { // Check for undefined or null explicitly
            console.warn(`Item at index ${index} is missing 'teacher_id'. Item:`, JSON.stringify(item, null, 2));
            // Decide how to handle this: return null, a default, or throw a more specific error
            // For now, let's return a partially formed object or null, then filter out nulls
            return null;
        }

        return {
            application_id: applicationId,
            id: teacherId,
            name: fullName || 'N/A', // Provide default if name is missing
            avatar: avatarPath || `https://via.placeholder.com/60/A0D2DB/3A6B7E?Text=${fullName ? fullName.substring(0, 2).toUpperCase() : 'NA'}`,
            identifier: emailIdentifier || 'N/A',
        };
    }).filter(mappedItem => mappedItem !== null); // Filter out any items that were problematic
}

exports.getApplicantsToAssign = findUnassignedApplicantsViaRpc;