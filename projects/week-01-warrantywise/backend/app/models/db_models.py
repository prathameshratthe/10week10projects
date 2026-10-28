from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


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
