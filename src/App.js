import logo from './logo.svg';
import './App.css';
import LiveChart from './container/LiveChart'

function App() {
  return (
    <div className="App">
        <LiveChart data={[]} width={window.screen.width} height={window.screen.height - 400} time={new Date().getTime()}/>
    </div>
  );
}

export default App;
