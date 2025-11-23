"""
Seed script to populate the database with dummy data for testing.
This creates users (patients), doctors, and families with sample data.

Usage:
    python seed_data.py

WARNING: This will add data to your database. Use only in development!
"""

from app.database import SessionLocal, Base, engine
from app.models import User, Family, UserRole, Record, Collection
from passlib.context import CryptContext
from datetime import datetime, timedelta
import uuid

# Hash function
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash(password: str):
    return pwd_context.hash(password)


def create_dummy_data():
    """Create dummy users, doctors, and families for testing"""
    # First, ensure all tables exist
    print("🔧 Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created/verified")
    
    db = SessionLocal()
    
    try:
        print("\n🌱 Starting database seeding...")
        print("=" * 60)
        
        # Check if data already exists
        existing_users = db.query(User).count()
        if existing_users > 0:
            print(f"⚠️  Database already has {existing_users} users.")
            response = input("Do you want to continue adding more data? (y/n): ")
            if response.lower() != 'y':
                print("❌ Seeding cancelled.")
                return
        
        # Common password for all users
        password = "password123"
        hashed_password = hash(password)
        
        # ============================================
        # CREATE FAMILIES
        # ============================================
        print("\n📦 Creating Families...")
        
        families = []
        family_names = [
            "Smith Family",
            "Johnson Family",
            "Williams Family",
            "Brown Family",
            "Davis Family"
        ]
        
        for name in family_names:
            family = Family(name=name)
            db.add(family)
            families.append(family)
        
        db.flush()  # Get family IDs
        print(f"✅ Created {len(families)} families")
        
        # ============================================
        # CREATE PATIENTS (FAMILY MEMBERS)
        # ============================================
        print("\n👥 Creating Patients (Family Members)...")
        
        patients = []
        
        # Smith Family (4 members)
        smith_members = [
            {
                "username": "john_smith",
                "email": "john.smith@example.com",
                "first_name": "John",
                "last_name": "Smith",
                "phone_number": "1234567890",
                "blood_group": "A+",
                "is_family_admin": True,
                "allergies": "Penicillin"
            },
            {
                "username": "jane_smith",
                "email": "jane.smith@example.com",
                "first_name": "Jane",
                "last_name": "Smith",
                "phone_number": "1234567891",
                "blood_group": "A+",
                "is_family_admin": False,
                "allergies": None
            },
            {
                "username": "jimmy_smith",
                "email": "jimmy.smith@example.com",
                "first_name": "Jimmy",
                "last_name": "Smith",
                "phone_number": "1234567892",
                "blood_group": "O+",
                "is_family_admin": False,
                "allergies": "Peanuts"
            },
            {
                "username": "julia_smith",
                "email": "julia.smith@example.com",
                "first_name": "Julia",
                "last_name": "Smith",
                "phone_number": "1234567893",
                "blood_group": "A-",
                "is_family_admin": False,
                "allergies": None
            }
        ]
        
        for member_data in smith_members:
            patient = User(
                **member_data,
                password=hashed_password,
                role=UserRole.PATIENT,
                family_id=families[0].id,
                aadhar="123456789012"
            )
            db.add(patient)
            patients.append(patient)
        
        # Johnson Family (3 members)
        johnson_members = [
            {
                "username": "mike_johnson",
                "email": "mike.johnson@example.com",
                "first_name": "Mike",
                "last_name": "Johnson",
                "phone_number": "2234567890",
                "blood_group": "B+",
                "is_family_admin": True,
                "allergies": None
            },
            {
                "username": "mary_johnson",
                "email": "mary.johnson@example.com",
                "first_name": "Mary",
                "last_name": "Johnson",
                "phone_number": "2234567891",
                "blood_group": "B+",
                "is_family_admin": False,
                "allergies": "Lactose"
            },
            {
                "username": "mark_johnson",
                "email": "mark.johnson@example.com",
                "first_name": "Mark",
                "last_name": "Johnson",
                "phone_number": "2234567892",
                "blood_group": "O-",
                "is_family_admin": False,
                "allergies": None
            }
        ]
        
        for member_data in johnson_members:
            patient = User(
                **member_data,
                password=hashed_password,
                role=UserRole.PATIENT,
                family_id=families[1].id,
                aadhar="234567890123"
            )
            db.add(patient)
            patients.append(patient)
        
        # Williams Family (2 members)
        williams_members = [
            {
                "username": "robert_williams",
                "email": "robert.williams@example.com",
                "first_name": "Robert",
                "last_name": "Williams",
                "phone_number": "3234567890",
                "blood_group": "AB+",
                "is_family_admin": True,
                "allergies": "Dust"
            },
            {
                "username": "lisa_williams",
                "email": "lisa.williams@example.com",
                "first_name": "Lisa",
                "last_name": "Williams",
                "phone_number": "3234567891",
                "blood_group": "AB-",
                "is_family_admin": False,
                "allergies": None
            }
        ]
        
        for member_data in williams_members:
            patient = User(
                **member_data,
                password=hashed_password,
                role=UserRole.PATIENT,
                family_id=families[2].id,
                aadhar="345678901234"
            )
            db.add(patient)
            patients.append(patient)
        
        # Patients without families
        solo_patients = [
            {
                "username": "alice_brown",
                "email": "alice.brown@example.com",
                "first_name": "Alice",
                "last_name": "Brown",
                "phone_number": "4234567890",
                "blood_group": "O+",
                "allergies": None
            },
            {
                "username": "bob_davis",
                "email": "bob.davis@example.com",
                "first_name": "Bob",
                "last_name": "Davis",
                "phone_number": "5234567890",
                "blood_group": "A+",
                "allergies": "Shellfish"
            }
        ]
        
        for patient_data in solo_patients:
            patient = User(
                **patient_data,
                password=hashed_password,
                role=UserRole.PATIENT,
                family_id=None,
                is_family_admin=False,
                aadhar="456789012345"
            )
            db.add(patient)
            patients.append(patient)
        
        print(f"✅ Created {len(patients)} patients")
        
        # ============================================
        # CREATE DOCTORS
        # ============================================
        print("\n👨‍⚕️ Creating Doctors...")
        
        doctors_data = [
            {
                "username": "dr_sarah_wilson",
                "email": "dr.sarah.wilson@hospital.com",
                "first_name": "Sarah",
                "last_name": "Wilson",
                "phone_number": "9001234567",
                "blood_group": "A+",
                "specialization": "Cardiology",
                "medical_license_number": "MD123456",
                "hospital_affiliation": "City General Hospital",
                "years_of_experience": 10,
                "resume_verification_status": True,
                "resume_verification_confidence": 95
            },
            {
                "username": "dr_james_miller",
                "email": "dr.james.miller@hospital.com",
                "first_name": "James",
                "last_name": "Miller",
                "phone_number": "9001234568",
                "blood_group": "B+",
                "specialization": "Pediatrics",
                "medical_license_number": "MD234567",
                "hospital_affiliation": "Children's Hospital",
                "years_of_experience": 8,
                "resume_verification_status": True,
                "resume_verification_confidence": 92
            },
            {
                "username": "dr_emily_taylor",
                "email": "dr.emily.taylor@hospital.com",
                "first_name": "Emily",
                "last_name": "Taylor",
                "phone_number": "9001234569",
                "blood_group": "O+",
                "specialization": "Neurology",
                "medical_license_number": "MD345678",
                "hospital_affiliation": "Neuro Care Center",
                "years_of_experience": 15,
                "resume_verification_status": True,
                "resume_verification_confidence": 98
            },
            {
                "username": "dr_david_anderson",
                "email": "dr.david.anderson@hospital.com",
                "first_name": "David",
                "last_name": "Anderson",
                "phone_number": "9001234570",
                "blood_group": "AB+",
                "specialization": "Orthopedics",
                "medical_license_number": "MD456789",
                "hospital_affiliation": "Sports Medicine Clinic",
                "years_of_experience": 12,
                "resume_verification_status": True,
                "resume_verification_confidence": 90
            },
            {
                "username": "dr_maria_garcia",
                "email": "dr.maria.garcia@hospital.com",
                "first_name": "Maria",
                "last_name": "Garcia",
                "phone_number": "9001234571",
                "blood_group": "A-",
                "specialization": "General Medicine",
                "medical_license_number": "MD567890",
                "hospital_affiliation": "Community Health Center",
                "years_of_experience": 6,
                "resume_verification_status": True,
                "resume_verification_confidence": 88
            }
        ]
        
        doctors = []
        for doctor_data in doctors_data:
            doctor = User(
                **doctor_data,
                password=hashed_password,
                role=UserRole.DOCTOR,
                family_id=None,
                is_family_admin=False
            )
            db.add(doctor)
            doctors.append(doctor)
        
        print(f"✅ Created {len(doctors)} doctors")
        
        # ============================================
        # CREATE ADMIN
        # ============================================
        print("\n👑 Creating Admin...")
        
        admin = User(
            username="admin",
            email="admin@healthscan.com",
            password=hashed_password,
            first_name="System",
            last_name="Administrator",
            phone_number="9999999999",
            blood_group="O+",
            role=UserRole.ADMIN,
            family_id=None,
            is_family_admin=False
        )
        db.add(admin)
        print("✅ Created 1 admin user")
        
        # ============================================
        # ASSIGN DOCTORS TO PATIENTS
        # ============================================
        print("\n🔗 Assigning Doctors to Patients...")
        
        # Assign Dr. Wilson to Smith family
        for i in range(4):
            patients[i].doctor_id = doctors[0].id
        
        # Assign Dr. Miller to Johnson family
        for i in range(4, 7):
            patients[i].doctor_id = doctors[1].id
        
        # Assign Dr. Taylor to Williams family
        for i in range(7, 9):
            patients[i].doctor_id = doctors[2].id
        
        print("✅ Assigned doctors to family members")
        
        # Flush to get user IDs before creating collections
        db.flush()
        
        # ============================================
        # CREATE COLLECTIONS
        # ============================================
        print("\n📁 Creating Collections...")
        
        collections = []
        
        # Collections for John Smith (family admin)
        john_collections = [
            Collection(
                name="Heart Health Records",
                description="Cardiology checkups and treatments",
                user_id=patients[0].id,
                created_by_id=patients[0].id
            ),
            Collection(
                name="Annual Checkups",
                description="Yearly physical examinations",
                user_id=patients[0].id,
                created_by_id=patients[0].id
            )
        ]
        for col in john_collections:
            db.add(col)
            collections.append(col)
        
        # Collections for Jane Smith
        jane_collection = Collection(
            name="Pregnancy Records",
            description="Prenatal and postnatal care",
            user_id=patients[1].id,
            created_by_id=patients[1].id
        )
        db.add(jane_collection)
        collections.append(jane_collection)
        
        # Collections for Jimmy Smith
        jimmy_collection = Collection(
            name="Allergy Reports",
            description="Peanut allergy tests and treatments",
            user_id=patients[2].id,
            created_by_id=patients[2].id
        )
        db.add(jimmy_collection)
        collections.append(jimmy_collection)
        
        # Collections for Mike Johnson (family admin)
        mike_collection = Collection(
            name="Blood Pressure Monitoring",
            description="BP readings and medication records",
            user_id=patients[4].id,
            created_by_id=patients[4].id
        )
        db.add(mike_collection)
        collections.append(mike_collection)
        
        db.flush()  # Get collection IDs
        print(f"✅ Created {len(collections)} collections")
        
        # ============================================
        # CREATE MEDICAL RECORDS
        # ============================================
        print("\n📄 Creating Medical Records...")
        
        records = []
        
        # Records for John Smith
        john_records = [
            Record(
                id=str(uuid.uuid4()),
                filename="Cardiology_Checkup_2024.txt",
                content="""# Cardiology Checkup Report
**Patient:** John Smith
**Date:** November 15, 2024
**Doctor:** Dr. Sarah Wilson

## Vital Signs
- Blood Pressure: 125/82 mmHg
- Heart Rate: 72 bpm
- Temperature: 98.6°F

## Assessment
Patient shows good cardiovascular health. Minor elevation in blood pressure noted.

## Recommendations
- Continue current medication
- Monitor BP weekly
- Follow up in 3 months

## Medications
- Lisinopril 10mg daily
- Aspirin 81mg daily
""",
                file_size=450,
                file_type="text/markdown",
                user_id=patients[0].id,
                collection_id=john_collections[0].id,
                created_by_id=patients[0].id
            ),
            Record(
                id=str(uuid.uuid4()),
                filename="Annual_Physical_2024.txt",
                content="""# Annual Physical Examination
**Patient:** John Smith
**Date:** October 10, 2024
**Doctor:** Dr. Sarah Wilson

## General Health
Overall health status: Good

## Lab Results
- Cholesterol: 185 mg/dL (Normal)
- Blood Sugar: 95 mg/dL (Normal)
- Hemoglobin: 14.5 g/dL (Normal)

## Notes
Patient is in good health. Continue current lifestyle and medications.
""",
                file_size=320,
                file_type="text/markdown",
                user_id=patients[0].id,
                collection_id=john_collections[1].id,
                created_by_id=patients[0].id
            )
        ]
        
        # Records for Jane Smith
        jane_records = [
            Record(
                id=str(uuid.uuid4()),
                filename="Prenatal_Visit_Week_20.txt",
                content="""# Prenatal Checkup - Week 20
**Patient:** Jane Smith
**Date:** November 10, 2024
**Doctor:** Dr. Sarah Wilson

## Ultrasound Results
Baby is developing normally. All measurements within expected range.

## Mother's Health
- Blood Pressure: 118/75 mmHg
- Weight: +12 lbs from pre-pregnancy
- Fetal Heart Rate: 145 bpm

## Next Steps
- Continue prenatal vitamins
- Schedule anatomy scan
- Next visit in 4 weeks
""",
                file_size=380,
                file_type="text/markdown",
                user_id=patients[1].id,
                collection_id=jane_collection.id,
                created_by_id=patients[1].id
            )
        ]
        
        # Records for Jimmy Smith
        jimmy_records = [
            Record(
                id=str(uuid.uuid4()),
                filename="Allergy_Test_Results.txt",
                content="""# Allergy Test Report
**Patient:** Jimmy Smith
**Date:** September 5, 2024
**Doctor:** Dr. James Miller

## Test Results
Confirmed severe peanut allergy (IgE level: 95 kU/L)

## Recommendations
- Strict peanut avoidance
- Carry EpiPen at all times
- Educate family and school
- Follow-up in 6 months

## Emergency Protocol
Administer epinephrine immediately if exposed and symptoms develop.
""",
                file_size=290,
                file_type="text/markdown",
                user_id=patients[2].id,
                collection_id=jimmy_collection.id,
                created_by_id=patients[2].id
            ),
            Record(
                id=str(uuid.uuid4()),
                filename="School_Physical_2024.txt",
                content="""# School Physical Examination
**Patient:** Jimmy Smith
**Date:** August 20, 2024
**Doctor:** Dr. James Miller

## Physical Exam
Height: 4'8", Weight: 68 lbs
Vision: 20/20, Hearing: Normal

## Cleared for Activities
Student is cleared for all school activities with peanut allergy precautions in place.

## Notes
EpiPen on file with school nurse.
""",
                file_size=250,
                file_type="text/markdown",
                user_id=patients[2].id,
                collection_id=None,
                created_by_id=patients[2].id
            )
        ]
        
        # Records for Julia Smith
        julia_records = [
            Record(
                id=str(uuid.uuid4()),
                filename="Dental_Checkup_2024.txt",
                content="""# Dental Examination
**Patient:** Julia Smith
**Date:** November 1, 2024

## Findings
No cavities detected. Mild plaque buildup noted.

## Treatment
Cleaning performed. Fluoride treatment applied.

## Recommendations
- Brush twice daily
- Floss regularly
- Next checkup in 6 months
""",
                file_size=220,
                file_type="text/markdown",
                user_id=patients[3].id,
                collection_id=None,
                created_by_id=patients[3].id
            )
        ]
        
        # Records for Mike Johnson (family admin)
        mike_records = [
            Record(
                id=str(uuid.uuid4()),
                filename="BP_Monitoring_Log.txt",
                content="""# Blood Pressure Monitoring Log
**Patient:** Mike Johnson
**Period:** October 2024

## Weekly Readings
- Week 1: 138/88 mmHg
- Week 2: 135/85 mmHg
- Week 3: 132/84 mmHg
- Week 4: 130/82 mmHg

## Medication
Amlodipine 5mg daily

## Notes
Blood pressure improving with medication. Continue current treatment.
""",
                file_size=310,
                file_type="text/markdown",
                user_id=patients[4].id,
                collection_id=mike_collection.id,
                created_by_id=patients[4].id
            )
        ]
        
        # Records for Mary Johnson
        mary_records = [
            Record(
                id=str(uuid.uuid4()),
                filename="Lactose_Intolerance_Diet_Plan.txt",
                content="""# Lactose Intolerance Management
**Patient:** Mary Johnson
**Date:** October 15, 2024

## Diagnosis
Confirmed lactose intolerance via hydrogen breath test

## Dietary Recommendations
- Avoid milk, cheese, ice cream
- Use lactose-free alternatives
- Consider lactase supplements

## Allowed Foods
- Lactose-free milk
- Hard cheeses (limited lactose)
- Yogurt with active cultures
""",
                file_size=280,
                file_type="text/markdown",
                user_id=patients[5].id,
                collection_id=None,
                created_by_id=patients[5].id
            )
        ]
        
        # Records for Robert Williams (family admin)
        robert_records = [
            Record(
                id=str(uuid.uuid4()),
                filename="Dust_Allergy_Treatment.txt",
                content="""# Allergy Treatment Plan
**Patient:** Robert Williams
**Date:** September 20, 2024
**Doctor:** Dr. Emily Taylor

## Diagnosis
Moderate dust mite allergy

## Treatment
- Antihistamine: Cetirizine 10mg daily
- Nasal spray: Fluticasone
- Environmental controls

## Home Recommendations
- Use allergen-proof bedding
- HEPA air filters
- Regular cleaning
""",
                file_size=300,
                file_type="text/markdown",
                user_id=patients[7].id,
                collection_id=None,
                created_by_id=patients[7].id
            )
        ]
        
        # Records for Alice Brown (no family)
        alice_records = [
            Record(
                id=str(uuid.uuid4()),
                filename="Wellness_Checkup_2024.txt",
                content="""# Wellness Examination
**Patient:** Alice Brown
**Date:** November 5, 2024

## Health Status
Excellent overall health

## Vital Signs
- BP: 115/75 mmHg
- Heart Rate: 68 bpm
- BMI: 22.5 (Normal)

## Recommendations
Continue current healthy lifestyle. No concerns noted.
""",
                file_size=240,
                file_type="text/markdown",
                user_id=patients[9].id,
                collection_id=None,
                created_by_id=patients[9].id
            )
        ]
        
        # Add all records
        all_records = (john_records + jane_records + jimmy_records + julia_records + 
                      mike_records + mary_records + robert_records + alice_records)
        
        for record in all_records:
            db.add(record)
            records.append(record)
        
        print(f"✅ Created {len(records)} medical records")
        
        # ============================================
        # COMMIT ALL CHANGES
        # ============================================
        db.commit()
        
        print("\n" + "=" * 60)
        print("✅ Database seeding completed successfully!")
        print("=" * 60)
        print("\n📊 Summary:")
        print(f"   • Families: {len(families)}")
        print(f"   • Patients: {len(patients)} (9 in families, 2 without)")
        print(f"   • Doctors: {len(doctors)}")
        print(f"   • Admins: 1")
        print(f"   • Collections: {len(collections)}")
        print(f"   • Medical Records: {len(records)}")
        print(f"   • Total Users: {len(patients) + len(doctors) + 1}")
        print("\n🔐 Login Credentials:")
        print("   Password for all users: password123")
        print("\n👥 Family Admins (can view ALL family member records):")
        print("   • john_smith (Smith Family - 4 members, 5 records total)")
        print("   • mike_johnson (Johnson Family - 3 members, 2 records total)")
        print("   • robert_williams (Williams Family - 2 members, 1 record total)")
        print("\n👨‍⚕️ Sample Doctors:")
        print("   • dr_sarah_wilson (Cardiology)")
        print("   • dr_james_miller (Pediatrics)")
        print("   • dr_emily_taylor (Neurology)")
        print("   • dr_david_anderson (Orthopedics)")
        print("   • dr_maria_garcia (General Medicine)")
        print("\n👑 Admin:")
        print("   • admin")
        print("\n💡 Usage:")
        print("   1. Login with any username above and password: password123")
        print("   2. Family admins can view/edit all family member records")
        print("   3. Regular members can only view/edit their own records")
        print("   4. Doctors can view their assigned patients")
        print("   5. Admin can manage all users")
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ Error occurred: {str(e)}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("\n🏥 HealthScan Database Seeding Script")
    print("=" * 60)
    print("This will populate the database with dummy data for testing.")
    print("=" * 60)
    
    try:
        create_dummy_data()
    except KeyboardInterrupt:
        print("\n\n⚠️  Seeding interrupted by user.")
    except Exception as e:
        print(f"\n❌ Fatal error: {str(e)}")
        import traceback
        traceback.print_exc()
