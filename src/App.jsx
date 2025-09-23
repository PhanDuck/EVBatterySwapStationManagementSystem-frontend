
import './App.css'; 

function App() {
  const h1Styles = {
    fontSize: '80px',
    fontFamily: 'sans-serif',
    color: '#fff',
    animation: 'neon-flicker 1.5s infinite alternate',
    textAlign: 'center'
  };

  const containerStyles = {
    backgroundColor: '#000',
    padding: '20px'
  };

  return (
    <div style={containerStyles}>
      <h1 style={h1Styles}>demo deploy</h1>
    </div>
  );
}

export default App;