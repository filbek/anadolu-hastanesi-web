import { supabase } from './src/lib/supabase';

async function debugData() {
  console.log('--- DEBUG START ---');
  const { data: hospitals, error: hError } = await supabase.from('hospitals').select('*');
  console.log('Hospitals:', hospitals, 'Error:', hError);

  const { data: depts, error: dError } = await supabase.from('departments').select('*');
  console.log('Departments:', depts, 'Error:', dError);
  console.log('--- DEBUG END ---');
}

debugData();
