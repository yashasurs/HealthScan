"""
Schemas package for the HealthScan application.
This package contains all Pydantic schema definitions.
"""

# Auth schemas
from .auth import (
    Token,
    TokenData,
    UserLogin,
    TOTPSetup,
    TOTPVerify,
    TOTPDisable,
    LoginResponse,
)

# User schemas
from .user import (
    UserCreate,
    UserUpdate,
    UserOut,
    UserDelete,
    CreatorInfo,
    PatientInfo,
)

# Record schemas
from .record import (
    RecordBase,
    RecordCreate,
    RecordUpdate,
    RecordOut,
    RecordResponse,
    RecordSummaryResponse,
    ManualRecordCreate,
    ManualRecordUpdate,
    SummaryRecordResponse,
    DoctorRecordCreate,
)

# Collection schemas
from .collection import (
    CollectionBase,
    CollectionCreate,
    CollectionUpdate,
    CollectionResponse,
    CollectionSummaryResponse,
    CollectionSummaryContent,
    DoctorCollectionCreate,
)

# Doctor schemas
from .doctor import (
    DoctorRegistration,
    DoctorDashboardInfo,
    RecentPatientInfo,
    DoctorDashboard,
    ResumeVerifierResponse,
    DoctorVerificationResult,
    DoctorInfoUpdate,
    DoctorInfo,
    AssignDoctorRequest,
    AssignDoctorResponse,
)

# Admin schemas
from .admin import (
    AdminUserCreate,
    AdminUserUpdate,
    AdminUserList,
    AdminStats,
    RoleUpdateRequest,
)

# Hospital schemas
from .hospital import (
    HospitalBase,
    HospitalCreate,
    HospitalUpdate,
    HospitalResponse,
    AddDoctorToHospitalRequest,
)

# OCR schemas
from .ocr import (
    OCRResponse,
    MarkupResponse,
    FormattingRequest,
    OcrResponseGemini,
)

# Share schemas
from .share import (
    SharedCollectionResponse,
    SharedRecordResponse,
    SharedRecordSummaryResponse,
    LinkInput,
)

# Common schemas
from .common import MessageResponse

# Family schemas
from .family import (
    FamilyBase,
    FamilyCreate,
    FamilyUpdate,
    FamilyResponse,
    FamilyInfo,
    FamilyMemberInfo,
    AddFamilyMemberRequest,
    RemoveFamilyMemberRequest,
    TransferFamilyAdminRequest,
)

__all__ = [
    # Auth
    "Token",
    "TokenData",
    "UserLogin",
    "TOTPSetup",
    "TOTPVerify",
    "TOTPDisable",
    "LoginResponse",
    # User
    "UserCreate",
    "UserUpdate",
    "UserOut",
    "UserDelete",
    "CreatorInfo",
    "PatientInfo",
    # Record
    "RecordBase",
    "RecordCreate",
    "RecordUpdate",
    "RecordOut",
    "RecordResponse",
    "RecordSummaryResponse",
    "ManualRecordCreate",
    "ManualRecordUpdate",
    "SummaryRecordResponse",
    "DoctorRecordCreate",
    # Collection
    "CollectionBase",
    "CollectionCreate",
    "CollectionUpdate",
    "CollectionResponse",
    "CollectionSummaryResponse",
    "CollectionSummaryContent",
    "DoctorCollectionCreate",
    # Doctor
    "DoctorRegistration",
    "DoctorDashboardInfo",
    "RecentPatientInfo",
    "DoctorDashboard",
    "ResumeVerifierResponse",
    "DoctorVerificationResult",
    "DoctorInfoUpdate",
    "DoctorInfo",
    "AssignDoctorRequest",
    "AssignDoctorResponse",
    # Admin
    "AdminUserCreate",
    "AdminUserUpdate",
    "AdminUserList",
    "AdminStats",
    "RoleUpdateRequest",
    # Hospital
    "HospitalBase",
    "HospitalCreate",
    "HospitalUpdate",
    "HospitalResponse",
    "AddDoctorToHospitalRequest",
    # OCR
    "OCRResponse",
    "MarkupResponse",
    "FormattingRequest",
    "OcrResponseGemini",
    # Share
    "SharedCollectionResponse",
    "SharedRecordResponse",
    "SharedRecordSummaryResponse",
    "LinkInput",
    # Common
    "MessageResponse",
    # Family
    "FamilyBase",
    "FamilyCreate",
    "FamilyUpdate",
    "FamilyResponse",
    "FamilyInfo",
    "FamilyMemberInfo",
    "AddFamilyMemberRequest",
    "RemoveFamilyMemberRequest",
    "TransferFamilyAdminRequest",
]
