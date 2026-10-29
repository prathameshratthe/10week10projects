from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    organization_name: Mapped[str] = mapped_column(String(255), default="Enterprise Vault", nullable=False)
    role: Mapped[str] = mapped_column(String(50), default="Administrator", nullable=False)
    api_key: Mapped[Optional[str]] = mapped_column(String(100), unique=True, index=True, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)


class PurchaseRecord(Base):
    __tablename__ = "purchase_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    merchant_name: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    merchant_address: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    purchase_date: Mapped[str] = mapped_column(String(10), index=True, nullable=False)  # YYYY-MM-DD
    total_amount: Mapped[float] = mapped_column(Float, nullable=False)
    tax_amount: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    currency: Mapped[str] = mapped_column(String(10), default="USD", nullable=False)
    category: Mapped[str] = mapped_column(String(100), default="Electronics", nullable=False)
    invoice_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    payment_method: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Warranty
    has_explicit_warranty: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    warranty_duration_months: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    warranty_end_date: Mapped[Optional[str]] = mapped_column(String(10), index=True, nullable=True)
    warranty_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Return
    has_explicit_return_policy: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    return_window_days: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    return_deadline: Mapped[Optional[str]] = mapped_column(String(10), index=True, nullable=True)
    return_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Metadata
    receipt_filename: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=utc_now, onupdate=utc_now, nullable=False
    )

    items: Mapped[List["ReceiptItem"]] = relationship(
        "ReceiptItem", back_populates="record", cascade="all, delete-orphan", lazy="selectin"
    )
    claims: Mapped[List["WarrantyClaim"]] = relationship(
        "WarrantyClaim", back_populates="record", cascade="all, delete-orphan", lazy="selectin"
    )


class ReceiptItem(Base):
    __tablename__ = "receipt_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    record_id: Mapped[int] = mapped_column(Integer, ForeignKey("purchase_records.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    unit_price: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    total_price: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    category: Mapped[Optional[str]] = mapped_column(String(100), default="General", nullable=True)

    record: Mapped["PurchaseRecord"] = relationship("PurchaseRecord", back_populates="items")


class WarrantyClaim(Base):
    __tablename__ = "warranty_claims"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    record_id: Mapped[int] = mapped_column(Integer, ForeignKey("purchase_records.id", ondelete="CASCADE"), nullable=False)
    claim_number: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    issue_description: Mapped[str] = mapped_column(Text, nullable=False)
    desired_resolution: Mapped[str] = mapped_column(String(100), default="Repair", nullable=False)  # Repair, Replacement, Refund
    status: Mapped[str] = mapped_column(String(50), default="IN_REVIEW", nullable=False)  # DRAFT, SUBMITTED, IN_REVIEW, APPROVED, REJECTED
    filing_date: Mapped[str] = mapped_column(String(10), nullable=False)  # YYYY-MM-DD
    claim_letter_body: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    tracking_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    repair_cost_claimed: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=utc_now, onupdate=utc_now, nullable=False
    )

    record: Mapped["PurchaseRecord"] = relationship("PurchaseRecord", back_populates="claims")


class NotificationItem(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    type: Mapped[str] = mapped_column(String(50), default="SYSTEM", nullable=False)  # EXPIRING_WARRANTY, EXPIRING_RETURN, CLAIM_UPDATE, SYSTEM
    severity: Mapped[str] = mapped_column(String(20), default="info", nullable=False)  # urgent, warning, info
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    record_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)
