import React from 'react';
import PropTypes from 'prop-types';

function BadCalculatorDisplay({ value }) {
  return (
    <div className="badCalculatorDisplay">
      {value}
    </div>
  );
}

BadCalculatorDisplay.propTypes = {
  value: PropTypes.string.isRequired,
};

export default BadCalculatorDisplay;