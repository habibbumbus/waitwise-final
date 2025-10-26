from __future__ import annotations

from dataclasses import dataclass


@dataclass
class NotificationResult:
    recipient: str
    channel: str
    message: str


class NotificationService:
    """Mock notification sender that logs SMS/email interactions."""

    def send_sms(self, phone: str, message: str) -> NotificationResult:
        print(f"[SMS] -> {phone}: {message}")
        return NotificationResult(recipient=phone, channel="sms", message=message)

    def send_email(self, email: str, subject: str, message: str) -> NotificationResult:
        print(f"[EMAIL] -> {email}: {subject}\n{message}")
        return NotificationResult(recipient=email, channel="email", message=message)