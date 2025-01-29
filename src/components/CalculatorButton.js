import React from 'react';
import PropTypes from 'prop-types';

function CalculatorButton({ label, onClick }) {
  return (
    <button className="CalculatorButton" onClick={() => onClick(label)}>
      {label}
    </button>
  );
}

CalculatorButton.propTypes = {
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default  CalculatorButton;