export type UrgencyLevel = 'low' | 'medium' | 'high';

const highUrgencyKeywords = [
  'chest pain', 'difficulty breathing', 'severe bleeding', 'unconscious',
  'stroke', 'heart attack', 'severe allergic reaction', 'seizure',
  'severe burns', 'major trauma', 'broken bone', 'head injury'
];

const mediumUrgencyKeywords = [
  'high fever', 'persistent vomiting', 'severe pain', 'infection',
  'deep cut', 'sprain', 'migraine', 'asthma attack', 'allergic reaction',
  'abdominal pain', 'urinary issues', 'eye injury'
];

export function classifySymptoms(symptoms: string): UrgencyLevel {
  const lowerSymptoms = symptoms.toLowerCase();

  for (const keyword of highUrgencyKeywords) {
    if (lowerSymptoms.includes(keyword)) {
      return 'high';
    }
  }

  for (const keyword of mediumUrgencyKeywords) {
    if (lowerSymptoms.includes(keyword)) {
      return 'medium';
    }
  }

  return 'low';
}

export function getUrgencyColor(urgency: UrgencyLevel): string {
  switch (urgency) {
    case 'high':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'medium':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'low':
      return 'text-green-600 bg-green-50 border-green-200';
  }
}

export function getUrgencyLabel(urgency: UrgencyLevel): string {
  switch (urgency) {
    case 'high':
      return 'Urgent';
    case 'medium':
      return 'Moderate';
    case 'low':
      return 'Routine';
  }
}
