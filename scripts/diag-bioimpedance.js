const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error('Configure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
}

const supabase = createClient(url, serviceKey);

async function diag() {
  // 1. Check if table exists
  const { data, error } = await supabase.from('bioimpedance_exams').select('id, patient_id, parser_status').limit(3);
  console.log('=== bioimpedance_exams SELECT ===');
  console.log('data:', JSON.stringify(data, null, 2));
  console.log('error:', error);

  // 2. Check profiles 
  const { data: profiles, error: profErr } = await supabase.from('profiles').select('id, role, full_name').limit(5);
  console.log('\n=== profiles ===');
  console.log('data:', JSON.stringify(profiles, null, 2));
  console.log('error:', profErr);

  // 3. Check patients
  const { data: patients, error: patErr } = await supabase.from('patients').select('id, user_id').limit(5);
  console.log('\n=== patients ===');
  console.log('data:', JSON.stringify(patients, null, 2));
  console.log('error:', patErr);

  // 4. Try a test insert (will rollback)
  const testPatientId = patients?.[0]?.id;
  const testUserId = profiles?.[0]?.id;
  if (testPatientId && testUserId) {
    console.log('\n=== TEST INSERT ===');
    console.log('patient_id:', testPatientId, 'uploaded_by:', testUserId);
    const { data: ins, error: insErr } = await supabase
      .from('bioimpedance_exams')
      .insert({
        patient_id: testPatientId,
        uploaded_by: testUserId,
        pdf_path: 'test/test.pdf',
        parsed_data: {},
        parser_status: 'pending',
      })
      .select('id')
      .single();
    console.log('insert result:', ins);
    console.log('insert error:', insErr);

    // Cleanup
    if (ins?.id) {
      await supabase.from('bioimpedance_exams').delete().eq('id', ins.id);
      console.log('cleaned up test row');
    }
  }

  // 5. Check if is_admin function exists
  const { data: funcData, error: funcErr } = await supabase.rpc('is_admin');
  console.log('\n=== is_admin() ===');
  console.log('result:', funcData, 'error:', funcErr?.message);
}

diag().catch(console.error);
