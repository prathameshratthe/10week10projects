import json
from datetime import datetime
from typing import Optional
from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class ScanRecord(Base):
    __tablename__ = "scan_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    input_text: Mapped[str] = mapped_column(Text, nullable=False)
    sender_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    message_type: Mapped[str] = mapped_column(String(50), default="SMS", nullable=False)
    risk_score: Mapped[int] = mapped_column(Integer, nullable=False)
    verdict: Mapped[str] = mapped_column(String(50), nullable=False)
    scam_category: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    summary_explanation: Mapped[str] = mapped_column(Text, nullable=False)
    entities_json: Mapped[str] = mapped_column(Text, default="[]", nullable=False)
    red_flags_json: Mapped[str] = mapped_column(Text, default="[]", nullable=False)
    steps_json: Mapped[str] = mapped_column(Text, default="[]", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
