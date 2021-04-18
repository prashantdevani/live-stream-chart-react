import React from "react";
import LiveChartView from "../components/LiveChartView";
import DateTimePicker from "react-datetime-picker";
import * as STATIC from "../common/static";

//const config = require(`../config/${process.env.APP_ENV}`)
const config = require(`../config/local`);

function rendomNumber(min, max) {
  if (min >= max) {
    return new Error("Min number should be less then max number");
  }
  return Math.floor(Math.random() * (max - min)) + min;
}

class LiveChart extends React.Component {
  constructor(props) {
    super(props);
    this.defaulSpeed = 50; // 0.05 seconde
    this.state = {
      data: [],
      speedOptions: [1, 2, 5, 10, 30, 100],
      startTime: props.startTime,
      speedValue: 1,
      buttonLable: "stop",
      webSocketstatus: STATIC.websocket.disconnected,
    };
    this.delay = 0; // 0 secondes

    this.onSelectSpeed = this.onSelectSpeed.bind(this);
    this.startTimer = this.startTimer.bind(this);
    this.clearTimer = this.clearTimer.bind(this);
    this.chartFlowHandler = this.chartFlowHandler.bind(this);
    this.wsConnect = this.wsConnect.bind(this);
    this.onChangeDateTime = this.onChangeDateTime.bind(this);
  }

  startTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
    this.timerId = setInterval(() => {
      const newTime = new Date(
        this.state.startTime.getTime() +
          (this.defaulSpeed + 100 * this.state.speedValue)
      );
      const wsCurrentStatus = this.ws.readyState;

      let webSocketstatus;
      if (wsCurrentStatus === WebSocket.OPEN) {
        webSocketstatus = STATIC.websocket.connected;
      } else if (wsCurrentStatus === WebSocket.CONNECTING) {
        webSocketstatus = STATIC.websocket.connecting;
      } else if (wsCurrentStatus === WebSocket.CLOSING) {
        webSocketstatus = STATIC.websocket.disconnecting;
      } else if (wsCurrentStatus === WebSocket.CLOSED) {
        this.wsConnect();
        webSocketstatus = STATIC.websocket.disconnected;
      }

      this.setState({
        startTime: newTime,
        webSocketstatus,
      });
      if (wsCurrentStatus === WebSocket.OPEN && this.delay === 0) {
        this.ws.send(
          JSON.stringify({
            startTime: newTime.getTime(),
            topActiveUsers: 5,
            fixedVisitor: true,
          })
        );
      } else {
        this.setState({
          data: [],
          webSocketstatus,
        });
        this.delay = this.delay > 0 ? this.delay - 1000 : 0;
      }
    }, this.defaulSpeed);
  }

  clearTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  wsConnect() {
    this.ws = new WebSocket(config.endpoints.ws.chartData);
    this.ws.onopen = () => {
      this.setState({
        webSocketstatus: STATIC.websocket.connected,
      });
    };
    this.ws.onclose = (e) => {
      this.setState({
        webSocketstatus: STATIC.websocket.disconnected,
      });
    };
    this.ws.onerror = (err) => {
      this.setState({
        webSocketstatus: STATIC.websocket.disconnected,
      });
      this.ws.close();
    };

    this.ws.onmessage = (evt) => {
      const data = JSON.parse(evt.data);
      this.setState({
        data: data,
      });

      this.delay = (1000 / this.state.speedValue) * rendomNumber(1, 10); // 1 to 10 secondes
    };
  }

  componentDidMount() {
    this.wsConnect();
    this.startTimer();
  }

  componentWillUnmount() {
    this.ws.close();
  }

  async onSelectSpeed(e) {
    await this.setState({
      speedValue: +e.target.value,
    });
    if (this.state.buttonLable === STATIC.btn.stop) {
      this.startTimer();
    }
  }

  chartFlowHandler(e) {
    if (this.state.buttonLable === STATIC.btn.stop) {
      this.clearTimer();
      this.setState({
        buttonLable: STATIC.btn.start,
      });
    } else {
      this.startTimer();
      this.setState({
        buttonLable: STATIC.btn.stop,
      });
    }
  }

  async onChangeDateTime(time) {
    if (this.state.startTime.getTime() !== time.getTime()) {
      await this.setState({
        startTime: time,
      });
      if (this.state.buttonLable === STATIC.btn.stop) {
        this.startTimer();
      }
    }
  }
  render() {
    return (
      <>
        <div>
          <br />
          Speed{" "}
          <select id="speed" className={"input"} onChange={this.onSelectSpeed}>
            {this.state.speedOptions.map((speed) => (
              <option value={speed} key={speed}>
                x{speed}
              </option>
            ))}
          </select>
          <DateTimePicker
            className={"input date-picker"}
            onChange={this.onChangeDateTime}
            value={this.state.startTime}
            clearIcon={null}
            // calendarIcon={null}
            disableCalendar={false}
          />
          <button
            style={{ marginLeft: "10px" }}
            className={"input"}
            onClick={this.chartFlowHandler}
          >
            {this.state.buttonLable}
          </button>
          <div className="web-socket-status">
            WebSocket Status:{" "}
            <b className={`ws-${this.state.webSocketstatus.toLowerCase()}`}>
              {this.state.webSocketstatus}
            </b>
          </div>
        </div>
        <div>
          <LiveChartView
            {...this.props}
            data={this.state.data}
            startTime={this.state.startTime}
          />
        </div>
      </>
    );
  }
}

LiveChart.defaultProps = {
  data: [],
  startTime: new Date(),
}

export default LiveChart;
