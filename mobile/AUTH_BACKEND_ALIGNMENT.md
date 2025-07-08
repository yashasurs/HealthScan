# AuthContext Updates - Backend Alignment

## Changes Made

### 1. Fixed Refresh Token Endpoint
**Issue**: The refresh token endpoint was not properly aligned with the Python backend implementation.

**Backend expectation** (from `auth.py`):
```python
@router.post("/refresh", response_model=schemas.Token)
def refresh_token(refresh_token: str, db: Session = Depends(database.get_db)):
    # Expects refresh_token as a string parameter
```

**Frontend fix**:
```typescript
// Changed from JSON to plain text content-type
const response = await axios.post<LoginResponse>(`${API_URL}/refresh`, 
  refreshToken, // Send as plain string
  {
    headers: { 'Content-Type': 'text/plain' }
  }
);
```

### 2. Fixed TOTP Verification Endpoint
**Issue**: The TOTP verification endpoint parameters were not matching the backend.

**Backend expectation** (from `auth.py`):
```python
@router.post("/login/verify-totp", response_model=schemas.Token)
def verify_totp(
    totp_data: schemas.TOTPVerify,
    user_id: int,  # Query parameter
    db: Session = Depends(database.get_db)
):
```

**Frontend fix**:
```typescript
// Changed from using axios params to URL query string
const response = await axios.post<LoginResponse>(`${API_URL}/login/verify-totp?user_id=${userId}`, {
  totp_code: totpCode
}, {
  headers: { 'Content-Type': 'application/json' }
});
```

## Backend API Endpoints Overview

### Authentication Endpoints:
1. `POST /register` - User registration
2. `POST /login` - User login (returns tokens or TOTP requirement)
3. `POST /login/verify-totp` - TOTP verification after login
4. `POST /refresh` - Refresh access token
5. `GET /me` - Get current user profile

### TOTP Management:
1. `POST /totp/setup` - Setup TOTP for user
2. `POST /totp/activate` - Activate TOTP after verification
3. `POST /totp/disable` - Disable TOTP

### User Management:
1. `PUT /user` - Update user profile
2. `DELETE /user` - Delete user account

## Key Backend Features Supported:

### 1. Two-Factor Authentication (TOTP)
- Full TOTP setup and verification flow
- QR code generation for authenticator apps
- Secure token generation with TOTP validation

### 2. Token Management
- JWT access tokens with user_id and role
- Refresh tokens for token renewal
- Automatic token refresh on expiry

### 3. User Roles
- Default role: PATIENT
- Role-based authorization (prepared for future features)

### 4. Security Features
- Password hashing with bcrypt
- Secure token verification
- Input validation and sanitization

## Testing Recommendations

1. **Authentication Flow**:
   - Test login with correct credentials
   - Test login with incorrect credentials
   - Test token refresh functionality

2. **TOTP Flow** (if enabled):
   - Test TOTP setup
   - Test TOTP verification during login
   - Test TOTP disable functionality

3. **User Management**:
   - Test user registration
   - Test profile updates
   - Test user deletion

## Backend URL
The AuthContext is configured to use:
```
https://healthscan-e868bea9b278.herokuapp.com
```

Make sure this backend is running and accessible for the app to function properly.
