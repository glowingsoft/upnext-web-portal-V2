export const OPERATING_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export function buildDefaultOperatingHours() {
  return OPERATING_DAYS.reduce((acc, day) => {
    acc[day] = {
      enabled: true,
      startTime: '10:00',
      endTime: '22:00',
      breaks: [],
    };
    return acc;
  }, {});
}

export const SAMPLE_OPERATING_HOURS = {
  ...buildDefaultOperatingHours(),
  saturday: {
    enabled: true,
    startTime: '10:00',
    endTime: '22:00',
    breaks: [{ start: '14:00', end: '16:00' }],
  },
};

const toMins = (t) => {
  if (!t) return null;
  const [h, m] = String(t).split(':').map(Number);
  return h * 60 + m;
};

export function validateOperatingHoursWindows(hours) {
  const errors = {};

  OPERATING_DAYS.forEach((day) => {
    const entry = hours[day];
    if (!entry?.enabled) return;

    const dayErrors = {};
    const start = toMins(entry.startTime);
    const end = toMins(entry.endTime);
    const isOvernight = start !== null && end !== null && end < start;

    if (start === null || end === null) {
      dayErrors.window = 'Both start and end times are required';
    } else if (start === end) {
      dayErrors.window = 'End time must be different from start time';
    }

    const breaks = entry.breaks || [];
    const breakErrors = {};

    breaks.forEach((brk, idx) => {
      const bStart = toMins(brk.start);
      const bEnd = toMins(brk.end);

      if (bStart === null || bEnd === null) {
        breakErrors[idx] = 'Both break start and end times are required';
        return;
      }

      if (bEnd <= bStart) {
        breakErrors[idx] = 'Break end time must be after break start time';
        return;
      }

      if (!dayErrors.window && !isOvernight && (bStart < start || bEnd > end)) {
        breakErrors[idx] = 'Break must be within working hours';
        return;
      }

      breaks.forEach((other, otherIdx) => {
        if (otherIdx <= idx) return;
        const oStart = toMins(other.start);
        const oEnd = toMins(other.end);
        if (oStart === null || oEnd === null) return;
        if (bStart < oEnd && oStart < bEnd) {
          breakErrors[idx] = `Overlaps with break ${otherIdx + 1}`;
          breakErrors[otherIdx] = `Overlaps with break ${idx + 1}`;
        }
      });
    });

    if (Object.keys(breakErrors).length > 0) dayErrors.breaks = breakErrors;
    if (Object.keys(dayErrors).length > 0) errors[day] = dayErrors;
  });

  return errors;
}

export function formatOperatingTime(value) {
  if (!value) return '—';
  return value;
}

export function getOperatingHours(provider) {
  return provider?.operatingHours ?? SAMPLE_OPERATING_HOURS;
}
