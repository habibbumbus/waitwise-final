from __future__ import annotations

from typing import Generator

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import engine, get_session
from app.models import Appointment, AppointmentStatus, Base, Clinic, User
from app.schemas import (
    BookRequest,
    BookResponse,
    CancelRequest,
    ClinicOut,
    NotifyRequest,
    ReportRequest,
    ReportResponse,
    TriageRequest,
    TriageResponse,
    UserCreate,
    UserOut,
)
from app.seed_data import seed_clinics
from app.services.notifications import NotificationService
from app.services.pdf_generator import PDFGenerator
from app.services.queue_manager import QueueManager
from app.services.triage import TriageEngine

app = FastAPI(title="WaitWise Health API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

queue_manager = QueueManager(NotificationService())
triage_engine = TriageEngine()
pdf_generator = PDFGenerator()


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    with get_session() as session:
        seed_clinics(session)


def get_db() -> Generator[Session, None, None]:
    with get_session() as session:
        yield session


@app.post("/register", response_model=UserOut)
def register_user(payload: UserCreate, session: Session = Depends(get_db)) -> User:
    user = session.query(User).filter(User.email == payload.email).one_or_none()
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        id_type=payload.id_type,
    )
    session.add(user)
    session.flush()
    return user


@app.get("/clinics/nearby", response_model=list[ClinicOut])
def get_nearby_clinics(session: Session = Depends(get_db)) -> list[Clinic]:
    clinics = session.query(Clinic).all()
    return clinics


@app.post("/triage", response_model=TriageResponse)
def triage_patient(payload: TriageRequest, session: Session = Depends(get_db)) -> TriageResponse:
    urgency, reasons = triage_engine.classify(payload.symptoms)

    if payload.user_id is not None:
        user = session.get(User, payload.user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user.urgency_level = urgency
        session.add(user)

    return TriageResponse(urgency_level=urgency, reasons=reasons)


@app.post("/book", response_model=BookResponse)
def book_appointment(payload: BookRequest, session: Session = Depends(get_db)) -> BookResponse:
    user = session.get(User, payload.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    clinic = session.get(Clinic, payload.clinic_id)
    if not clinic:
        raise HTTPException(status_code=404, detail="Clinic not found")

    appointment = Appointment(user=user, clinic=clinic)
    session.add(appointment)
    session.flush()

    queue_manager.enqueue(session, clinic, appointment)

    return BookResponse(
        appointment_id=appointment.id,
        position=appointment.position,
        status=appointment.status,
    )


@app.post("/cancel")
def cancel_appointment(payload: CancelRequest, session: Session = Depends(get_db)) -> dict:
    appointment = session.get(Appointment, payload.appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if appointment.status == AppointmentStatus.CANCELLED:
        raise HTTPException(status_code=400, detail="Appointment already cancelled")

    queue_manager.cancel(session, appointment)

    return {"status": "cancelled"}


@app.post("/notify-next")
def notify_next(payload: NotifyRequest, session: Session = Depends(get_db)) -> dict:
    clinic = session.get(Clinic, payload.clinic_id)
    if not clinic:
        raise HTTPException(status_code=404, detail="Clinic not found")

    appointment = queue_manager.notify_next(session, clinic)
    if not appointment:
        return {"status": "no-patient"}

    return {"status": "notified", "appointment_id": appointment.id}


@app.post("/appointments/{appointment_id}/confirm")
def confirm_appointment(appointment_id: int, session: Session = Depends(get_db)) -> dict:
    appointment = session.get(Appointment, appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if appointment.status != AppointmentStatus.NOTIFIED:
        raise HTTPException(status_code=400, detail="Appointment must be notified before confirmation")

    queue_manager.confirm(session, appointment)
    return {"status": "confirmed"}


@app.post("/report", response_model=ReportResponse)
def generate_report(payload: ReportRequest, session: Session = Depends(get_db)) -> ReportResponse:
    appointment = session.get(Appointment, payload.appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if appointment.status not in {
        AppointmentStatus.CONFIRMED,
        AppointmentStatus.COMPLETED,
    }:
        raise HTTPException(status_code=400, detail="Report available after visit confirmation")

    pdf_base64 = pdf_generator.build_visit_summary(appointment, notes=payload.notes)
    NotificationService().send_email(
        appointment.user.email,
        "WaitWise Visit Summary",
        "Your visit summary is attached in the portal.",
    )

    return ReportResponse(
        filename=f"waitwise-summary-{appointment.id}.pdf",
        pdf_base64=pdf_base64,
    )