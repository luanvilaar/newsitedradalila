export type UserRole = "admin" | "patient";

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  cpf: string | null;
  phone: string | null;
  birth_date: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    city: string;
    state: string;
    zip: string;
  } | null;
  emergency_contact: {
    name: string;
    phone: string;
    relationship: string;
  } | null;
  insurance_info: {
    provider: string;
    plan: string;
    number: string;
  } | null;
  status: "active" | "inactive" | "archived";
  notes: string | null;
  weight: number | null;
  height: number | null;
  bmi: number | null;
  body_fat_percentage: number | null;
  muscle_mass: number | null;
  bone_mass: number | null;
  visceral_fat: number | null;
  water_percentage: number | null;
  basal_metabolic_rate: number | null;
  metabolic_age: number | null;
  bioimpedance_updated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Anamnesis {
  id: string;
  patient_id: string;
  created_by: string;
  chief_complaint: string | null;
  history_present_illness: string | null;
  past_medical_history: string[];
  surgeries: string[];
  medications: string[];
  allergies: string[];
  family_history: string | null;
  smoking_status: "never" | "former" | "current" | null;
  alcohol_use: string | null;
  exercise_frequency: string | null;
  diet_pattern: string | null;
  review_of_systems: Record<string, unknown> | null;
  hormonal_history: Record<string, unknown> | null;
  obesity_metrics: Record<string, unknown> | null;
  performance_goals: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface BioimpedanceRecord {
  id: string;
  patient_id: string;
  recorded_by: string;
  weight: number;
  height: number | null;
  bmi: number | null;
  body_fat_percentage: number | null;
  muscle_mass: number | null;
  bone_mass: number | null;
  visceral_fat: number | null;
  water_percentage: number | null;
  basal_metabolic_rate: number | null;
  metabolic_age: number | null;
  segmental_analysis: Record<string, unknown> | null;
  notes: string | null;
  measurement_date: string;
  created_at: string;
}

export interface BioimpedanceExam {
  id: string;
  patient_id: string;
  uploaded_by: string;
  bioimpedance_record_id: string | null;
  pdf_path: string;
  parsed_data: Record<string, unknown> | null;
  parser_status: "pending" | "success" | "empty" | "failed";
  parser_error: string | null;
  created_at: string;
}

export type PrescriptionType = "medication" | "diet" | "workout" | "supplement";

export interface Prescription {
  id: string;
  patient_id: string;
  prescribed_by: string;
  type: PrescriptionType;
  title: string;
  description: string | null;
  medication_details: {
    drug: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  } | null;
  diet_details: {
    meal_plan: Record<string, unknown>[];
    calories: number;
    macros: { protein: number; carbs: number; fat: number };
    restrictions: string[];
    notes: string;
  } | null;
  workout_details: {
    routine: Record<string, unknown>[];
    frequency: string;
    duration: string;
    intensity: string;
  } | null;
  status: "active" | "completed" | "cancelled";
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  patient_id: string;
  uploaded_by: string;
  type: "exam" | "report" | "prescription" | "image" | "other";
  title: string;
  description: string | null;
  file_path: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  parsed_data: Record<string, unknown> | null;
  exam_date: string | null;
  tags: string[];
  created_at: string;
}

export type ServiceStatus =
  | "scheduled"
  | "completed"
  | "cancelled"
  | "no_show";

export interface Service {
  id: string;
  patient_id: string;
  performed_by: string;
  type: "consultation" | "procedure" | "follow_up" | "implant";
  title: string;
  description: string | null;
  location: "joao_pessoa" | "recife" | null;
  duration_minutes: number | null;
  status: ServiceStatus;
  scheduled_date: string;
  completed_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PatientHistory {
  id: string;
  patient_id: string;
  performed_by: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  changes: Record<string, unknown> | null;
  created_at: string;
}

export type FinancialRecordType = "invoice" | "cashflow";
export type TransactionType = "entry" | "exit";
export type InvoiceStatus = "pending" | "issued" | "cancelled";

export interface FinancialRecord {
  id: string;
  created_by: string;
  record_type: FinancialRecordType;
  transaction_type: TransactionType | null;
  category: string | null;
  description: string | null;
  amount: number;
  occurred_at: string;
  invoice_number: string | null;
  invoice_status: InvoiceStatus | null;
  patient_name: string | null;
  patient_document: string | null;
  created_at: string;
  updated_at: string;
}
