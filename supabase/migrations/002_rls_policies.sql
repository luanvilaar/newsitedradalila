-- Row Level Security Policies

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE anamnesis ENABLE ROW LEVEL SECURITY;
ALTER TABLE bioimpedance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_history ENABLE ROW LEVEL SECURITY;

-- Helper function to check admin role
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- PROFILES
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (is_admin());
CREATE POLICY "Admins can insert profiles" ON profiles
  FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update profiles" ON profiles
  FOR UPDATE USING (is_admin());

-- PATIENTS
CREATE POLICY "Patients can view own data" ON patients
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can manage patients" ON patients
  FOR ALL USING (is_admin());

-- ANAMNESIS
CREATE POLICY "Patients can view own anamnesis" ON anamnesis
  FOR SELECT USING (patient_id = auth.uid());
CREATE POLICY "Admins can manage anamnesis" ON anamnesis
  FOR ALL USING (is_admin());

-- BIOIMPEDANCE
CREATE POLICY "Patients can view own bioimpedance" ON bioimpedance_records
  FOR SELECT USING (patient_id = auth.uid());
CREATE POLICY "Admins can manage bioimpedance" ON bioimpedance_records
  FOR ALL USING (is_admin());

-- PRESCRIPTIONS
CREATE POLICY "Patients can view own prescriptions" ON prescriptions
  FOR SELECT USING (patient_id = auth.uid());
CREATE POLICY "Admins can manage prescriptions" ON prescriptions
  FOR ALL USING (is_admin());

-- DOCUMENTS
CREATE POLICY "Patients can view own documents" ON documents
  FOR SELECT USING (patient_id = auth.uid());
CREATE POLICY "Admins can manage documents" ON documents
  FOR ALL USING (is_admin());

-- SERVICES
CREATE POLICY "Patients can view own services" ON services
  FOR SELECT USING (patient_id = auth.uid());
CREATE POLICY "Admins can manage services" ON services
  FOR ALL USING (is_admin());

-- PATIENT HISTORY
CREATE POLICY "Patients can view own history" ON patient_history
  FOR SELECT USING (patient_id = auth.uid());
CREATE POLICY "Admins can manage history" ON patient_history
  FOR ALL USING (is_admin());

-- STORAGE
INSERT INTO storage.buckets (id, name, public)
VALUES ('patient-documents', 'patient-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'patient-documents' AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can view own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'patient-documents' AND (
      (storage.foldername(name))[1] = auth.uid()::text OR is_admin()
    )
  );

CREATE POLICY "Admins can delete documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'patient-documents' AND is_admin()
  );
