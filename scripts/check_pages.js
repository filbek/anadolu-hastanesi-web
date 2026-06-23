import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cfwwcxqpyxktikizjjxx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3djeHFweXhrdGlraXpqanh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNDUyOTcsImV4cCI6MjA2MjYyMTI5N30.YUD6Uwxyd38xXs7R60UC-199FE52VYkqOZSXHtrBiH0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    const { data: articles, error } = await supabase.from('health_articles').select('*').eq('id', 9);
    if (error) {
        console.error('Error articles:', error);
        return;
    }
    console.log(JSON.stringify(articles, null, 2));
}

checkData();
