// Utils - helper functions

// Minutes from day 1 midnight. Day is part of the value, so callers must not wrap a negative result.
function timeToMinutes(timeStr, day = 1) {
  if (!timeStr) return null;
  const [hours, minutes] = timeStr.split(':').map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes + (day - 1) * 1440;
}

// Add minutes. `day` is the day of `time`; it carries forward across midnight.
function addMinutes(time, minutes, day = 1) {
  const [h, m] = time.split(':').map(Number);
  let totalMinutes = h * 60 + m + minutes;
  let nextDay = day;
  while (totalMinutes >= 1440) {
    totalMinutes -= 1440;
    nextDay++;
  }
  const newHour = Math.floor(totalMinutes / 60);
  const newMin = totalMinutes % 60;
  return {
    time: `${newHour.toString().padStart(2, '0')}:${newMin.toString().padStart(2, '0')}`,
    day: nextDay
  };
}

function calculateDuration(startTime, startDay, endTime, endDay) {
  const startMinutes = timeToMinutes(startTime, startDay);
  const endMinutes = timeToMinutes(endTime, endDay);
  if (startMinutes === null || endMinutes === null) return null;
  return endMinutes - startMinutes;
}

function formatDuration(minutes) {
  if (minutes === null || minutes < 0) return 'N/A';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

module.exports = { timeToMinutes, addMinutes, calculateDuration, formatDuration };
