export const PHASE_OPTIONS = ['Mesocycle 1 - Accumulation', 'Mesocycle 2 - Strength Block', 'Mesocycle 3 - Intensification', 'Mesocycle 4 - Peaking', 'Deload Week', 'Off-Season'];

export const DURATION_OPTIONS = ['1 Weeks', '2 Weeks', '3 Weeks', '4 Weeks', '5 Weeks', '6 Weeks', '8 Weeks', '10 Weeks', '12 Weeks'];

export const DAYS_PER_WEEK_OPTIONS = ['2 Days', '3 Days', '4 Days', '5 Days', '6 Days'];

export const TRAINING_PLANS = [
  {
    id: 'tp-1',
    name: 'Strength Block — Phase 2',
    phase: 'Mesocycle 2 - Strength Block',
    duration: '6 Weeks',
    daysPerWeek: '5 Days',
    assignedClients: 2,
    days: [
      {
        id: 'day-1',
        title: 'Chest & Triceps',
        exercises: [
          { id: 'ex-1', name: 'Incline DB Press', sets: '3', reps: '4' },
          { id: 'ex-2', name: 'Flat Bench Press', sets: '4', reps: '6' },
          { id: 'ex-3', name: 'Tricep Pushdown', sets: '3', reps: '12' },
        ],
      },
      {
        id: 'day-2',
        title: 'Back & Biceps',
        exercises: [
          { id: 'ex-1', name: 'Pull-Up', sets: '4', reps: '8' },
          { id: 'ex-2', name: 'Barbell Row', sets: '4', reps: '6' },
          { id: 'ex-3', name: 'Dumbbell Curl', sets: '3', reps: '12' },
        ],
      },
    ],
  },
  {
    id: 'tp-2',
    name: 'Strength Block — Phase 2',
    phase: 'Mesocycle 2 - Strength Block',
    duration: '6 Weeks',
    daysPerWeek: '5 Days',
    assignedClients: 2,
    days: [
      {
        id: 'day-1',
        title: 'Legs',
        exercises: [
          { id: 'ex-1', name: 'Barbell Squat', sets: '5', reps: '5' },
          { id: 'ex-2', name: 'Romanian Deadlift', sets: '3', reps: '10' },
        ],
      },
    ],
  },
];

export const MEAL_PHASE_OPTIONS = ['Cutting', 'Bulking', 'Maintenance', 'Recomposition', 'Competition Prep', 'Off-Season'];

export const MEAL_PLANS = [
  {
    id: 'mp-1',
    name: 'Cutting Phase — Week 4',
    phase: 'Cutting',
    assignedClients: 3,
    targets: { kcal: '2400', protein: '220', carbs: '200', fat: '60' },
    meals: [
      {
        id: 'meal-1',
        time: '07:00',
        foodItems: '4 Egg Whites - Oats - Banana',
        kcal: '380',
        protein: '28',
        carbs: '52',
        fat: '6',
      },
      {
        id: 'meal-2',
        time: '13:30',
        foodItems: '8oz Chicken Breast - 1 Cup Brown Rice - Salad',
        kcal: '420',
        protein: '38',
        carbs: '48',
        fat: '8',
      },
      {
        id: 'meal-3',
        time: '19:00',
        foodItems: 'Salmon Fillet - Sweet Potato - Broccoli',
        kcal: '480',
        protein: '42',
        carbs: '40',
        fat: '14',
      },
    ],
  },
  {
    id: 'mp-2',
    name: 'Bulking Template',
    phase: 'Bulking',
    assignedClients: 1,
    targets: { kcal: '3500', protein: '240', carbs: '400', fat: '90' },
    meals: [],
  },
];

export const SUPPLEMENT_SLOT_OPTIONS = ['Morning (with breakfast)', 'PRE-WORKOUT (30 min before)', 'POST-WORKOUT', 'Evening (with dinner)', 'Before bed', 'Midday'];

export const SUPPLEMENT_PLANS = [
  {
    id: 'sp-1',
    name: 'Cutting Phase Supplements',
    assignedClients: 3,
    slots: [
      {
        id: 'slot-1',
        label: 'Morning (with breakfast)',
        supplements: [
          { id: 'sup-1', name: 'Vitamin D3', dosage: '2 capsules' },
          { id: 'sup-2', name: 'Fish Oil', dosage: '1 softgel' },
        ],
      },
      {
        id: 'slot-2',
        label: 'PRE-WORKOUT (30 min before)',
        supplements: [
          { id: 'sup-3', name: 'Caffeine', dosage: '200mg' },
          { id: 'sup-4', name: 'Creatine', dosage: '5g' },
        ],
      },
      {
        id: 'slot-3',
        label: 'POST-WORKOUT',
        supplements: [{ id: 'sup-5', name: 'Whey Protein', dosage: '1 scoop' }],
      },
    ],
  },
];
