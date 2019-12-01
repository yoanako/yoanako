// set the dimensions and margins of the graph
var margin = {
        top: 50,
        right: 20,
        bottom: 10,
        left: 10
    },
    width = 1145 - margin.left - margin.right,
    height = 1045 - margin.top - margin.bottom,
    viewBoxWidth = width + margin.left + margin.right,
    viewBoxHeight = height + margin.top + margin.bottom;

var svg = d3.select("#visualization")
    .append("svg")
    .attr("viewBox", "0 0 " + viewBoxWidth + " " + viewBoxHeight)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");


d3.json('data/refugees_deaths_2.json').then(function(data) {

    var cause_of_death = [];

    data.children.map(function(d) {
        cause_of_death.push(d.name);
    });

    // console.log(cause_of_death)


    var root = d3.hierarchy(data).sum(function(d) {
            return +d.size
        })
        .sort(function(a, b) {
            return b.value - a.value;
        })


    d3.treemap()
        .tile(d3.treemapSquarify)
        .size([width, height])
        .paddingTop(28)
        .paddingRight(3)
        .paddingInner(3)
        .round(true)
        (root)

    // prepare a color scale
    var color = d3.scaleOrdinal()
        .domain(cause_of_death)
        .range(d3.schemeDark2)

    // And a opacity scale
    var opacity = d3.scaleLinear()
        .domain([
            d3.min(root.leaves(), function(d) {
                return +d.data.size;
            }),
            d3.max(root.leaves(), function(d) {
                return +d.data.size;
            })
        ])
        .range([.5, 1])


    var tooltip = d3.select('#visualization')
        .append('div')
        .attr('class', 'tooltip');

    var cell = svg.selectAll("g")
        .data(root.leaves())
        .enter().append("g")
        .attr("transform", function(d) {
            return "translate(" + d.x0 + "," + d.y0 + ")";
        });


    cell.append("rect")
        .attr("id", function(d) {
            return d.data.name.replace(/\s/g, '');
        })
        .attr("width", function(d) {
            return d.x1 - d.x0;
        })
        .attr("height", function(d) {
            return d.y1 - d.y0;
        })
        .attr("fill", function(d) {
            return color(d.parent.data.name);
        })
        .style("stroke", "black")
        .style("opacity", function(d) {
            return opacity(d.data.size)
        });



    cell.append("clipPath")
        .attr("id", function(d) {
            return "clip-" + d.data.name.replace(/\s/g, '');
        })
        .append("use")
        .attr("xlink:href", function(d) {
            return "#" + d.data.name.replace(/\s/g, '');
        });

    cell.append("text")
        .style('display', function(d) {
            return d.data.size > 4 ? 'block' : 'none'
        })
        .attr("clip-path", function(d) {
            return "url(#clip-" + d.data.name.replace(/\s/g, '') + ")";
        })
        .selectAll("tspan")
        .data(function(d) {
            return d.data.name.split(/(?=[A-Z][^A-Z])/g);
        })
        .enter()
        .append("tspan")
        .attr("x", 4)
        .attr("y", function(d, i) {
            return 13 + i * 10;
        })
        .text(function(d) {
            return d;
        })
        .style('font-size', '8pt');

    // // and to add the text labels

    cell
        .append("text")
        .attr("x", 4)
        .attr("y", 27)
        .text(function(d) {
            return d.data.size > 10 ? d.data.size : ''
        })
        .attr("font-size", "8pt")
        .attr("fill", "#111");

    cell.on('mousemove', function(d) {
            // console.log(d)
            var content = '';
            content += '<span>Cause of death: </span>' + d.data.name + '<br>'
            content += '<span>Amount of people: </span>' + d.data.size

            tooltip
                .style('display', 'block')
                .style('left', (d3.event.pageX + 10) + 'px')
                .style('top', (d3.event.pageY + 10) + 'px')
                .html(content);
        })
        .on('mouseleave', function(d) {
            tooltip
                .style('display', 'none')
        });


    // Add title for the groups
    svg
        .selectAll("titles")
        .data(root.descendants().filter(function(d) {
            return d.depth == 1
        }))
        .enter()
        .append("text")
        .attr("x", function(d) {
            return d.x0
        })
        .attr("y", function(d) {
            return d.y0 + 21
        })
        .text(function(d) {
            return d.data.name.charAt(0).toUpperCase() + d.data.name.slice(1)
        })
        .attr("font-size", "9pt")

    svg
        .append("text")
        .attr("x", 0)
        .attr("y", 14)
        .text("Refeguee Deaths Between 2000 and 2016 years")
        .attr("font-size", "19px")
        .attr("fill", "grey")

});