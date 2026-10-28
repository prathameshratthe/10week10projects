import csv
import io
import json
from datetime import date, datetime, timezone
from typing import Dict, List, Optional, Tuple
from sqlalchemy import desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.db_models import PurchaseRecord, ReceiptItem
from app.models.schemas import (
    DashboardStats,
    LineItemSchema,
    PurchaseRecordCreate,
    PurchaseRecordResponse,
    PurchaseRecordUpdate,
    ReturnStatusEnum,
    WarrantyStatusEnum,
)


class RecordService:
    @staticmethod
    def calculate_warranty_status(
        has_warranty: bool, end_date_str: Optional[str]
    ) -> Tuple[WarrantyStatusEnum, Optional[int]]:
        if not has_warranty or not end_date_str:
            return WarrantyStatusEnum.NO_WARRANTY, None
        try:
            end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()
            today = date.today()
            delta_days = (end_date - today).days

            if delta_days < 0:
                return WarrantyStatusEnum.EXPIRED, delta_days
            elif delta_days <= 30:
                return WarrantyStatusEnum.EXPIRING_SOON, delta_days
            else:
                return WarrantyStatusEnum.ACTIVE, delta_days
        except Exception:
            return WarrantyStatusEnum.NO_WARRANTY, None

    @staticmethod
    def calculate_return_status(
        has_return: bool, deadline_str: Optional[str]
    ) -> Tuple[ReturnStatusEnum, Optional[int]]:
        if not has_return or not deadline_str:
            return ReturnStatusEnum.NO_RETURN, None
        try:
            deadline = datetime.strptime(deadline_str, "%Y-%m-%d").date()
            today = date.today()
            delta_days = (deadline - today).days

            if delta_days < 0:
                return ReturnStatusEnum.EXPIRED, delta_days
            elif delta_days <= 7:
                return ReturnStatusEnum.EXPIRING_SOON, delta_days
            else:
                return ReturnStatusEnum.ACTIVE, delta_days
        except Exception:
            return ReturnStatusEnum.NO_RETURN, None

    @classmethod
    def to_response(cls, db_record: PurchaseRecord) -> PurchaseRecordResponse:
        w_status, w_days = cls.calculate_warranty_status(
            db_record.has_explicit_warranty, db_record.warranty_end_date
        )
        r_status, r_days = cls.calculate_return_status(
            db_record.has_explicit_return_policy, db_record.return_deadline
        )

        items_schema = [
            LineItemSchema(
                name=item.name,
                quantity=item.quantity,
                unit_price=item.unit_price,
                total_price=item.total_price,
                category=item.category or "General"
            )
            for item in (db_record.items or [])
        ]

        return PurchaseRecordResponse(
            id=db_record.id,
            merchant_name=db_record.merchant_name,
            merchant_address=db_record.merchant_address,
            purchase_date=db_record.purchase_date,
            total_amount=db_record.total_amount,
            tax_amount=db_record.tax_amount,
            currency=db_record.currency,
            category=db_record.category,
            invoice_number=db_record.invoice_number,
            payment_method=db_record.payment_method,
            items=items_schema,
            has_explicit_warranty=db_record.has_explicit_warranty,
            warranty_duration_months=db_record.warranty_duration_months,
            warranty_end_date=db_record.warranty_end_date,
            warranty_notes=db_record.warranty_notes,
            warranty_status=w_status,
            days_left_warranty=w_days,
            has_explicit_return_policy=db_record.has_explicit_return_policy,
            return_window_days=db_record.return_window_days,
            return_deadline=db_record.return_deadline,
            return_notes=db_record.return_notes,
            return_status=r_status,
            days_left_return=r_days,
            receipt_filename=db_record.receipt_filename,
            notes=db_record.notes,
            created_at=db_record.created_at.isoformat(),
            updated_at=db_record.updated_at.isoformat(),
        )

    @classmethod
    async def create_record(
        cls, db: AsyncSession, data: PurchaseRecordCreate
    ) -> PurchaseRecordResponse:
        record = PurchaseRecord(
            merchant_name=data.merchant_name,
            merchant_address=data.merchant_address,
            purchase_date=data.purchase_date,
            total_amount=data.total_amount,
            tax_amount=data.tax_amount,
            currency=data.currency,
            category=data.category,
            invoice_number=data.invoice_number,
            payment_method=data.payment_method,
            has_explicit_warranty=data.has_explicit_warranty,
            warranty_duration_months=data.warranty_duration_months,
            warranty_end_date=data.warranty_end_date,
            warranty_notes=data.warranty_notes,
            has_explicit_return_policy=data.has_explicit_return_policy,
            return_window_days=data.return_window_days,
            return_deadline=data.return_deadline,
            return_notes=data.return_notes,
            receipt_filename=data.receipt_filename,
            notes=data.notes,
        )

        for item_in in data.items:
            item_model = ReceiptItem(
                name=item_in.name,
                quantity=item_in.quantity,
                unit_price=item_in.unit_price,
                total_price=item_in.total_price or ((item_in.unit_price or 0.0) * item_in.quantity),
                category=item_in.category or "General"
            )
            record.items.append(item_model)

        db.add(record)
        await db.commit()
        await db.refresh(record)
        return cls.to_response(record)

    @classmethod
    async def get_record(
        cls, db: AsyncSession, record_id: int
    ) -> Optional[PurchaseRecordResponse]:
        stmt = (
            select(PurchaseRecord)
            .options(selectinload(PurchaseRecord.items))
            .where(PurchaseRecord.id == record_id)
        )
        result = await db.execute(stmt)
        record = result.scalars().first()
        if not record:
            return None
        return cls.to_response(record)

    @classmethod
    async def list_records(
        cls,
        db: AsyncSession,
        skip: int = 0,
        limit: int = 50,
        search: Optional[str] = None,
        category: Optional[str] = None,
        warranty_status: Optional[str] = None,
        return_status: Optional[str] = None,
        sort_by: str = "purchase_date",
        sort_order: str = "desc",
    ) -> List[PurchaseRecordResponse]:
        query = select(PurchaseRecord).options(selectinload(PurchaseRecord.items))

        if search:
            search_pattern = f"%{search}%"
            query = query.where(
                or_(
                    PurchaseRecord.merchant_name.ilike(search_pattern),
                    PurchaseRecord.invoice_number.ilike(search_pattern),
                    PurchaseRecord.notes.ilike(search_pattern),
                )
            )

        if category and category.lower() != "all":
            query = query.where(PurchaseRecord.category.ilike(category))

        if sort_order.lower() == "asc":
            query = query.order_by(getattr(PurchaseRecord, sort_by, PurchaseRecord.purchase_date).asc())
        else:
            query = query.order_by(getattr(PurchaseRecord, sort_by, PurchaseRecord.purchase_date).desc())

        result = await db.execute(query)
        records = result.scalars().all()

        responses = [cls.to_response(r) for r in records]

        # In-memory filter for status flags which are date-dependent
        if warranty_status and warranty_status.upper() != "ALL":
            responses = [r for r in responses if r.warranty_status.value == warranty_status.upper()]

        if return_status and return_status.upper() != "ALL":
            responses = [r for r in responses if r.return_status.value == return_status.upper()]

        return responses[skip : skip + limit]

    @classmethod
    async def update_record(
        cls, db: AsyncSession, record_id: int, data: PurchaseRecordUpdate
    ) -> Optional[PurchaseRecordResponse]:
        stmt = (
            select(PurchaseRecord)
            .options(selectinload(PurchaseRecord.items))
            .where(PurchaseRecord.id == record_id)
        )
        result = await db.execute(stmt)
        record = result.scalars().first()
        if not record:
            return None

        update_dict = data.model_dump(exclude_unset=True)

        if "items" in update_dict and update_dict["items"] is not None:
            record.items.clear()
            for item_in in data.items or []:
                item_model = ReceiptItem(
                    name=item_in.name,
                    quantity=item_in.quantity,
                    unit_price=item_in.unit_price,
                    total_price=item_in.total_price or ((item_in.unit_price or 0.0) * item_in.quantity),
                    category=item_in.category or "General"
                )
                record.items.append(item_model)
            del update_dict["items"]

        for k, v in update_dict.items():
            setattr(record, k, v)

        record.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(record)
        return cls.to_response(record)

    @classmethod
    async def delete_record(cls, db: AsyncSession, record_id: int) -> bool:
        stmt = select(PurchaseRecord).where(PurchaseRecord.id == record_id)
        result = await db.execute(stmt)
        record = result.scalars().first()
        if not record:
            return False
        await db.delete(record)
        await db.commit()
        return True

    @classmethod
    async def get_dashboard_stats(cls, db: AsyncSession) -> DashboardStats:
        stmt = select(PurchaseRecord).options(selectinload(PurchaseRecord.items))
        result = await db.execute(stmt)
        records = result.scalars().all()

        responses = [cls.to_response(r) for r in records]

        active_w = sum(1 for r in responses if r.warranty_status == WarrantyStatusEnum.ACTIVE)
        expiring_w = sum(1 for r in responses if r.warranty_status == WarrantyStatusEnum.EXPIRING_SOON)
        expired_w = sum(1 for r in responses if r.warranty_status == WarrantyStatusEnum.EXPIRED)

        active_r = sum(1 for r in responses if r.return_status == ReturnStatusEnum.ACTIVE)
        expiring_r = sum(1 for r in responses if r.return_status == ReturnStatusEnum.EXPIRING_SOON)
        expired_r = sum(1 for r in responses if r.return_status == ReturnStatusEnum.EXPIRED)

        spend_by_currency: Dict[str, float] = {}
        for r in responses:
            curr = r.currency.upper()
            spend_by_currency[curr] = round(spend_by_currency.get(curr, 0.0) + r.total_amount, 2)

        return DashboardStats(
            total_records=len(responses),
            active_warranties=active_w,
            expiring_soon_warranties=expiring_w,
            expired_warranties=expired_w,
            active_returns=active_r,
            expiring_soon_returns=expiring_r,
            expired_returns=expired_r,
            total_spend_by_currency=spend_by_currency,
        )

    @classmethod
    async def export_csv(cls, db: AsyncSession) -> str:
        records = await cls.list_records(db, skip=0, limit=10000)
        output = io.StringIO()
        writer = csv.writer(output)

        # Header
        writer.writerow([
            "ID", "Merchant Name", "Purchase Date", "Total Amount", "Currency", "Category",
            "Invoice Number", "Payment Method", "Items Summary",
            "Has Explicit Warranty", "Warranty Duration (Months)", "Warranty End Date", "Warranty Status", "Days Left Warranty",
            "Has Return Policy", "Return Window (Days)", "Return Deadline", "Return Status", "Days Left Return", "Notes"
        ])

        for r in records:
            items_str = "; ".join([f"{it.name} (x{it.quantity})" for it in r.items])
            writer.writerow([
                r.id, r.merchant_name, r.purchase_date, r.total_amount, r.currency, r.category,
                r.invoice_number or "", r.payment_method or "", items_str,
                "YES" if r.has_explicit_warranty else "NO",
                r.warranty_duration_months or "", r.warranty_end_date or "", r.warranty_status.value, r.days_left_warranty if r.days_left_warranty is not None else "",
                "YES" if r.has_explicit_return_policy else "NO",
                r.return_window_days or "", r.return_deadline or "", r.return_status.value, r.days_left_return if r.days_left_return is not None else "",
                r.notes or ""
            ])

        return output.getvalue()

    @classmethod
    async def export_json(cls, db: AsyncSession) -> str:
        records = await cls.list_records(db, skip=0, limit=10000)
        return json.dumps([r.model_dump() for r in records], indent=2)
