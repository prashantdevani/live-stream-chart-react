import * as d3 from "d3";
import React from "react";

import * as STATIC from '../common/static';
import * as utilities from "../common/utilities";

class LiveChartView extends React.Component {
  constructor(props) {
    super(props);
    this.data = [];
    this.colors = {}
  }

  componentDidMount() {
    this.drawChart(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.startTime.getTime() !== this.props.startTime.getTime()) {
      this.drawChart(nextProps);
    }
  }

  drawChart(props) {
    this.data.push(...props.data);
    const tooltip = d3.select("#tooltip");
    const transitionDuration = props.transitionDuration;
    // data for x axis
    const dataset = this.data;
    const dataSize = this.data.length;
    // visites array for y axis
    const visitorsNames = [];

    for (let i = 0; i < dataSize - 1; i++) {
      const dataInfo = dataset[i];
      if(!this.colors.hasOwnProperty(dataInfo.visitor_id)) {
        var randomColor = utilities.randomColor();
        // adding random color in this,colros as visitor_id
        this.colors[dataInfo.visitor_id] = randomColor;
      }
      if(visitorsNames.indexOf(dataInfo.visitor_name) <= -1) {
        visitorsNames.push(dataInfo.visitor_name)
      }
    }
    
    visitorsNames.sort(d3.descending)

    // svg overall calculation for width and height 
    const margin = { top: 40, right: 40, bottom: 60, left: 110 },
      width = props.width - margin.left - margin.right,
      height = props.height - margin.top - margin.bottom;

    // svg width
    const svgWidth = width + margin.left + margin.right;
    // svg height
    const svgHeight = height + margin.top + margin.bottom;
    // selcting svg element from dom and setiing up attributes.
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
        "translate(" + margin.left + "," + margin.top + ")"
      );

    const colorDomain = Object.keys(this.colors);
    const colorRange = Object.values(this.colors);
    // Building color scheme for y axis 
    var color = d3
      .scaleOrdinal()
      .domain(colorDomain)
      .range(colorRange)

    const startTime = props.startTime.getTime();
    // adding 40 secondes gab between start time and end time  
    const endTime = startTime + 40000;
    
    // x axis scale
    var x = d3
      .scaleLinear()
      .domain([startTime, endTime])
      .range([0, width])
      // .nice()
      .clamp(false);

    // y axis scale
    var y = d3.scaleBand().domain(visitorsNames).range([height, 0]);

    // drawing x axis
    const xAxis = svg
      .selectAll(".xAxis")
      .data([1])
      .join("g")
      .attr("class", "xAxis grid")
      .style("font-size", "15px")
      .attr("transform", "translate(0," + height + ")")
      // .transition()
      // .duration(transitionDuration)
      .call(d3.axisBottom(x).ticks(20).tickFormat(d3.timeFormat("%H:%M:%S")));

    // drawing y axis
    const yAxis = svg
      .selectAll(".yAxis")
      .data([1])
      .join("g")
      .attr("class", "yAxis grid")
      .style("font-size", "15px")
      // .transition()
      // .duration(transitionDuration)
      .call(d3.axisLeft(y));

    // calculating  x axis grid
    const xAxisGrid = d3
      .axisBottom(x)
      .tickSize(-height)
      .tickFormat("")
      .ticks(20);
    // calculating  y axis grid
    const yAxisGrid = d3.axisLeft(y).tickSize(-width).tickFormat("");

    // drawing x axis grid
    svg
      .selectAll(".x-axis-grid")
      .data([1])
      .join("g")
      // .transition()
      // .duration(transitionDuration)
      .attr("class", "x-axis-grid axis-grid ")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxisGrid);

    // drawing y axis grid
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
      .attr("width", width)
      .attr("height", height);
      
    // Add body of bubble
    const bBody = svg
      .selectAll(".b-body")
      .data([1])
      .join("g")
      .attr("class", "b-body")
      .attr("clip-path", "url(#myClip)");

    // Add activity bubble
    const bubble = bBody
      .selectAll(".bubble")
      .data(
        dataset.filter((d) => d.visitor_name.toLowerCase() !== STATIC.chart.activityLevel)
      )
      .join("circle")
      //  .transition()
      // .duration(transitionDuration)
      .attr("cx", (d) => x(d.date))
      .attr("cy", (d) => y(d.visitor_name) + y.bandwidth() / 2)
      .attr("r", (d) => d.size)
      .attr("class", (d) => `bubble bubble_${d.date}_${d.visitor_id}`)
      .style("fill", (d) => color(d.visitor_id))
      .style("opacity", "0.5")
      .attr("stroke", "black")
      .on("mouseover", (e, d) => {
        const activitys = svg.selectAll(`.b-body .bubble_${d.date}_${d.visitor_id}`);
        const totalRecords = activitys.nodes().length;
        
        tooltip
          .transition()
          .duration(200)
          .style("opacity", 1)
          
          tooltip.html(`${d.visitor_name}: ${totalRecords} Records`)
          .style("left", e.pageX + 30 + "px")
          .style("top", e.pageY - 30 + "px");
      })
      .on("mouseout", (d) => {
         tooltip.transition().duration(500).style("opacity", 0)
      });;

    // activity level squre size
    const squareSize = 15;
    // add activity level
    const square = bBody
      .selectAll(".square")
      .data(
        dataset.filter((d) => d.visitor_name.toLowerCase() === STATIC.chart.activityLevel)
      )
      .join("rect")
      //  .transition()
      // .duration(transitionDuration)
      .attr("x", (d) => x(d.date) - squareSize / 2)
      .attr("y", (d) => y(d.visitor_name) - squareSize / 2 + y.bandwidth() / 2)
      .attr("width", squareSize)
      .attr("height", squareSize)
      .attr("class", (d) => `square activity_${d.date}`)
      .style("fill", "#f835fe")
      .style("opacity", "0.5")
      .on("mouseover", (e, d) => {
        const activitys = svg.selectAll(`.b-body .activity_${d.date}`);
        const totalRecords = activitys.nodes().length;
        
        tooltip
          .transition()
          .duration(200)
          .style("opacity", 1)
          
          tooltip.html(`${d.visitor_name}: ${totalRecords} Records`)
          .style("left", e.pageX + squareSize + "px")
          .style("top", e.pageY + squareSize + "px");
      })
      .on("mouseout", (d) => {
         tooltip.transition().duration(500).style("opacity", 0)
      });

      // Remove data from this.data by reference dataset
      if(dataSize > 700) {
        const sizeDiff = dataSize - 700;
        dataset.splice(0,  sizeDiff);
      }
  }

  render() {
    return (
      <>
        <div id="chart" />
        <div id="tooltip"> Tool tip </div>
      </>
    );
  }
}

LiveChartView.defaultProps = {
  data: [],
  startTime: new Date(),
}

export default LiveChartView;
