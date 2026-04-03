-- Initial Schema for Dra. Dalila Lucena Medical Platform
-- Supabase PostgreSQL

-- PROFILES (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'patient')),
  full_name TEXT NOT NULL,
  cpf TEXT UNIQUE,
  phone TEXT,
  birth_date DATE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PATIENTS
CREATE TABLE patients (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  address JSONB,
  emergency_contact JSONB,
  insurance_info JSONB,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ANAMNESIS
CREATE TABLE anamnesis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  chief_complaint TEXT,
  history_present_illness TEXT,
  past_medical_history TEXT[],
  surgeries TEXT[],
  medications TEXT[],
  allergies TEXT[],
  family_history TEXT,
  smoking_status TEXT CHECK (smoking_status IN ('never', 'former', 'current')),
  alcohol_use TEXT,
  exercise_frequency TEXT,
  diet_pattern TEXT,
  review_of_systems JSONB,
  hormonal_history JSONB,
  obesity_metrics JSONB,
  performance_goals JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BIOIMPEDANCE RECORDS
CREATE TABLE bioimpedance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  recorded_by UUID NOT NULL REFERENCES profiles(id),
  weight DECIMAL(5,2) NOT NULL,
  height DECIMAL(5,2),
  bmi DECIMAL(4,2),
  body_fat_percentage DECIMAL(4,2),
  muscle_mass DECIMAL(5,2),
  bone_mass DECIMAL(4,2),
  visceral_fat INTEGER,
  water_percentage DECIMAL(4,2),
  basal_metabolic_rate INTEGER,
  metabolic_age INTEGER,
  segmental_analysis JSONB,
  notes TEXT,
  measurement_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRESCRIPTIONS
CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  prescribed_by UUID NOT NULL REFERENCES profiles(id),
  type TEXT NOT NULL CHECK (type IN ('medication', 'diet', 'workout', 'supplement')),
  title TEXT NOT NULL,
  description TEXT,
  medication_details JSONB,
  diet_details JSONB,
  workout_details JSONB,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DOCUMENTS
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  type TEXT NOT NULL CHECK (type IN ('exam', 'report', 'prescription', 'image', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  parsed_data JSONB,
  exam_date DATE,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SERVICES
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  performed_by UUID NOT NULL REFERENCES profiles(id),
  type TEXT NOT NULL CHECK (type IN ('consultation', 'procedure', 'follow_up', 'implant')),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT CHECK (location IN ('joao_pessoa', 'recife')),
  duration_minutes INTEGER,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  scheduled_date TIMESTAMPTZ NOT NULL,
  completed_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PATIENT HISTORY (audit trail)
CREATE TABLE patient_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  performed_by UUID NOT NULL REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  changes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_anamnesis_patient ON anamnesis(patient_id);
CREATE INDEX idx_bioimpedance_patient ON bioimpedance_records(patient_id);
CREATE INDEX idx_bioimpedance_date ON bioimpedance_records(measurement_date);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);
CREATE INDEX idx_documents_patient ON documents(patient_id);
CREATE INDEX idx_services_patient ON services(patient_id);
CREATE INDEX idx_services_date ON services(scheduled_date);
CREATE INDEX idx_history_patient ON patient_history(patient_id);

-- UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_anamnesis_updated_at BEFORE UPDATE ON anamnesis
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
