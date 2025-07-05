from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from .. import models, schemas, database

router = APIRouter(
    tags=['public'],
    prefix='/public'
)

@router.get("/doctors", response_model=List[schemas.DoctorInfo])
def get_all_doctors(
    specialization: Optional[str] = Query(None, description="Filter by specialization"),
    hospital: Optional[str] = Query(None, description="Filter by hospital affiliation"),
    verified_only: bool = Query(True, description="Show only verified doctors"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of doctors to return"),
    offset: int = Query(0, ge=0, description="Number of doctors to skip"),
    db: Session = Depends(database.get_db)
):
    """Get list of all doctors (public endpoint)"""
    try:
        # Base query for doctors
        query = db.query(models.User).filter(models.User.role == models.UserRole.DOCTOR)
        
        # Filter by verification status
        if verified_only:
            query = query.filter(models.User.resume_verification_status == True)
        
        # Filter by specialization if provided
        if specialization:
            query = query.filter(models.User.specialization.ilike(f"%{specialization}%"))
        
        # Filter by hospital affiliation if provided
        if hospital:
            query = query.filter(models.User.hospital_affiliation.ilike(f"%{hospital}%"))
        
        # Apply pagination
        doctors = query.offset(offset).limit(limit).all()
        
        return doctors
    
    except Exception as e:
        print(f"Error getting doctors list: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving doctors list: {str(e)}"
        )

@router.get("/doctors/specializations", response_model=List[str])
def get_doctor_specializations(
    db: Session = Depends(database.get_db)
):
    """Get list of all available specializations (public endpoint)"""
    try:
        specializations = db.query(models.User.specialization).filter(
            models.User.role == models.UserRole.DOCTOR,
            models.User.specialization.is_not(None),
            models.User.specialization != ""
        ).distinct().all()
        
        # Extract just the specialization strings and filter out None/empty values
        specializations_list = [spec[0] for spec in specializations if spec[0] and spec[0].strip()]
        
        return sorted(specializations_list)
    
    except Exception as e:
        print(f"Error getting specializations: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving specializations: {str(e)}"
        )

@router.get("/doctors/hospitals", response_model=List[str])
def get_doctor_hospitals(
    db: Session = Depends(database.get_db)
):
    """Get list of all hospital affiliations (public endpoint)"""
    try:
        hospitals = db.query(models.User.hospital_affiliation).filter(
            models.User.role == models.UserRole.DOCTOR,
            models.User.hospital_affiliation.is_not(None),
            models.User.hospital_affiliation != ""
        ).distinct().all()
        
        # Extract just the hospital strings and filter out None/empty values
        hospitals_list = [hospital[0] for hospital in hospitals if hospital[0] and hospital[0].strip()]
        
        return sorted(hospitals_list)
    
    except Exception as e:
        print(f"Error getting hospitals: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving hospitals: {str(e)}"
        )


@router.get("/doctors/stats", response_model=dict)
def get_doctors_stats(
    db: Session = Depends(database.get_db)
):
    """Get statistics about doctors (public endpoint)"""
    try:
        total_doctors = db.query(models.User).filter(
            models.User.role == models.UserRole.DOCTOR
        ).count()
        
        verified_doctors = db.query(models.User).filter(
            models.User.role == models.UserRole.DOCTOR,
            models.User.resume_verification_status == True
        ).count()
        
        unverified_doctors = total_doctors - verified_doctors
        
        # Get specialization counts
        specialization_counts = db.query(
            models.User.specialization,
            func.count(models.User.id).label('count')
        ).filter(
            models.User.role == models.UserRole.DOCTOR,
            models.User.specialization.is_not(None),
            models.User.specialization != ""
        ).group_by(models.User.specialization).all()
        
        specialization_stats = {spec[0]: spec[1] for spec in specialization_counts}
        
        return {
            "total_doctors": total_doctors,
            "verified_doctors": verified_doctors,
            "unverified_doctors": unverified_doctors,
            "specialization_counts": specialization_stats
        }
    
    except Exception as e:
        print(f"Error getting doctor stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving doctor statistics: {str(e)}"
        )