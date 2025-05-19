const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kjcrrdoxkyiexjmyrdqp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqY3JyZG94a3lpZXhqbXlyZHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMzczODEsImV4cCI6MjA1OTgxMzM4MX0.0WE_KlJ-QASF1GbEkkqB2qDuR6a4v-rDLwuIKJPMz0Q';
;

const supabase = createClient(supabaseUrl, supabaseKey);
module.exports = {supabase};