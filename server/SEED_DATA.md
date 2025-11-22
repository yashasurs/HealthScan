# Dummy Data - Seed Script Documentation

## Overview
The `seed_data.py` script populates the database with dummy data for testing the HealthScan application, including users, doctors, families, and their relationships.

## Usage

```bash
cd /media/D/programming/projects/healthscan/server
python seed_data.py
```

## What Gets Created

### 🔐 Login Credentials
**Password for ALL users: `password123`**

### 👥 Families (5 Total)

#### 1. Smith Family (4 members)
- **john_smith** (Family Admin) - A+, Penicillin allergy
  - Email: john.smith@example.com
  - Phone: 1234567890
- **jane_smith** - A+
  - Email: jane.smith@example.com
  - Phone: 1234567891
- **jimmy_smith** - O+, Peanuts allergy
  - Email: jimmy.smith@example.com
  - Phone: 1234567892
- **julia_smith** - A-
  - Email: julia.smith@example.com
  - Phone: 1234567893

#### 2. Johnson Family (3 members)
- **mike_johnson** (Family Admin) - B+
  - Email: mike.johnson@example.com
  - Phone: 2234567890
- **mary_johnson** - B+, Lactose allergy
  - Email: mary.johnson@example.com
  - Phone: 2234567891
- **mark_johnson** - O-
  - Email: mark.johnson@example.com
  - Phone: 2234567892

#### 3. Williams Family (2 members)
- **robert_williams** (Family Admin) - AB+, Dust allergy
  - Email: robert.williams@example.com
  - Phone: 3234567890
- **lisa_williams** - AB-
  - Email: lisa.williams@example.com
  - Phone: 3234567891

#### 4. Brown Family (Empty)
- Created but no members yet

#### 5. Davis Family (Empty)
- Created but no members yet

### 🏠 Patients Without Families (2)
- **alice_brown** - O+
  - Email: alice.brown@example.com
  - Phone: 4234567890
- **bob_davis** - A+, Shellfish allergy
  - Email: bob.davis@example.com
  - Phone: 5234567890

### 👨‍⚕️ Doctors (5)

1. **dr_sarah_wilson** - Cardiology
   - Email: dr.sarah.wilson@hospital.com
   - Phone: 9001234567
   - Hospital: City General Hospital
   - Experience: 10 years
   - License: MD123456
   - Verified: ✅ (95% confidence)

2. **dr_james_miller** - Pediatrics
   - Email: dr.james.miller@hospital.com
   - Phone: 9001234568
   - Hospital: Children's Hospital
   - Experience: 8 years
   - License: MD234567
   - Verified: ✅ (92% confidence)

3. **dr_emily_taylor** - Neurology
   - Email: dr.emily.taylor@hospital.com
   - Phone: 9001234569
   - Hospital: Neuro Care Center
   - Experience: 15 years
   - License: MD345678
   - Verified: ✅ (98% confidence)

4. **dr_david_anderson** - Orthopedics
   - Email: dr.david.anderson@hospital.com
   - Phone: 9001234570
   - Hospital: Sports Medicine Clinic
   - Experience: 12 years
   - License: MD456789
   - Verified: ✅ (90% confidence)

5. **dr_maria_garcia** - General Medicine
   - Email: dr.maria.garcia@hospital.com
   - Phone: 9001234571
   - Hospital: Community Health Center
   - Experience: 6 years
   - License: MD567890
   - Verified: ✅ (88% confidence)

### 👑 Admin (1)
- **admin** - System Administrator
  - Email: admin@healthscan.com
  - Phone: 9999999999

## Summary Statistics

| Category | Count |
|----------|-------|
| Total Users | 17 |
| Patients | 11 |
| ↳ In Families | 9 |
| ↳ Without Families | 2 |
| Doctors | 5 |
| Admins | 1 |
| Families | 5 |
| ↳ With Members | 3 |
| ↳ Empty | 2 |
| Family Admins | 3 |

## Testing Scenarios

### 1. Family Admin Access
**Login as:** `john_smith` / `password123`
- Can view all Smith family members' profiles
- Can edit all Smith family members' records
- Can manage family settings

### 2. Regular Family Member
**Login as:** `jane_smith` / `password123`
- Can only view/edit own records
- Cannot access other family members' records
- Can see family member list

### 3. Patient Without Family
**Login as:** `alice_brown` / `password123`
- Standard patient access
- Can create/join a family

### 4. Doctor Access
**Login as:** `dr_sarah_wilson` / `password123`
- Can view assigned patients
- Can create records for patients
- Has doctor-specific dashboard

### 5. Admin Access
**Login as:** `admin` / `password123`
- Full system access
- Can manage all users
- Can view system statistics
- Can assign roles

## Features to Test

### Family Features
- [ ] Family admin can view all member records
- [ ] Family admin can edit all member records
- [ ] Regular members cannot access other members' records
- [ ] Add new member to family
- [ ] Remove member from family
- [ ] Transfer family admin rights
- [ ] User can only belong to one family
- [ ] Prevent removing last family admin

### Doctor Features
- [ ] Doctor can view assigned patients
- [ ] Doctor can create records for patients
- [ ] Doctor dashboard shows patient list
- [ ] Assign doctor to patient

### Admin Features
- [ ] View all users
- [ ] Create new users with any role
- [ ] Update user roles
- [ ] Delete users
- [ ] View system statistics

## Re-running the Script

If you need to add more data, the script will check if users exist and ask for confirmation:

```
⚠️  Database already has 17 users.
Do you want to continue adding more data? (y/n):
```

- Type `y` to add more data
- Type `n` to cancel

## Resetting the Database

To start fresh:

```bash
# Delete the database file
rm sql_app.db

# Run the seed script again
python seed_data.py
```

## Notes

- All passwords are `password123` for easy testing
- Phone numbers follow pattern: family digit + sequential numbers
- Blood groups vary across families for diversity
- Some patients have allergies for testing medical records
- Aadhar numbers are dummy 12-digit values
- All doctors are pre-verified with high confidence scores
- Empty families (Brown, Davis) allow testing family creation

## Example API Calls

### Login as Family Admin
```bash
curl -X POST http://localhost:8000/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=john_smith&password=password123"
```

### Login as Doctor
```bash
curl -X POST http://localhost:8000/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=dr_sarah_wilson&password=password123"
```

### Login as Admin
```bash
curl -X POST http://localhost:8000/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=password123"
```

## Customization

To customize the seed data, edit `seed_data.py`:

- **Add more families**: Add to `family_names` list
- **Add more patients**: Add to family member lists
- **Add more doctors**: Add to `doctors_data` list
- **Change password**: Modify the `password` variable
- **Adjust relationships**: Modify doctor-patient assignments

---

**Created:** November 22, 2025
**Script:** `seed_data.py`
**Status:** ✅ Ready to use
