// App.jsx
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './DatePickerInline.css'; // Your custom CSS
import RoomList from './RoomList';

// Helper functions to format date/time
function toLocalISO(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  const hh = String(dateObj.getHours()).padStart(2, '0');
  const mm = String(dateObj.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d}T${hh}:${mm}`;
}

function App() {
    // initialize states
  const [building, setBuilding] = useState(''); // empty => All
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const defaultStart = new Date();
  defaultStart.setHours(12, 0, 0, 0);
  const defaultEnd = new Date();
  defaultEnd.setHours(14, 0, 0, 0);
  const [startDate, setStartDate] = useState(defaultStart); // set the default start time to 12:00 PM
  const [endDate, setEndDate] = useState(defaultEnd); // set the default end time to 2:00 PM
  // Trigger API call when user clicks "Start Search"
  const handleScrape = async () => {
    if (startDate >= endDate) {
      alert('Start must be before End!');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const startStr = toLocalISO(startDate);
      const endStr = toLocalISO(endDate);
      const query = `/api/rooms?building=${encodeURIComponent(building)}&start=${startStr}&end=${endStr}`;
      const response = await fetch(query);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to load rooms: ${response.status} - ${text}`);
      }
      const data = await response.json();
      setRooms(data);
      setMessage("Rooms loaded successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.mainTitle}>UBC Study Sphere</h1>
      <h2 style={styles.subTitle}>Pick Your Start and End Times</h2>
      <div style={styles.calendarsRow}>
        {/* START DatePicker */}
        <div style={styles.calendarContainer}>
          <label style={styles.label}>Start:</label>
          <DatePicker
            inline
            showTimeSelect
            timeIntervals={60}
            dateFormat="MM/dd/yyyy, h:mm aa"
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            minDate={new Date()}
            className="datepicker-inline"
          />
        </div>

        {/* END DatePicker */}
        <div style={styles.calendarContainer}>
          <label style={styles.label}>End:</label>
          <DatePicker
            inline
            showTimeSelect
            timeIntervals={60}
            dateFormat="MM/dd/yyyy, h:mm aa"
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            minDate={new Date()}
            className="datepicker-inline"
          />
        </div>
      </div>

      <button onClick={handleScrape} style={styles.button}>
        Start Search
      </button>

      <p>{message}</p>
      {loading && <p>Loading rooms...</p>}
      {error && <p>Error: {error}</p>}

      {/* Render RoomList to automatically fetch rooms based on the current selection */}
      <RoomList
        rooms={rooms}
      />
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    width: '100vw',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #141627 0%, #33315b 100%)',
    color: '#fff',
    padding: '20px',
  },
  mainTitle: {
    fontSize: '2rem',
    marginBottom: '0.5rem',
  },
  subTitle: {
    fontSize: '1.25rem',
    marginBottom: '2rem',
  },
  calendarsRow: {
    display: 'flex',
    gap: '40px',
    marginBottom: '1rem',
    flexWrap: 'wrap',
  },
  calendarContainer: {
    backgroundColor: '#2f2c4f',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
  },
  label: {
    display: 'block',
    marginBottom: '10px',
    fontWeight: 'bold',
  },
  button: {
    padding: '10px 20px',
    fontSize: '1rem',
    borderRadius: '6px',
    border: '1px solid #fff',
    backgroundColor: 'transparent',
    color: '#fff',
    cursor: 'pointer',
    marginTop: '20px',
  },
};

export default App;
