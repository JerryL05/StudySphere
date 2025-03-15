// frontend/src/api/roomService.js

/**
 * Calls the /api/rooms endpoint, passing building and time range (start/end).
 *
 * @param {string} building    e.g. "Koerner" or "" for all
 * @param {Date} startDateTime JS Date object for the start
 * @param {Date} endDateTime   JS Date object for the end
 * @returns {Promise<Array>}   A list of room objects from the Flask backend
 */
export async function fetchRooms(building, startDateTime, endDateTime) {
  // Convert Dates -> "YYYY-MM-DDTHH:MM" strings
  // e.g. "2025-03-15T09:00"
  const startStr = toLocalISO(startDateTime);
  const endStr = toLocalISO(endDateTime);

  // GET /api/rooms?building=...&start=...&end=...
  const response = await fetch(
    `/api/rooms?building=${encodeURIComponent(building)}&start=${startStr}&end=${endStr}`
  );

  if (!response.ok) {
    // 404, 500, or other error
    const errorText = await response.text();
    throw new Error(`fetchRooms failed: ${response.status} - ${errorText}`);
  }

  return await response.json(); // array of rooms
}

/**
 * Calls the /api/scrape endpoint, sending start/end times/dates as JSON.
 *
 * @param {Date} startDateTime JS Date object for the start
 * @param {Date} endDateTime   JS Date object for the end
 * @returns {Promise<Object>}  An object with e.g. { message: "Scrape completed!" }
 */
export async function startScrape(startDateTime, endDateTime) {
  // In your actual Webscrape logic, you might break date/time into "HH:MM" and "YYYY-MM-DD"
  // For a simple example, let's just pass them in ISO form.
  // Adjust if your Python code expects a different format.
  const startStr = toLocalISO(startDateTime);
  const endStr = toLocalISO(endDateTime);

  // POST /api/scrape
  const response = await fetch('/api/scrape', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      // If your Python code expects "start_time", "end_time", "start_date", "end_date"
      // in HH:MM and YYYY-MM-DD, consider splitting them up. Example:
      start_time: formatTime(startDateTime),
      end_time: formatTime(endDateTime),
      start_date: formatDate(startDateTime),
      end_date: formatDate(endDateTime),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`startScrape failed: ${response.status} - ${errorText}`);
  }

  return await response.json(); // e.g. { message: "Scrape completed!" }
}

/**
 * Helper: Convert a JS Date -> "YYYY-MM-DDTHH:MM" in local time zone
 * (Matches typical HTML <input type="datetime-local"> format).
 */
function toLocalISO(dateObj) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Helper: Convert a JS Date -> "HH:MM" (24-hour format).
 */
function formatTime(dateObj) {
  const hh = String(dateObj.getHours()).padStart(2, '0');
  const mm = String(dateObj.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

/**
 * Helper: Convert a JS Date -> "YYYY-MM-DD".
 */
function formatDate(dateObj) {
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
