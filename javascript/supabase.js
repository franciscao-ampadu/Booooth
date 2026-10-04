// Supabase connection and functions
const SUPABASE_URL = "https://idnqkipswunwvmxkxesk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkbnFraXBzd3Vud3ZteGt4ZXNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwMjY1NTcsImV4cCI6MjEwNjYwMjU1N30.l3pVMStlU0GzSejXMK-iLuUTiqwB8U_J3lB4mgLVs6E";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);