import sys
import os
import getpass
import re
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app import models, utils
from app.models import UserRole

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_phone(phone):
    """Validate phone number (10 digits)"""
    return phone.isdigit() and len(phone) == 10

def validate_blood_group(blood_group):
    """Validate blood group"""
    valid_groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    return blood_group.upper() in valid_groups

def get_user_input():
    """Get admin user details from command line input"""
    print("=== Create Admin User ===")
    print()
    
    while True:
        email = input("Enter admin email: ").strip()
        if validate_email(email):
            break
        print("Invalid email format. Please try again.")
    
    while True:
        username = input("Enter admin username: ").strip()
        if len(username) >= 3:
            break
        print("Username must be at least 3 characters long.")
    
    while True:
        password = getpass.getpass("Enter admin password: ")
        if len(password) >= 6:
            confirm_password = getpass.getpass("Confirm password: ")
            if password == confirm_password:
                break
            else:
                print("Passwords don't match. Please try again.")
        else:
            print("Password must be at least 6 characters long.")
    
    first_name = input("Enter first name: ").strip()
    while not first_name:
        first_name = input("First name cannot be empty. Enter first name: ").strip()
    
    last_name = input("Enter last name: ").strip()
    while not last_name:
        last_name = input("Last name cannot be empty. Enter last name: ").strip()
    
    while True:
        phone = input("Enter phone number (10 digits): ").strip()
        if validate_phone(phone):
            break
        print("Invalid phone number. Please enter 10 digits.")
    
    while True:
        blood_group = input("Enter blood group (A+, A-, B+, B-, AB+, AB-, O+, O-): ").strip()
        if validate_blood_group(blood_group):
            blood_group = blood_group.upper()
            break
        print("Invalid blood group. Please enter a valid blood group.")
    
    return {
        'email': email,
        'username': username,
        'password': password,
        'first_name': first_name,
        'last_name': last_name,
        'phone_number': phone,
        'blood_group': blood_group
    }

def create_admin():
    db = SessionLocal()
    try:        
        # Get user input
        admin_data = get_user_input()
        
        # Check if email already exists
        existing_email = db.query(models.User).filter(models.User.email == admin_data['email']).first()
        if existing_email:
            print(f"Error: Email {admin_data['email']} is already registered.")
            return
        
        # Check if username already exists
        existing_username = db.query(models.User).filter(models.User.username == admin_data['username']).first()
        if existing_username:
            print(f"Error: Username {admin_data['username']} is already taken.")
            return
        
        # Display summary and confirm
        print("\n=== Admin User Summary ===")
        print(f"Email: {admin_data['email']}")
        print(f"Username: {admin_data['username']}")
        print(f"Name: {admin_data['first_name']} {admin_data['last_name']}")
        print(f"Phone: {admin_data['phone_number']}")
        print(f"Blood Group: {admin_data['blood_group']}")
        print(f"Role: ADMIN")
        print()
        
        confirm = input("Create admin user with the above details? (y/n): ").strip().lower()
        if confirm != 'y':
            print("Admin creation cancelled.")
            return
        
        # Create admin user
        admin_user = models.User(
            email=admin_data['email'],
            username=admin_data['username'],
            password=utils.hash(admin_data['password']),
            first_name=admin_data['first_name'],
            last_name=admin_data['last_name'],
            phone_number=admin_data['phone_number'],
            blood_group=admin_data['blood_group'],
            role=UserRole.ADMIN,
            totp_enabled=False
        )
        
        db.add(admin_user)
        db.commit()
        
        print("\n✅ Admin user created successfully!")
        print(f"Username: {admin_data['username']}")
        print(f"Email: {admin_data['email']}")
        print("\nYou can now login with these credentials.")
        
    except KeyboardInterrupt:
        print("\n\nAdmin creation cancelled by user.")
        db.rollback()
    except Exception as e:
        print(f"\nError creating admin: {e}")
        db.rollback()
    finally:
        db.close()

def main():
    print("HealthScan Admin Creator")
    print("=" * 25)
    
    try:
        create_admin()
    except Exception as e:
        print(f"Fatal error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()