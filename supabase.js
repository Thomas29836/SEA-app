const supabaseUrl = 'https://sumuxiqjpctmplgbbxom.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1bXV4aXFqcGN0bXBsZ2JieG9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzODI5MTIsImV4cCI6MjA2Njk1ODkxMn0.cpafK-cveQ_NuTNNR6-2KmzpJlwJSwb5BFyEWSVndLA';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
window.supabase = supabaseClient;