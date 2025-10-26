from __future__ import annotations

from typing import List

LOW_KEYWORDS = {"mild", "headache", "checkup", "refill", "allergy"}
MEDIUM_KEYWORDS = {"fever", "infection", "sprain", "pain", "cough"}
HIGH_KEYWORDS = {"chest", "shortness", "unconscious", "bleeding", "fracture"}


class TriageEngine:
    def classify(self, symptoms: str) -> tuple[str, List[str]]:
        normalized = symptoms.lower()
        reasons: List[str] = []
        urgency = "low"

        if any(keyword in normalized for keyword in HIGH_KEYWORDS):
            urgency = "high"
            reasons.append("High risk symptoms detected")
        elif any(keyword in normalized for keyword in MEDIUM_KEYWORDS):
            urgency = "medium"
            reasons.append("Moderate symptoms detected")
        elif any(keyword in normalized for keyword in LOW_KEYWORDS):
            urgency = "low"
            reasons.append("Routine or mild symptoms detected")
        else:
            urgency = "medium"
            reasons.append("Defaulting to medium urgency for manual review")

        return urgency, reasons