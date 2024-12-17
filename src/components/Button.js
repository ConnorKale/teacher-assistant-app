import React from 'react';

function Button(props) {
    const handleClick = () => {
        window.location.href = props.url;
    };
    
      return (
        <button onClick={handleClick} className="App-button">
            <b1>{props.text}</b1>
        </button>
    );
}

export default Button;