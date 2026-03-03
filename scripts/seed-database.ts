import { createClient } from "@/lib/supabase/client";

/**
 * Seed database with test users and sample data
 * Run: npx ts-node scripts/seed-database.ts
 */

const adminEmail = "doctor@dalilalucena.com";
const adminPassword = "TestPassword123!";

const patients = [
  {
    email: "patient1@example.com",
    password: "TestPassword123!",
    full_name: "Maria Silva",
    cpf: "123.456.789-00",
    phone: "(83) 99999-1111",
  },
  {
    email: "patient2@example.com",
    password: "TestPassword123!",
    full_name: "João Santos",
    cpf: "987.654.321-00",
    phone: "(83) 99999-2222",
  },
  {
    email: "patient3@example.com",
    password: "TestPassword123!",
    full_name: "Ana Costa",
    cpf: "456.789.123-00",
    phone: "(83) 99999-3333",
  },
];

async function seedDatabase() {
  const supabase = createClient();

  console.log("🌱 Starting database seeding...\n");

  try {
    // Create admin user
    console.log("👨‍⚕️ Creating admin user...");
    const { data: adminData, error: adminError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
    });

    if (adminError) {
      console.error("❌ Admin creation failed:", adminError.message);
    } else {
      console.log("✅ Admin created:", adminEmail);

      // Create admin profile
      const { error: adminProfileError } = await supabase
        .from("profiles")
        .insert({
          id: adminData.user?.id,
          role: "admin",
          full_name: "Dra. Dalila Lucena",
          cpf: "000.000.000-00",
          phone: "(83) 98888-0000",
        });

      if (adminProfileError) {
        console.error("❌ Admin profile creation failed:", adminProfileError.message);
      } else {
        console.log("✅ Admin profile created\n");
      }
    }

    // Create patient users
    for (const patient of patients) {
      console.log(`👤 Creating patient: ${patient.full_name}...`);

      const { data: patientData, error: patientError } = await supabase.auth.signUp({
        email: patient.email,
        password: patient.password,
      });

      if (patientError) {
        console.error(`❌ Patient creation failed: ${patientError.message}`);
        continue;
      }

      // Create patient profile
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: patientData.user?.id,
          role: "patient",
          full_name: patient.full_name,
          cpf: patient.cpf,
          phone: patient.phone,
        });

      if (profileError) {
        console.error(`❌ Profile creation failed: ${profileError.message}`);
        continue;
      }

      // Create patient record
      const { error: patientRecordError } = await supabase
        .from("patients")
        .insert({
          id: patientData.user?.id,
          address: {
            street: "Rua Exemplo",
            number: "123",
            city: "João Pessoa",
            state: "PB",
            zip: "58000-000",
          },
          emergency_contact: {
            name: "Contato de Emergência",
            phone: "(83) 9999-9999",
          },
          insurance_info: {
            provider: "Unimed",
            policy: "123456789",
          },
          status: "active",
        });

      if (patientRecordError) {
        console.error(`❌ Patient record creation failed: ${patientRecordError.message}`);
        continue;
      }

      console.log(`✅ Patient created: ${patient.email}\n`);

      // Create sample anamnesis for the patient
      if (patientData.user?.id && adminData.user?.id) {
        const { error: anamnesisError } = await supabase
          .from("anamnesis")
          .insert({
            patient_id: patientData.user.id,
            created_by: adminData.user.id,
            chief_complaint: "Dificuldade em perder peso",
            history_present_illness: "Paciente relata ganho de peso nos últimos 2 anos apesar de dieta.",
            past_medical_history: ["Hipertensão"],
            surgeries: [],
            medications: ["Losartana 50mg"],
            allergies: ["Penicilina"],
            family_history: "Mãe com diabetes, pai com hipertensão",
            smoking_status: "never",
            alcohol_use: "Moderado",
            exercise_frequency: "2 vezes por semana",
            diet_pattern: "Misto, com preferência por alimentos processados",
            review_of_systems: {
              cardiovascular: "Sem queixas",
              respiratory: "Sem queixas",
              gastrointestinal: "Ligeiro desconforto abdominal",
            },
            hormonal_history: {
              menstrual_cycle: "Regular",
              menopause_status: "Pré-menopausa",
            },
            obesity_metrics: {
              bmi: 28.5,
              weight_goal: "75kg",
            },
            performance_goals: {
              objective: "Melhorar resistência física",
            },
          });

        if (anamnesisError) {
          console.error(`❌ Anamnesis creation failed: ${anamnesisError.message}`);
        } else {
          console.log(`✅ Sample anamnesis created for ${patient.full_name}`);
        }
      }

      // Create sample bioimpedance record
      if (patientData.user?.id && adminData.user?.id) {
        const { error: bioError } = await supabase
          .from("bioimpedance_records")
          .insert({
            patient_id: patientData.user.id,
            recorded_by: adminData.user.id,
            weight: 85.5,
            height: 167,
            bmi: 30.7,
            body_fat_percentage: 35.2,
            muscle_mass: 28.5,
            bone_mass: 3.2,
            visceral_fat: 12,
            water_percentage: 52.5,
            basal_metabolic_rate: 1680,
            metabolic_age: 35,
            segmental_analysis: {
              left_arm: "35% gordura",
              right_arm: "34.8% gordura",
              trunk: "38.5% gordura",
              left_leg: "32.5% gordura",
              right_leg: "32.8% gordura",
            },
            notes: "Paciente apresenta aumento significativo de gordura visceral.",
            measurement_date: new Date().toISOString().split("T")[0],
          });

        if (bioError) {
          console.error(`❌ Bioimpedance creation failed: ${bioError.message}`);
        } else {
          console.log(`✅ Sample bioimpedance record created for ${patient.full_name}`);
        }
      }

      // Create sample prescriptions
      if (patientData.user?.id && adminData.user?.id) {
        // Medication prescription
        const { error: medicationError } = await supabase
          .from("prescriptions")
          .insert({
            patient_id: patientData.user.id,
            prescribed_by: adminData.user.id,
            type: "medication",
            title: "Suplementação para Performance",
            description: "Vitaminas e minerais para otimizar metabolismo",
            medication_details: {
              drug: "Polivitamínico",
              dosage: "1 cápsula",
              frequency: "Uma vez ao dia",
              duration: "3 meses",
              instructions: "Tomar com café da manhã",
            },
            status: "active",
            start_date: new Date().toISOString().split("T")[0],
            end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          });

        if (medicationError) {
          console.error(`❌ Medication prescription failed: ${medicationError.message}`);
        } else {
          console.log(`✅ Sample medication prescription created`);
        }

        // Diet prescription
        const { error: dietError } = await supabase
          .from("prescriptions")
          .insert({
            patient_id: patientData.user.id,
            prescribed_by: adminData.user.id,
            type: "diet",
            title: "Dieta para Redução de Peso",
            description: "Plano nutricional personalizado",
            diet_details: {
              meal_plan: "5 refeições diárias com proteína em cada uma",
              calories: 1800,
              protein: 150,
              carbs: 180,
              fat: 60,
              restrictions: "Sem açúcares refinados, reduzir sódio",
            },
            status: "active",
            start_date: new Date().toISOString().split("T")[0],
            end_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          });

        if (dietError) {
          console.error(`❌ Diet prescription failed: ${dietError.message}`);
        } else {
          console.log(`✅ Sample diet prescription created`);
        }

        // Workout prescription
        const { error: workoutError } = await supabase
          .from("prescriptions")
          .insert({
            patient_id: patientData.user.id,
            prescribed_by: adminData.user.id,
            type: "workout",
            title: "Programa de Treinamento",
            description: "Rotina personalizada de treinamento",
            workout_details: {
              routine: "3 dias musculação, 2 dias cardio",
              sessions_per_week: 5,
              duration_minutes: 60,
              intensity: "Moderada a Alta",
              notes: "Focar em treinos que aumentam metabolismo",
            },
            status: "active",
            start_date: new Date().toISOString().split("T")[0],
            end_date: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          });

        if (workoutError) {
          console.error(`❌ Workout prescription failed: ${workoutError.message}`);
        } else {
          console.log(`✅ Sample workout prescription created\n`);
        }
      }
    }

    console.log("✨ Database seeding completed successfully!");
    console.log("\n📝 Test Credentials:");
    console.log(`Admin: ${adminEmail} / ${adminPassword}`);
    console.log("Patients:");
    patients.forEach((p) => {
      console.log(`  - ${p.email} / ${p.password}`);
    });
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}

// Run the seed function
seedDatabase();
