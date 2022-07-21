import { Component } from 'react';
import * as d3 from 'd3';
import './ScatterPlot.css';

class ScatterPlot extends Component {
  constructor(props) {
    super(props);
    this.state = {
      plotdata: [],
    };
  }

  componentDidMount() {
    fetch(
      'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json',
    )
      .then((response) => response.json())
      .then((data) =>
        this.setState({
          plotdata: data,
        }),
      );
  }

  render() {
    const w = 940; // svg width
    const h = 700; // svg height
    const horizonPad = 80; // svg left and right padding
    const verticalPad = 100; // svg top and bottom padding

    const { plotdata } = this.state;

    // x scale
    const xScale = d3.scaleLinear();
    xScale.domain([d3.min(plotdata, d => d.Year) - 1, d3.max(plotdata, d => d.Year) + 1]).range([horizonPad, w - horizonPad]);
    // y scale
    const formatLabels = (timeExtent) => {
      const step = 1000; // milliseconds
      const labels = [];
      for (
        let d = timeExtent[0];
        d <= timeExtent[1];
        d.setTime(d.getTime() + step)
      ) {
        if (d.getSeconds() % 15 === 0) labels.push(d.getTime());
      }
      return labels;
    };
    const times = plotdata.map((d) => d3.timeParse('%M:%S')(d.Time));
    const yScale = d3
      .scaleTime()
      .domain([d3.min(times), d3.max(times)])
      .range([verticalPad, h - verticalPad]);

    // Create axes and format labels
    const xAxis = d3.axisBottom(xScale);
    const xLabels = new Array(13)
      .fill(0, 0)
      .map((val, i) => 1994 + 2 * i);
    xAxis.tickFormat((d, i) => xLabels[i]);
    xAxis.tickPadding([20]);
    const yAxis = d3
      .axisLeft(yScale)
      .tickValues(formatLabels(d3.extent(times)))
      .tickFormat((time) => d3.timeFormat('%M:%S')(time));

    const svg = d3.select('svg');

    // Plot data
    svg
      .selectAll('circle')
      .data(plotdata)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('data-index', (d, i) => i)
      .attr('data-xvalue', (d) => d.Year)
      .attr('data-yvalue', (d) => new Date(d.Seconds * 1000).toISOString())
      .attr('r', 6)
      .attr('cx', (d) => xScale(d.Year))
      .attr('cy', (d) => yScale(d3.timeParse('%M:%S')(d.Time)))
      .style('fill', (d) => {
        if (d.Doping !== '') return '#3741ceb4';
        return '#15dbcbe3';
      });

    // Color details
    svg
      .append('rect')
      .attr('width', 20)
      .attr('height', 20)
      .style('fill', '#3741ceb4')
      .attr('x', 800)
      .attr('y', 250);
    svg
      .append('text')
      .attr('x', 654)
      .attr('y', 264)
      .text('Has doping allegation')
      .style('font-size', 14);

    svg
      .append('rect')
      .attr('width', 20)
      .attr('height', 20)
      .style('fill', '#15dbcbe3')
      .attr('x', 800)
      .attr('y', 280);
    svg
      .append('text')
      .attr('x', 658)
      .attr('y', 294)
      .text('No doping allegation')
      .style('font-size', 14);

    // Display axes
    svg
      .append('g')
      .attr('id', 'x-axis')
      .attr('transform', `translate(0, ${h - verticalPad})`)
      .call(xAxis);
    svg
      .append('g')
      .attr('id', 'y-axis')
      .attr('transform', `translate(${horizonPad}, 0)`)
      .call(yAxis);

    // y-axis label
    svg
      .append('text')
      .attr('id', 'legend')
      .attr('transform', `rotate(-90)`)
      .attr('x', -250)
      .attr('y', 35)
      .text('Time in Minutes')
      .style('font-size', 18);

    // Dynamically update tooltip
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot) => {
      dot.addEventListener('mouseover', (e) => {
        const tooltip = document.querySelector('#tooltip');
        const tooltipName = document.querySelector('#tooltip-name');
        const tooltipNation = document.querySelector('#tooltip-nationality');
        const tooltipYear = document.querySelector('#tooltip-year');
        const tooltipTime = document.querySelector('#tooltip-time');
        const tooltipAlleg = document.querySelector('#tooltip-allegation');
        let index = Number(e.target.getAttribute('data-index'));

        tooltip.style.top = `${
          document.documentElement.scrollTop + e.clientY - 30
        }px`;
        tooltip.style.left = `${
          document.documentElement.scrollLeft + e.clientX + 10
        }px`;
        tooltip.style.backgroundColor = e.target.style.fill;
        tooltip.setAttribute('data-year', plotdata[index].Year);
        tooltipName.textContent = plotdata[index].Name;
        tooltipNation.textContent = plotdata[index].Nationality;
        tooltipYear.textContent = String(plotdata[index].Year);
        tooltipTime.textContent = plotdata[index].Time;
        tooltipAlleg.innerHTML = `${
          plotdata[index].Doping !== '' ? '<br/>' : ''
        }${plotdata[index].Doping}`;

        document.querySelector('#tooltip').style.display = 'block';
      });
    });

    dots.forEach((dot) => {
      dot.addEventListener('mouseleave', (e) => {
        document.querySelector('#tooltip').style.display = 'none';
      });
    });

    return (
      <div className='Graph-container'>
        <div id='tooltip' className='Graph-tooltip' data-year='1994'>
          <p id='tooltip-info'>
            <span id='tooltip-name' className='tooltip-text'></span>:{' '}
            <span id='tooltip-nationality' className='tooltip-text'></span>
            <br />
            Year: <span id='tooltip-year' className='tooltip-text'></span>;{' '}
            Time: <span id='tooltip-time' className='tooltip-text'></span>
            <br />
            <span
              id='tooltip-allegation'
              className='tooltip-text tooltip-doping'
            ></span>
          </p>
        </div>
        <svg className='Graph'>
          <text id='title' className='Graph-title' x='230' y='40'>
            Doping in Professional Bicycle Racing
          </text>
          <text id='sub-title' className='Graph-subtitle' x='355' y='64'>
            35 Fastest times up Alpe d'Huez
          </text>
        </svg>
      </div>
    );
  }
}

export default ScatterPlot;


