import React, { useState, useEffect } from "react";
import LiveChartView from "../components/LiveChartView";

function rendomNumber(min, max) {
  if (min >= max) {
    return new Error("Min number should be less then max number");
  }
  return Math.floor(Math.random() * (max - min)) + min;
}

class LiveChart extends React.Component {
  
  constructor(props) {
    super(props);
    this.defaulSpeed = 1000 // 1 seconde
    this.state = {
      data: [],
      speedOptions: [1, 5, 10 ,20, 50],
      time: props.time,
      speed: 1000,
      buttonLable: 'stop'
    };
    this.delay = 0 // 0 secondes

    this.onSelectSpeed = this.onSelectSpeed.bind(this)
    this.startTimer = this.startTimer.bind(this)
    this.clearTimer = this.clearTimer.bind(this)
    this.chartFlowHandler = this.chartFlowHandler.bind(this)
  }

  startTimer() {
    if(this.timerId) {
      clearInterval(this.timerId)
    }
    this.timerId = setInterval(() => {
      const newTime = this.state.time + 1000;
      /*  axios
        .post("http://localhost:12345/chartData", {
          time: newTime,
          topActiveUsers: 5,
          fixedUsers: true,
        })
        .then((response) => {
          this.setState({
            data: response.data,
            time: newTime,
          });
        }); */

      this.setState({
        time: newTime,
      });
      if (this.ws.readyState === WebSocket.OPEN && this.delay === 0) {
        this.ws.send(
          JSON.stringify({
            time: newTime,
            topActiveUsers: 5,
            fixedUsers: true,
          })
        );
      } else {
        this.setState({
          data: []
        })
        this.delay = this.delay > 0 ? this.delay - 1000 : 0
      }
    }, this.state.speed);
  }

  clearTimer() {
    if(this.timerId) {
      clearInterval(this.timerId)
    }
  }

  componentDidMount() {
    this.ws = new WebSocket("ws://localhost:12345/chartData");
    this.ws.onopen = () => {
      console.log("connected websocket main component");
    };
    this.ws.onclose = (e) => {
      console.log(
        `Socket is closed. Reconnect will be attempted in second.`,
        e.reason
      );
    };
    this.ws.onerror = (err) => {
      console.error(
        "Socket encountered error: ",
        err.message,
        "Closing socket"
      );

      this.ws.close();
    };

    this.ws.onmessage = (evt) => {
      const data = JSON.parse(evt.data);
      this.setState({
        data: data,
      });

      this.delay = 1000 * rendomNumber(1, 10) // 10 secondes
    };

    this.ws.onclose = () => {
      console.log("disconnected");
    };

    this.startTimer()
  }

  componentWillUnmount() {
    this.ws.close();
  }

  onSelectSpeed(e) {
    const newSpeed = this.defaulSpeed / +e.target.value
    this.setState({
      speed: newSpeed
    }, () => {
      if(this.state.buttonLable === "stop") { 
        this.startTimer();
      }
    })
  }

  chartFlowHandler(e) {
    if(this.state.buttonLable === "stop") {
      this.clearTimer()
      this.setState({
        buttonLable: "start"
      })
    } else {
      this.startTimer()
      this.setState({
        buttonLable: "stop"
      })
    }
  }

  render() {
    return (
      <div>
        <br />
        Speed 
        <select id="speed" onChange={this.onSelectSpeed}>
          {this.state.speedOptions.map(speed => (<option value={speed}>x{speed}</option>))}
        </select> 
        <button style={{marginLeft: "10px"}} onClick={this.chartFlowHandler}> {this.state.buttonLable} </button>
        <LiveChartView
          {...this.props}
          data={this.state.data}
          time={this.state.time}
          transitionDuration={this.state.speed}
        />
     </div>
    );
  }
}
export default LiveChart;
