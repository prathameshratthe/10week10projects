from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.schemas import (
    ApiKeyResponse,
    DemoLoginRequest,
    TokenResponse,
    UserLogin,
    UserResponse,
    UserSignup,
)
from app.services.auth_service import AuthService, create_token, verify_token

router = APIRouter(prefix="/auth", tags=["Authentication & Access Control"])


@router.post("/signup", response_model=TokenResponse)
async def signup(data: UserSignup, db: AsyncSession = Depends(get_db)):
    """Register a new enterprise or individual account."""
    try:
        user = await AuthService.signup(db, data)
        token = create_token(user.id, user.email)
        return TokenResponse(
            access_token=token,
            user=UserResponse(
                id=user.id,
                email=user.email,
                full_name=user.full_name,
                organization_name=user.organization_name,
                role=user.role,
                api_key=user.api_key,
                created_at=user.created_at.isoformat(),
            ),
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    """Authenticate with email and password."""
    try:
        user = await AuthService.login(db, data)
        token = create_token(user.id, user.email)
        return TokenResponse(
            access_token=token,
            user=UserResponse(
                id=user.id,
                email=user.email,
                full_name=user.full_name,
                organization_name=user.organization_name,
                role=user.role,
                api_key=user.api_key,
                created_at=user.created_at.isoformat(),
            ),
        )
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/demo-login", response_model=TokenResponse)
async def demo_login(req: DemoLoginRequest = DemoLoginRequest(), db: AsyncSession = Depends(get_db)):
    """One-click instant login for Enterprise Admin or Consumer demonstration."""
    user = await AuthService.get_or_create_demo_user(db, req.role)
    token = create_token(user.id, user.email)
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            organization_name=user.organization_name,
            role=user.role,
            api_key=user.api_key,
            created_at=user.created_at.isoformat(),
        ),
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    authorization: str = Header(None), db: AsyncSession = Depends(get_db)
):
    """Retrieve current authenticated user from Bearer token."""
    if not authorization:
        # Fallback to default demo user if not logged in
        user = await AuthService.get_or_create_demo_user(db, "admin")
        return UserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            organization_name=user.organization_name,
            role=user.role,
            api_key=user.api_key,
            created_at=user.created_at.isoformat(),
        )

    token = authorization.replace("Bearer ", "").strip()
    user_id = verify_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired session token")

    user = await AuthService.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        organization_name=user.organization_name,
        role=user.role,
        api_key=user.api_key,
        created_at=user.created_at.isoformat(),
    )


@router.post("/generate-key", response_model=ApiKeyResponse)
async def generate_api_key(
    authorization: str = Header(None), db: AsyncSession = Depends(get_db)
):
    """Generate a new secure API integration key."""
    user_id = 1
    if authorization:
        token = authorization.replace("Bearer ", "").strip()
        parsed_id = verify_token(token)
        if parsed_id:
            user_id = parsed_id

    try:
        new_key = await AuthService.generate_new_api_key(db, user_id)
        return ApiKeyResponse(
            api_key=new_key,
            message="New API key generated. Use 'Authorization: Bearer <key>' for ERP / automated receipt uploads.",
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
