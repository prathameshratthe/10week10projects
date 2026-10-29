import hashlib
import hmac
import secrets
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.db_models import User
from app.models.schemas import UserLogin, UserSignup


SECRET_KEY = "warrantywise-enterprise-secret-key-30-oct-2026"


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    pwd_hash = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100000).hex()
    return f"{salt}:{pwd_hash}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        salt, pwd_hash = stored_hash.split(":", 1)
        check_hash = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100000).hex()
        return hmac.compare_digest(pwd_hash, check_hash)
    except Exception:
        return False


def create_token(user_id: int, email: str) -> str:
    # Deterministic HMAC signed token format: user_id:email:timestamp:signature
    timestamp = str(int(datetime.now(timezone.utc).timestamp()))
    payload = f"{user_id}:{email}:{timestamp}"
    signature = hmac.new(SECRET_KEY.encode(), payload.encode(), hashlib.sha256).hexdigest()
    return f"{payload}:{signature}"


def verify_token(token: str) -> Optional[int]:
    try:
        parts = token.split(":")
        if len(parts) != 4:
            return None
        user_id_str, email, timestamp, signature = parts
        payload = f"{user_id_str}:{email}:{timestamp}"
        expected_sig = hmac.new(SECRET_KEY.encode(), payload.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(signature, expected_sig):
            return None
        return int(user_id_str)
    except Exception:
        return None


class AuthService:
    @staticmethod
    async def signup(db: AsyncSession, data: UserSignup) -> User:
        stmt = select(User).where(User.email == data.email.lower().strip())
        res = await db.execute(stmt)
        if res.scalar_one_or_none():
            raise ValueError("An account with this email already exists")

        user = User(
            email=data.email.lower().strip(),
            hashed_password=hash_password(data.password),
            full_name=data.full_name.strip(),
            organization_name=data.organization_name.strip() or "Personal Vault",
            role="Administrator",
            api_key=f"ww_live_{secrets.token_urlsafe(24)}",
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def login(db: AsyncSession, data: UserLogin) -> User:
        stmt = select(User).where(User.email == data.email.lower().strip())
        res = await db.execute(stmt)
        user = res.scalar_one_or_none()
        if not user or not verify_password(data.password, user.hashed_password):
            raise ValueError("Invalid email or password")
        return user

    @staticmethod
    async def get_or_create_demo_user(db: AsyncSession, role: str = "admin") -> User:
        if role == "consumer":
            email = "sarah.connor@personal.vault"
            name = "Sarah Connor"
            org = "Personal Household Vault"
            user_role = "Consumer Member"
        else:
            email = "alex.chen@nexus.corp"
            name = "Alex Chen"
            org = "Nexus Hardware Infrastructure Inc."
            user_role = "Lead Asset Manager"

        stmt = select(User).where(User.email == email)
        res = await db.execute(stmt)
        user = res.scalar_one_or_none()

        if not user:
            user = User(
                email=email,
                hashed_password=hash_password("DemoPassword123!"),
                full_name=name,
                organization_name=org,
                role=user_role,
                api_key=f"ww_demo_{secrets.token_urlsafe(20)}",
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)

        return user

    @staticmethod
    async def get_user_by_id(db: AsyncSession, user_id: int) -> Optional[User]:
        stmt = select(User).where(User.id == user_id)
        res = await db.execute(stmt)
        return res.scalar_one_or_none()

    @staticmethod
    async def generate_new_api_key(db: AsyncSession, user_id: int) -> str:
        user = await AuthService.get_user_by_id(db, user_id)
        if not user:
            raise ValueError("User not found")
        new_key = f"ww_live_{secrets.token_urlsafe(24)}"
        user.api_key = new_key
        await db.commit()
        return new_key
