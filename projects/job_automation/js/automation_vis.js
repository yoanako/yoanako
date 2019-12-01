// set margin, width and height of the graph
var margin = {
        top: 30,
        right: 20,
        bottom: 70,
        left: 80
    },
    width = 990 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom,
    viewBoxWidth = width + margin.left + margin.right,
    viewBoxHeight = height + margin.top + margin.bottom;

var svg = d3.select('#visualization')
    .append('svg')
    .attr("viewBox", "0 0 " + viewBoxWidth + " " + viewBoxHeight)
	.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


svg.append('text')
    .attr('text-anchor', 'middle')
    .attr('x', (width / 2))
    .attr('y', -10)
    .style('fill', '#fff')
    .style('font-size', '18pt')
    .text('Job Automation');

// Add axis titles
svg.append('text')
    .attr('text-anchor', 'end')
    .attr('x', width)
    .attr('y', height + margin.top + 10)
    // .attr('font-family', 'Arial')
    .attr('fill', '#fff')
    .style('font-size', '10pt')
    .text('Probability of automation');

svg.append('text')
    .attr('text-anchor', 'end')
    .attr('transform', 'rotate(-90)')
    .attr('y', -margin.left + 20)
    .attr('x', 0)
    .attr('fill', '#fff')
    .style('font-size', '10pt')
    .text('Mean salary, USA');

// append clip paths for the bubbles
svg.append('defs').append('clipPath')
    .attr('id', 'clip')
    .append('rect')
    .attr('width', width)
    .attr('height', height);

// load the data from the csv file
d3.csv('data/clean_salary_and_jobs.csv').then(function(data) {

	    data = data.sort(function(a, b) {
	        return b.sum_people - a.sum_people
	    })

	    // define and append X axis
	    var x = d3.scaleLinear()
	        .domain([0, d3.max(data, function(d) {
	            return d.probability
	        })])
	        .range([0, width]);
	    svg.append('g')
	        .attr('transform', 'translate(0,' + height + ')')
	        .call(d3.axisBottom(x));

	    // define and append Y axis
	    var y = d3.scaleLinear()
	        .domain([0, d3.max(data, function(d) {
	            return +d.annual_mean
	        })])
	        .range([height, 0]);
	    svg.append('g')
	        .call(d3.axisLeft(y));


	    // define bubble size scale
	    var s = d3.scaleLinear()
	        .domain([d3.min(data, function(d) {
	                return d.sum_people
	            }),
	            d3.max(data, function(d) {
	                return d.sum_people
	            })
	        ])
	        .range([1, 2.5]);


	    // define colors for the 3 risk groups	
	    var colors = d3.scaleOrdinal()
	        .domain(['High Risk', 'Medium Risk', 'Low Risk'])
	        .range(['#ff5350', '#ffd700', '#9acd32']);

	    // graph the data on the scatter plot
	    var bubbles = svg.append('g')
	        .selectAll('dot')
	        .data(data)
	        .enter()
	        .append('circle')
	        .attr('class', 'dot')
	        .attr('cx', function(d) {
	            return x(d.probability)
	        })
	        .attr('cy', function(d) {
	            return y(d.annual_mean)
	        })
	        .attr('r', function(d) {
	            return 0
	        })
	        .attr('fill', function(d) {
	            return colors(d.risk_groups)
	        });



	    d3.selectAll('circle')
	        .transition()
	        .delay(function(d) {
	            return Math.random() * 1000
	        })
	        .duration(1000)
	        .attr('r', function(d) {
	            return s(d.sum_people)
	        })


	    bubbles.attr('clip-path', 'url(#clip)');


	    // create tooltip
	    var tooltip = d3.select('#visualization')
	        .append('div')
	        .attr('class', 'tooltip')

	    var format_comma = d3.format(",");


	    var show_tooltip = function(d) {
	        var content = '';
	        if (d.annual_mean > 0) {
	            content += '<span>Occupation: </span>' + d.occupation + '<br>';
	            content += '<span>Probability: </span>' + d.probability + '<br>';
	            content += '<span>Annual Salary: </span>' + '$' + format_comma(d.annual_mean) + '<br>';
	            content += '<span>Total amount of employees: </span>' + format_comma(d.sum_people);
	        } else {
	            content += '<span>Occupation: </span>' + d.occupation + '<br>';
	            content += '<span>Probability: </span>' + d.probability + '<br>';
	            content += '<span>Annual Salary: </span>' + 'No available data';
	            content += '<span>Total amount of employees: </span>' + format_comma(d.sum_people);
	        }


	        tooltip
	            .style('display', 'block')
	            .style('opacity', 0.5)
	            .transition()
	            .duration(500)
	            .style('opacity', 1)

	        tooltip
	            .style('left', (d3.event.pageX + 30) + 'px')
	            .style('top', (d3.event.pageY + 30) + 'px')
	            .style('display', 'block')
	            .html(content);
	    }


	    var hide_tooltip = function(d) {
	        tooltip
	            .style('display', 'none');
	    }

	    // add the tooltip to the visualization
	    bubbles
	        .on('mouseover', show_tooltip)
	        .on('mouseout', hide_tooltip)
});