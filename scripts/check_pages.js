import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cfwwcxqpyxktikizjjxx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3djeHFweXhrdGlraXpqanh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNDUyOTcsImV4cCI6MjA2MjYyMTI5N30.YUD6Uwxyd38xXs7R60UC-199FE52VYkqOZSXHtrBiH0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    const { data: doctors, error } = await supabase.from('doctors').select('id, name, title, education, experience, translations');
    if (error) {
        console.error('Error doctors:', error);
        return;
    }
    const withDetails = doctors.filter(d => (d.education && d.education.trim()) || (d.experience && d.experience.trim()));
    console.log(`Found ${withDetails.length} doctors with education/experience:`);
    console.log(JSON.stringify(withDetails.slice(0, 5), null, 2));
}

checkData();
