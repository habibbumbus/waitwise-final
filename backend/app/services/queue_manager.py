from __future__ import annotations

from typing import Optional

from sqlalchemy.orm import Session

from app.models import Appointment, AppointmentStatus, Clinic
from app.services.notifications import NotificationService


class QueueManager:
    def __init__(self, notification_service: Optional[NotificationService] = None) -> None:
        self.notification_service = notification_service or NotificationService()

    def enqueue(self, session: Session, clinic: Clinic, appointment: Appointment) -> Appointment:
        position = clinic.add_to_queue(appointment.user_id)
        appointment.position = position
        appointment.status = AppointmentStatus.QUEUED
        session.add(appointment)
        session.add(clinic)
        self.notification_service.send_sms(
            appointment.user.phone,
            f"You are #{position} in line for {clinic.name}. We'll notify you when it's your turn.",
        )
        return appointment

    def cancel(self, session: Session, appointment: Appointment) -> None:
        clinic = appointment.clinic
        clinic.remove_from_queue(appointment.user_id)
        appointment.status = AppointmentStatus.CANCELLED
        session.add(appointment)
        session.add(clinic)
        self.notify_next(session, clinic)

    def notify_next(self, session: Session, clinic: Clinic) -> Optional[Appointment]:
        """Notify the next patient in queue and mark appointment as notified."""
        if not clinic.queue:
            return None

        next_user_id = clinic.queue[0]
        next_appointment: Optional[Appointment] = (
            session.query(Appointment)
            .filter(
                Appointment.user_id == next_user_id,
                Appointment.clinic_id == clinic.id,
                Appointment.status == AppointmentStatus.QUEUED,
            )
            .order_by(Appointment.created_at.asc())
            .first()
        )

        if not next_appointment:
            clinic.pop_next_from_queue()
            session.add(clinic)
            return self.notify_next(session, clinic)

        next_appointment.status = AppointmentStatus.NOTIFIED
        session.add(next_appointment)
        self.notification_service.send_sms(
            next_appointment.user.phone,
            f"A spot at {clinic.name} is now available. Reply YES within 5 minutes to confirm.",
        )
        return next_appointment

    def confirm(self, session: Session, appointment: Appointment) -> Appointment:
        clinic = appointment.clinic
        queue = clinic.queue
        if queue and queue[0] == appointment.user_id:
            clinic.pop_next_from_queue()
        else:
            clinic.remove_from_queue(appointment.user_id)
        appointment.status = AppointmentStatus.CONFIRMED
        session.add(clinic)
        session.add(appointment)
        self.notification_service.send_sms(
            appointment.user.phone,
            f"Your visit at {clinic.name} is confirmed. Please head to the clinic.",
        )
        return appointment