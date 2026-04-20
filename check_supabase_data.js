import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cfwwcxqpyxktikizjjxx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3djeHFweXhrdGlraXpqanh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNDUyOTcsImV4cCI6MjA2MjYyMTI5N30.YUD6Uwxyd38xXs7R60UC-199FE52VYkqOZSXHtrBiH0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log('--- Supabase Diagnostic ---');
    const { data, error } = await supabase.from('hospitals').select('*');

    if (error) {
        console.error('Error fetching hospitals:', error);
    } else {
        console.log(`Found ${data.length} hospitals:`);
        console.log(JSON.stringify(data, null, 2));
    }
}

checkData();
