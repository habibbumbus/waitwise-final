from __future__ import annotations

import json
from datetime import datetime
from typing import List, Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class Clinic(Base):
    __tablename__ = "clinics"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    address: Mapped[str] = mapped_column(String, nullable=False)
    current_wait: Mapped[int] = mapped_column(Integer, default=0)
    capacity: Mapped[int] = mapped_column(Integer, default=0)
    queue_json: Mapped[str] = mapped_column("queue", Text, default="[]")

    appointments: Mapped[List["Appointment"]] = relationship(
        back_populates="clinic", cascade="all, delete-orphan"
    )

    @property
    def queue(self) -> List[int]:
        try:
            return json.loads(self.queue_json)
        except json.JSONDecodeError:
            return []

    def add_to_queue(self, user_id: int) -> int:
        queue = self.queue
        queue.append(user_id)
        self.queue_json = json.dumps(queue)
        return len(queue)

    def remove_from_queue(self, user_id: int) -> None:
        queue = [uid for uid in self.queue if uid != user_id]
        self.queue_json = json.dumps(queue)

    def pop_next_from_queue(self) -> Optional[int]:
        queue = self.queue
        if not queue:
            return None
        next_user = queue.pop(0)
        self.queue_json = json.dumps(queue)
        return next_user


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    phone: Mapped[str] = mapped_column(String, nullable=False)
    id_type: Mapped[str] = mapped_column(String, nullable=False)
    urgency_level: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    appointments: Mapped[List["Appointment"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class AppointmentStatus:
    QUEUED = "queued"
    NOTIFIED = "notified"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class Appointment(Base):
    __tablename__ = "appointments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    clinic_id: Mapped[int] = mapped_column(ForeignKey("clinics.id"), nullable=False)
    status: Mapped[str] = mapped_column(String, default=AppointmentStatus.QUEUED)
    position: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped[User] = relationship(back_populates="appointments")
    clinic: Mapped[Clinic] = relationship(back_populates="appointments")