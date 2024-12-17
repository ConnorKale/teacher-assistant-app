import React from 'react';

function Footer(props) {
    return (
        <footer className="App-footer">
            <f1>{props.title}</f1>
            <f2>{props.subtitle}</f2>
            <p>{props.description}</p>
        </footer>
    );
}

export default Footer;