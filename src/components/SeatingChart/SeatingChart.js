import React, { useState, useEffect } from 'react';
import './SeatingChart.css';
import Seat from './Seat';

function SeatingChart() {
  const [rows, setRows] = useState(5);
  const [columns, setColumns] = useState(6);
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [studentName, setStudentName] = useState('');

  // Initialize empty seating chart
  useEffect(() => {
    const initialSeats = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        initialSeats.push({
          id: `${row}-${col}`,
          row,
          col,
          student: null,
          isSelected: false
        });
      }
    }
    setSeats(initialSeats);
  }, [rows, columns]);

  // Handle selecting a seat
  const handleSeatClick = (seatId) => {
    const updatedSeats = seats.map(seat => ({
      ...seat,
      isSelected: seat.id === seatId
    }));
    
    setSeats(updatedSeats);
    const selectedSeat = updatedSeats.find(seat => seat.id === seatId);
    setSelectedSeat(selectedSeat);
    
    if (selectedSeat && selectedSeat.student) {
      setStudentName(selectedSeat.student);
      setEditMode(true);
    } else {
      setStudentName('');
      setEditMode(false);
    }
  };

  // Assign student to seat
  const assignStudent = () => {
    if (!selectedSeat || !studentName.trim()) return;
    
    const updatedSeats = seats.map(seat => 
      seat.id === selectedSeat.id 
        ? { ...seat, student: studentName } 
        : seat
    );
    
    setSeats(updatedSeats);
    setStudentName('');
    setSelectedSeat(null);
    setEditMode(false);
  };

  // Remove student from seat
  const removeStudent = () => {
    if (!selectedSeat) return;
    
    const updatedSeats = seats.map(seat => 
      seat.id === selectedSeat.id 
        ? { ...seat, student: null } 
        : seat
    );
    
    setSeats(updatedSeats);
    setStudentName('');
    setSelectedSeat(null);
    setEditMode(false);
  };

  // Update rows and columns
  const updateLayout = () => {
    // Preserve student names when possible
    const studentMap = {};
    seats.forEach(seat => {
      if (seat.student) {
        studentMap[seat.id] = seat.student;
      }
    });
    
    const newSeats = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const id = `${row}-${col}`;
        newSeats.push({
          id,
          row,
          col,
          student: studentMap[id] || null,
          isSelected: false
        });
      }
    }
    setSeats(newSeats);
  };

  // Clear all student assignments
  const clearAll = () => {
    const clearedSeats = seats.map(seat => ({
      ...seat,
      student: null,
      isSelected: false
    }));
    setSeats(clearedSeats);
    setSelectedSeat(null);
    setStudentName('');
    setEditMode(false);
  };

  return (
    <div className="seating-chart-container">
      <h2>Classroom Seating Chart</h2>
      
      <div className="layout-controls">
        <div>
          <label>Rows:</label>
          <input 
            type="number" 
            min="1" 
            max="10" 
            value={rows} 
            onChange={(e) => setRows(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))} 
          />
        </div>
        <div>
          <label>Columns:</label>
          <input 
            type="number" 
            min="1" 
            max="10" 
            value={columns} 
            onChange={(e) => setColumns(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))} 
          />
        </div>
        <button onClick={updateLayout}>Update Layout</button>
        <button onClick={clearAll}>Clear All</button>
      </div>

      <div 
        className="seating-grid" 
        style={{ 
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`
        }}
      >
        {seats.map(seat => (
          <Seat 
            key={seat.id}
            id={seat.id}
            student={seat.student}
            isSelected={seat.isSelected}
            onClick={() => handleSeatClick(seat.id)}
          />
        ))}
      </div>

      <div className="seat-editor">
        <h3>{editMode ? 'Edit Student' : 'Add Student'}</h3>
        {selectedSeat ? (
          <>
            <p>Selected seat: Row {selectedSeat.row + 1}, Column {selectedSeat.col + 1}</p>
            <input
              type="text"
              placeholder="Student name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
            />
            <div className="editor-buttons">
              <button onClick={assignStudent}>
                {editMode ? 'Update' : 'Assign'}
              </button>
              {editMode && <button onClick={removeStudent}>Remove</button>}
            </div>
          </>
        ) : (
          <p>Select a seat to assign a student</p>
        )}
      </div>
    </div>
  );
}

export default SeatingChart; 