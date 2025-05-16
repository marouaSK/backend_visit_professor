const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kjcrrdoxkyiexjmyrdqp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqY3JyZG94a3lpZXhqbXlyZHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMzczODEsImV4cCI6MjA1OTgxMzM4MX0.0WE_KlJ-QASF1GbEkkqB2qDuR6a4v-rDLwuIKJPMz0Q';
;

console.log("--- db.js --- SUPABASE_URL:", supabaseUrl ? "Loaded" : "MISSING OR EMPTY");
console.log("--- db.js --- SUPABASE_ANON_KEY:", supabaseKey ? "Loaded" : "MISSING OR EMPTY");

if (!supabaseUrl || !supabaseKey) {
    console.error("FATAL: Supabase URL or Key is missing in db.js. Check environment variables and .env loading.");
    // To make the error obvious, we can export null or throw
    // module.exports = null; // or throw new Error("Supabase config missing in db.js");
}

const supabase = createClient(supabaseUrl, supabaseKey);
console.log("--- db.js --- Supabase client CREATED in db.js. Type:", typeof supabase, supabase ? "Instance OK" : "Instance FAILED");

module.exports = supabase;