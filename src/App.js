import React from "react";
import "./App.css";
import LiveChart from "./container/LiveChart";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      width : window.screen.width
    }
    this.resize = this.resize.bind(this)
  }

  componentDidMount() {
    window.addEventListener('resize', this.resize);
  }

  componentDidUnmount() {
    window.removeEventListener('resize', this.resize)
  }

  resize() {
    this.setState( {
      width: document.body.offsetWidth
    })
  }
 
  render() {
    return (
      <div className="App">
        <LiveChart
          data={[]}
          width={this.state.width}
          height={window.screen.height - 400}
          startTime={new Date()}
        />
      </div>
    );
  }
}

export default App;
