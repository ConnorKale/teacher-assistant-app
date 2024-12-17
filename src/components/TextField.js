import React from 'react';

function TextField({ id, label, variant, value, onChange }) {
  return (
    <div className={`text-field ${variant}`}>
      <label htmlFor={id}>{label}</label>
      <input id={id} type="text" value={value} onChange={onChange} />
    </div>
  );
}

export default TextField;