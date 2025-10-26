from __future__ import annotations

import base64
from datetime import datetime
from fpdf import FPDF

from app.models import Appointment


class PDFGenerator:
    def build_visit_summary(self, appointment: Appointment, notes: str | None = None) -> str:
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=14)
        pdf.cell(200, 10, txt="WaitWise Health - Visit Summary", ln=True, align="C")

        pdf.set_font("Arial", size=12)
        pdf.ln(10)
        pdf.cell(200, 8, txt=f"Patient: {appointment.user.name}", ln=True)
        pdf.cell(200, 8, txt=f"Clinic: {appointment.clinic.name}", ln=True)
        pdf.cell(200, 8, txt=f"Date: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}", ln=True)
        pdf.cell(200, 8, txt=f"Urgency: {appointment.user.urgency_level or 'Not set'}", ln=True)
        pdf.ln(8)
        pdf.multi_cell(0, 8, txt="Visit Notes:")
        pdf.multi_cell(0, 8, txt=notes or "Patient seen and assessed. Continue rest and hydration. Follow-up if symptoms persist.")
        pdf.ln(8)
        pdf.multi_cell(0, 8, txt="Prescription:")
        pdf.multi_cell(0, 8, txt="Ibuprofen 200mg - take one tablet every 6 hours as needed for pain.")

        pdf_bytes = pdf.output(dest="S").encode("latin1")
        return base64.b64encode(pdf_bytes).decode("utf-8")