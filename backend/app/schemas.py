from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    id_type: str = Field(pattern="^(Healthcard|GovID)$")


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: str
    id_type: str
    urgency_level: Optional[str]

    class Config:
        orm_mode = True


class ClinicOut(BaseModel):
    id: int
    name: str
    address: str
    current_wait: int
    capacity: int
    queue: List[int]

    class Config:
        orm_mode = True


class TriageRequest(BaseModel):
    user_id: Optional[int] = None
    symptoms: str


class TriageResponse(BaseModel):
    urgency_level: str
    reasons: List[str]


class BookRequest(BaseModel):
    user_id: int
    clinic_id: int


class BookResponse(BaseModel):
    appointment_id: int
    position: int
    status: str


class CancelRequest(BaseModel):
    appointment_id: int


class NotifyRequest(BaseModel):
    clinic_id: int


class ReportRequest(BaseModel):
    appointment_id: int
    notes: Optional[str] = None


class ReportResponse(BaseModel):
    filename: str
    pdf_base64: str