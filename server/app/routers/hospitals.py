from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, oauth2, database

router = APIRouter(
    tags=["Hospitals"],
    prefix='/hospitals'
)


@router.post("/", response_model=schemas.HospitalResponse, status_code=status.HTTP_201_CREATED)
def create_hospital(
    hospital: schemas.HospitalCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """Create a new hospital (Admin only)"""
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can create hospitals"
        )
    
    new_hospital = models.Hospital(**hospital.model_dump())
    db.add(new_hospital)
    db.commit()
    db.refresh(new_hospital)
    
    return new_hospital


@router.get("/", response_model=List[schemas.HospitalResponse])
def get_all_hospitals(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """Get all hospitals"""
    hospitals = db.query(models.Hospital).all()
    return hospitals


@router.get("/{hospital_id}", response_model=schemas.HospitalResponse)
def get_hospital(
    hospital_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """Get a specific hospital by ID"""
    hospital = db.query(models.Hospital).filter(models.Hospital.id == hospital_id).first()
    
    if not hospital:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hospital with id {hospital_id} not found"
        )
    
    return hospital


@router.put("/{hospital_id}", response_model=schemas.HospitalResponse)
def update_hospital(
    hospital_id: int,
    hospital_update: schemas.HospitalUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """Update a hospital (Admin only)"""
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can update hospitals"
        )
    
    hospital = db.query(models.Hospital).filter(models.Hospital.id == hospital_id).first()
    
    if not hospital:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hospital with id {hospital_id} not found"
        )
    
    # Update only provided fields
    update_data = hospital_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(hospital, field, value)
    
    db.commit()
    db.refresh(hospital)
    
    return hospital


@router.delete("/{hospital_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_hospital(
    hospital_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """Delete a hospital (Admin only)"""
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete hospitals"
        )
    
    hospital = db.query(models.Hospital).filter(models.Hospital.id == hospital_id).first()
    
    if not hospital:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hospital with id {hospital_id} not found"
        )
    
    db.delete(hospital)
    db.commit()


@router.post("/{hospital_id}/doctors", response_model=schemas.MessageResponse)
def add_doctor_to_hospital(
    hospital_id: int,
    request: schemas.AddDoctorToHospitalRequest,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """Add a doctor to a hospital (Admin only)"""
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can add doctors to hospitals"
        )
    
    # Get hospital
    hospital = db.query(models.Hospital).filter(models.Hospital.id == hospital_id).first()
    if not hospital:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hospital with id {hospital_id} not found"
        )
    
    # Get doctor
    doctor = db.query(models.User).filter(
        models.User.id == request.doctor_id,
        models.User.role == models.UserRole.DOCTOR
    ).first()
    
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Doctor with id {request.doctor_id} not found"
        )
    
    # Check if doctor is already in hospital
    if doctor in hospital.doctors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Doctor {doctor.first_name} {doctor.last_name} is already affiliated with this hospital"
        )
    
    # Add doctor to hospital
    hospital.doctors.append(doctor)
    db.commit()
    
    return {"message": f"Doctor {doctor.first_name} {doctor.last_name} added to {hospital.name}"}


@router.delete("/{hospital_id}/doctors/{doctor_id}", response_model=schemas.MessageResponse)
def remove_doctor_from_hospital(
    hospital_id: int,
    doctor_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """Remove a doctor from a hospital (Admin only)"""
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can remove doctors from hospitals"
        )
    
    # Get hospital
    hospital = db.query(models.Hospital).filter(models.Hospital.id == hospital_id).first()
    if not hospital:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hospital with id {hospital_id} not found"
        )
    
    # Get doctor
    doctor = db.query(models.User).filter(
        models.User.id == doctor_id,
        models.User.role == models.UserRole.DOCTOR
    ).first()
    
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Doctor with id {doctor_id} not found"
        )
    
    # Check if doctor is in hospital
    if doctor not in hospital.doctors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Doctor {doctor.first_name} {doctor.last_name} is not affiliated with this hospital"
        )
    
    # Remove doctor from hospital
    hospital.doctors.remove(doctor)
    db.commit()
    
    return {"message": f"Doctor {doctor.first_name} {doctor.last_name} removed from {hospital.name}"}


@router.get("/{hospital_id}/doctors", response_model=List[schemas.DoctorInfo])
def get_hospital_doctors(
    hospital_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(oauth2.get_current_user)
):
    """Get all doctors affiliated with a hospital"""
    hospital = db.query(models.Hospital).filter(models.Hospital.id == hospital_id).first()
    
    if not hospital:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hospital with id {hospital_id} not found"
        )
    
    return hospital.doctors
