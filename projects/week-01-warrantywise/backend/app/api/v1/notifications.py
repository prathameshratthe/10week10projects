from typing import List
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.db_models import NotificationItem
from app.models.schemas import NotificationCreate, NotificationResponse

router = APIRouter(prefix="/notifications", tags=["Alerts & Notifications"])


@router.get("/", response_model=List[NotificationResponse])
async def list_notifications(db: AsyncSession = Depends(get_db)):
    """Retrieve all priority alerts, expiration reminders, and claim status notifications."""
    stmt = select(NotificationItem).order_by(desc(NotificationItem.created_at))
    res = await db.execute(stmt)
    items = res.scalars().all()
    return [
        NotificationResponse(
            id=n.id,
            type=n.type,
            severity=n.severity,
            title=n.title,
            message=n.message,
            record_id=n.record_id,
            read=n.read,
            created_at=n.created_at.isoformat(),
        )
        for n in items
    ]


@router.put("/{notification_id}/read", response_model=NotificationResponse)
async def mark_notification_read(
    notification_id: int, db: AsyncSession = Depends(get_db)
):
    """Mark an individual notification as read."""
    stmt = select(NotificationItem).where(NotificationItem.id == notification_id)
    res = await db.execute(stmt)
    item = res.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Notification not found")
    item.read = True
    await db.commit()
    await db.refresh(item)
    return NotificationResponse(
        id=item.id,
        type=item.type,
        severity=item.severity,
        title=item.title,
        message=item.message,
        record_id=item.record_id,
        read=item.read,
        created_at=item.created_at.isoformat(),
    )


@router.post("/mark-all-read")
async def mark_all_read(db: AsyncSession = Depends(get_db)):
    """Mark all active notifications as acknowledged."""
    stmt = select(NotificationItem).where(NotificationItem.read == False)
    res = await db.execute(stmt)
    for item in res.scalars().all():
        item.read = True
    await db.commit()
    return {"message": "All notifications marked as read"}


@router.post("/test-alert", response_model=NotificationResponse)
async def trigger_test_alert(data: NotificationCreate, db: AsyncSession = Depends(get_db)):
    """Trigger a simulated webhook or notification alert."""
    item = NotificationItem(
        type=data.type,
        severity=data.severity,
        title=data.title,
        message=data.message,
        record_id=data.record_id,
        read=False,
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return NotificationResponse(
        id=item.id,
        type=item.type,
        severity=item.severity,
        title=item.title,
        message=item.message,
        record_id=item.record_id,
        read=item.read,
        created_at=item.created_at.isoformat(),
    )
