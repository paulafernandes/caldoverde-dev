// Horário semanal: um intervalo por linha, dias 1 (segunda) a 7 (domingo, ISO 8601).
// Se a hora de fecho for anterior à de abertura, o intervalo termina no dia seguinte.

export const DAYS_OF_WEEK = [1, 2, 3, 4, 5, 6, 7];

export const MAX_OPENING_HOURS_PER_DAY = 6;

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const MINUTES_PER_DAY = 24 * 60;

const MINUTES_PER_WEEK = DAYS_OF_WEEK.length * MINUTES_PER_DAY;

export function isValidOpeningHourTime(value) {
  return typeof value === "string" && TIME_PATTERN.test(value);
}

function toMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
}

// Minutos desde segunda às 00:00; o fim pode passar para o dia seguinte.
function getWeekRange({ dayOfWeek, opensAt, closesAt }) {
  const start = (dayOfWeek - 1) * MINUTES_PER_DAY + toMinutes(opensAt);

  const duration =
    (toMinutes(closesAt) - toMinutes(opensAt) + MINUTES_PER_DAY) %
    MINUTES_PER_DAY;

  return {
    start,
    end: start + duration,
  };
}

// O deslocamento de uma semana cobre a passagem de domingo para segunda.
function rangesOverlap(first, second) {
  return [-MINUTES_PER_WEEK, 0, MINUTES_PER_WEEK].some(
    (shift) =>
      first.start < second.end + shift && second.start + shift < first.end
  );
}

// Índices dos intervalos que se sobrepõem a outro, no mesmo dia ou no seguinte.
// Pressupõe dias e horas válidos e abertura diferente do fecho.
export function findOverlappingOpeningHours(openingHours) {
  const ranges = openingHours.map(getWeekRange);
  const overlappingIndexes = new Set();

  for (let first = 0; first < ranges.length; first += 1) {
    for (let second = first + 1; second < ranges.length; second += 1) {
      if (rangesOverlap(ranges[first], ranges[second])) {
        overlappingIndexes.add(first);
        overlappingIndexes.add(second);
      }
    }
  }

  return [...overlappingIndexes].sort((first, second) => first - second);
}
