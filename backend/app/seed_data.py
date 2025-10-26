from __future__ import annotations

from typing import Iterable

from sqlalchemy.orm import Session

from app.models import Clinic

DEFAULT_CLINICS = [
    {
        "name": "Downtown Health Hub",
        "address": "123 Main St",
        "current_wait": 25,
        "capacity": 30,
    },
    {
        "name": "Lakeside Walk-In",
        "address": "456 Lake Ave",
        "current_wait": 40,
        "capacity": 20,
    },
    {
        "name": "Uptown Care Clinic",
        "address": "789 Uptown Blvd",
        "current_wait": 15,
        "capacity": 25,
    },
]


def seed_clinics(session: Session, clinics: Iterable[dict] | None = None) -> None:
    clinics = list(clinics or DEFAULT_CLINICS)
    existing = session.query(Clinic).count()
    if existing:
        return

    for clinic_data in clinics:
        clinic = Clinic(**clinic_data)
        session.add(clinic)