from pydantic import BaseModel


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    require_totp: bool = False


class TokenData(BaseModel):
    id: int | None = None
    token_type: str | None = None
    role: str 


class UserLogin(BaseModel):
    username: str
    password: str


class TOTPSetup(BaseModel):
    totp_secret: str
    provisioning_uri: str


class TOTPVerify(BaseModel):
    totp_code: str


class TOTPDisable(BaseModel):
    totp_code: str


class LoginResponse(BaseModel):
    access_token: str | None = None
    refresh_token: str | None = None
    token_type: str | None = None
    require_totp: bool = False
    user_id: int | None = None
