import React from 'react';
import PropTypes from 'prop-types';

function Seat({ id, student, isSelected, onClick }) {
  return (
    <div 
      className={`seat ${isSelected ? 'selected' : ''} ${student ? 'occupied' : 'empty'}`}
      onClick={onClick}
    >
      {student ? (
        <div className="student-name">{student}</div>
      ) : (
        <div className="empty-seat">Empty</div>
      )}
    </div>
  );
}

Seat.propTypes = {
  id: PropTypes.string.isRequired,
  student: PropTypes.string,
  isSelected: PropTypes.bool,
  onClick: PropTypes.func.isRequired
};

Seat.defaultProps = {
  student: null,
  isSelected: false
};

export default Seat; 