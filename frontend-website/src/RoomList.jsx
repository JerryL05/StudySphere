// src/components/RoomList.jsx
import React from 'react';

// Example dictionary that maps building group strings to a single photo
const buildingImages = {
  'MAA Library - Digital Media Rooms': '/images/maa_building.jpg',
  'Koerner Group Study Rooms': '/images/koerner_building.jpg',
  'Woodward Library Group Study Rooms': '/images/woodward_building.jpg',
  'Research Commons Project Rooms': '/images/research_commons_building.jpg'
};

// Fallback if the group isn't found in the dictionary
const defaultBuildingImage = '/images/default_building.png';
function RoomList({ rooms }) {
  if (!rooms) {
    return <p>No rooms available</p>;
  }

  return (
    <ul style={styles.list}>
      {rooms.map((room, idx) => {
        // Get building image by matching the group field
        const buildingImage = buildingImages[room.group] || defaultBuildingImage;

        return (
          <li key={idx} style={styles.listItem}>
            {/* Single photo representing the building */}
            <img
              src={buildingImage}
              alt={room.group}
              style={styles.thumbnail}
            />
            <div style={styles.infoContainer}>
              <p style={styles.roomName}>
                {room.room_num} - {room.group}
              </p>
              <p style={styles.times}>
                {room.date} from {room.start_time} to {room.end_time}
              </p>
              {/* Clickable link to booking page */}
              <a
                href={room.url}
                target="_blank"
                rel="noreferrer"
                style={styles.bookLink}
              >
                Book this room
              </a>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

// Inline style objects for quick layout
const styles = {
  list: {
    listStyle: 'none',
    padding: 0,
    margin: '20px 0',
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '15px',
    backgroundColor: '#2f2c4f',
    padding: '10px',
    borderRadius: '8px',
  },
  thumbnail: {
    width: '120px',
    height: '100px',
    objectFit: 'cover',
    borderRadius: '4px',
    marginRight: '15px',
  },
  infoContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  roomName: {
    fontWeight: 'bold',
    fontSize: '1rem',
    margin: 0,
  },
  times: {
    margin: '4px 0',
  },
  bookLink: {
    color: '#00bfff',
    textDecoration: 'none',
    marginTop: '4px',
  },
};

export default RoomList;
