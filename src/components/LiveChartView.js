import * as d3 from "d3";
import React from "react";
import _ from "lodash";

class LiveChartView extends React.Component {
  constructor(props) {
    super(props);
    this.data = [];
  }

  componentDidMount() {
    this.drawChart(this.props);
  }

 componentWillReceiveProps(nextProps) {
    if(nextProps.time != this.props.time) {
     this.drawChart(nextProps);
   }
 }

  drawChart(props) {
    this.data.push(...props.data);
    const transitionDuration = props.transitionDuration;
    const dataset = this.data;
    let addingPading = 50;
    const visiterNames = dataset.map((d) => d.visiter_name);

    const margin = { top: 40, right: 150, bottom: 60, left: 30 },
      width = props.width - (margin.left + addingPading) - margin.right,
      height = props.height - margin.top - margin.bottom;

    const svgWidth = width + margin.left + margin.right;
    const svgHeight = height + margin.top + margin.bottom;
    const svg = d3
      .select("#chart")
      .selectAll("svg")
      .data([1])
      .join("svg")
      .attr("width", svgWidth)
      .attr("height", svgHeight)
      .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
      .selectAll(".main")
      .data([1])
      .join("g")
      .attr("class", "main")
      .attr(
        "transform",
        "translate(" + (margin.left + addingPading) + "," + margin.top + ")"
      );

    var color = d3
      .scaleOrdinal()
      .domain(visiterNames)
      .range([
        "gold",
        "blue",
        "green",
        "yellow",
        "black",
        "grey",
        "darkgreen",
        "pink",
        "brown",
        "slateblue",
        "grey1",
        "orange",
      ]);
    // set the ranges
    const startTime = props.time;
    const endTime = startTime + 30000;
    var x = d3
      .scaleLinear()
      .domain([startTime, endTime])
      .range([0, width + 300])
      // .nice()
      .clamp(false);

    var y = d3.scaleBand().domain(visiterNames).range([height, 0]);

    const xAxis = svg
      .selectAll(".xAxis")
      .data([1])
      .join("g")
      .attr("class", "xAxis grid")
      .style("font-size", "15px")
      .attr("transform", "translate(0," + height + ")")
      // .transition()
      // .duration(transitionDuration)
      .call(d3.axisBottom(x).ticks(10).tickFormat(d3.timeFormat("%H:%M:%S")));

    const yAxis = svg
      .selectAll(".yAxis")
      .data([1])
      .join("g")
      .attr("class", "yAxis grid")
      .style("font-size", "15px")
      // .transition()
      // .duration(transitionDuration)
      .call(d3.axisLeft(y));

    const xAxisGrid = d3
      .axisBottom(x)
      .tickSize(-height)
      .tickFormat("")
      .ticks(10);
    const yAxisGrid = d3.axisLeft(y).tickSize(-svgWidth).tickFormat("");

    svg
      .selectAll(".x-axis-grid")
      .data([1])
      .join("g")
      .attr("class", "x-axis-grid axis-grid ")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxisGrid);

    svg
      .selectAll(".y-axis-grid")
      .data([1])
      .join("g")
      .attr("class", "y-axis-grid axis-grid ")
      .attr("clip-path", "url(#myClip)")
      .call(yAxisGrid);

    svg
      .selectAll("defs")
      .data([1])
      .join("defs")
      .selectAll("clipPath")
      .data([1])
      .join("clipPath")
      .attr("id", "myClip")
      .selectAll("rect")
      .data([1])
      .join("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", props.width)
      .attr("height", height);
    // Add bubbles
    const bBody = svg
      .selectAll(".b-body")
      .data([1])
      .join("g")
      .attr("class", "b-body")
      .attr("clip-path", "url(#myClip)");

    const bubble = bBody
      .selectAll(".bubble")
      .data(dataset)
      // .join(
      //   (enter) =>
      //     enter
      //       .append("circle")
      //       .attr("cx", (d) => x(d.date))
      //       .attr("cy", (d) => y(d.visiter_name) + y.bandwidth() / 2),
      //   (update) => update,
      //   (exit) => exit.remove()
      // )
      // .transition()
      // .duration(transitionDuration)
      .join("circle")
      .attr("cx", (d) => x(d.date))
      .attr("cy", (d) => y(d.visiter_name) + y.bandwidth() / 2)
      .attr("r", (d) => d.size)
      .attr("class", "bubble")
      .style("fill", (d) => color(d.visiter_name))
      .style("opacity", "0.5")
      .attr("stroke", "black");
  }

  render() {
    return <div id="chart" />;
  }
}

export default LiveChartView;
