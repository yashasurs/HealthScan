"""
Seed script to populate the database with dummy data for testing.
This creates users (patients), doctors, and families with sample data.

Usage:
    python seed_data.py

WARNING: This will add data to your database. Use only in development!
"""

from app.database import SessionLocal, Base, engine
from app.models import User, Family, UserRole
from app.utils import hash
from datetime import datetime, timedelta


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
        print(f"   • Total Users: {len(patients) + len(doctors) + 1}")
        print("\n🔐 Login Credentials:")
        print("   Password for all users: password123")
        print("\n👥 Family Admins:")
        print("   • john_smith (Smith Family)")
        print("   • mike_johnson (Johnson Family)")
        print("   • robert_williams (Williams Family)")
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
