import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Button from './components/Button';
import TextField from './components/TextField';
import Checkbox from './components/Checkbox';
import Dropdown from './components/Dropdown';
import BadCalculator from './components/LLM Caculator/BadCalculator';
import SeatingChart from './components/SeatingChart/SeatingChart';

function App() {
  const [inputValue, setInputValue] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [activeComponent, setActiveComponent] = useState('home');

  const handleChange = (event) => {
    if (event && event.target) {
      console.log('Input value changed:', event.target.value);
      setInputValue(event.target.value);
    } else {
      console.error('Event or event.target is undefined');
    }
  };

  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
  };

  const renderComponent = () => {
    switch (activeComponent) {
      case 'calculator':
        return <BadCalculator />;
      case 'seating':
        return <SeatingChart />;
      default:
        return (
          <>
            <Button text="Click me!" url='https://arxiv.org/' />
            <Checkbox id="example-checkbox" className="App-checkbox" label="Check me!" checked={isChecked} onChange={handleCheckboxChange} />
            <Button text="Or me!" url='https://snarxiv.org/vs-arxiv/' />
            <TextField id="outlined-basic" label="Type here:" variant="outlined" value={inputValue} onChange={handleChange} />
            <Dropdown label="Select an option">
              <div>Option 1</div>
              <div>Option 2</div>
              <div>Option 3</div>
            </Dropdown>
            <spinny className="App-spinny">
              <img src={logo} className="App-logo" alt="logo" />
              <p>
                Edit <code>src/App.js</code> and save to reload.
              </p>
              <a
                className="App-link"
                href="https://reactjs.org"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn React
              </a>
              <b>Hello world!</b>
            </spinny>
          </>
        );
    }
  };

  return (
    <div className="App">
      <Header title="Teacher Assistant App" description="Your digital classroom helper" />
      <nav className="app-nav">
        <button onClick={() => setActiveComponent('home')}>Home</button>
        <button onClick={() => setActiveComponent('calculator')}>Calculator</button>
        <button onClick={() => setActiveComponent('seating')}>Seating Chart</button>
      </nav>
      <main className="app-content">
        {renderComponent()}
      </main>
      <Footer title="Terms of Service:" subtitle="(By continuing to use this website, clicking any buttons, or typing into any text boxes, or losing The Game, you agree to the terms of service.)" description="By using this service you agree to offer your soul upon request. You are not permitted to stop using this service. These terms supersede all applicable laws, regualtions, international treaties, and other existing regulation. If this is found to be unenforcable in a court of law, it remains in force. We may update these terms of service at any time. You lose The Game again." />
    </div>
  );
}

export default App;
