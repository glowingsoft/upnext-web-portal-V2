export const FREQUENCY_OPTIONS = ['Every Monday', 'Every Tuesday', 'Every Wednesday', 'Every Thursday', 'Every Friday', 'Every Saturday', 'Every Sunday'];

export const CHECK_IN_TEMPLATES = [
  {
    id: 'template-1',
    name: 'Weekly Check-In (Standard)',
    frequency: 'Every Monday',
    clientCount: 12,
    fields: [
      { id: 'field-1', name: 'Body Weight (lbs)', description: 'Required for tracking' },
      { id: 'field-2', name: 'Sleep Hours', description: 'Average hours per night' },
      { id: 'field-3', name: 'Energy Level', description: 'Rate from 1 to 10' },
      { id: 'field-4', name: 'Stress Level', description: 'Rate from 1 to 10' },
      { id: 'field-5', name: 'Workout Adherence', description: 'Did you follow your plan?' },
      { id: 'field-6', name: 'Nutrition Notes', description: 'Any notable meals or deviations' },
      { id: 'field-7', name: 'Comments', description: 'Any other notes or feedback' },
    ],
  },
  {
    id: 'template-2',
    name: 'Progress Check',
    frequency: 'Every Wednesday',
    clientCount: 7,
    fields: [
      { id: 'field-1', name: 'Body Weight (lbs)', description: 'Required for tracking' },
      { id: 'field-2', name: 'Body Fat %', description: 'If available' },
      { id: 'field-3', name: 'Progress Photos', description: 'Front, side, and back' },
      { id: 'field-4', name: 'Measurements (cm)', description: 'Chest, waist, hips' },
      { id: 'field-5', name: 'Overall Feeling', description: 'Rate from 1 to 10' },
    ],
  },
  {
    id: 'template-3',
    name: 'Performance Review',
    frequency: 'Every Friday',
    clientCount: 5,
    fields: [
      { id: 'field-1', name: 'Goal Progress', description: 'How close are you to your goal?' },
      { id: 'field-2', name: 'Key Achievements', description: 'List top 3 wins this month' },
      { id: 'field-3', name: 'Challenges Faced', description: 'What held you back?' },
      { id: 'field-4', name: 'Next Month Goals', description: 'What will you focus on?' },
    ],
  },
];
