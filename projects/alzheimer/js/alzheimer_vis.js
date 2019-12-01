d3.json('data/alzheimer2.json').then(function(data) {

    var margin = {
            top: 10,
            right: 10,
            bottom: 10,
            left: 20
        },
        width = 1140,
        height = 1140,
        viewBoxWidth = width + margin.left + margin.right,
        viewBoxHeight = height + margin.top + margin.bottom;

    var color = d3.scaleLinear()
        .domain([0, 5])
        .range(["hsl(192.2, 100%, 89.4%)", "hsl(191.9,100%,31.6%)"])
        .interpolate(d3.interpolateHcl);


    var format = d3.format(",d");

    var pack = d3.pack()
        .size([width, height])
        .padding(3)

    var root = d3.hierarchy(data)
        .sum(d => +d['enrollment'])
        // .sum(d => d.size)
        .sort((a, b) => {
            return b.value - a.value
        })


    var focus = root,
        nodes = pack(root),
        view;

    var tooltip = d3.select('#visualization')
        .append('div')
        .attr('class', 'tooltip')
        .style('z-index', 1000);


    var show_tooltip = function(d) {
        var content = '';

        if (d.depth == 4) {
            content = '';

        } else {
            content = '';
            content += '<span>Title: </span>' + d.data['title'];
            content += '<span>Study type: </span>' + d.data['study_type'];
            content += '<span>Enrollment: </span>' + d.data['enrollment'];
            content += "<span>Subjects' age: </span>" + d.data['clean_age'];
            content += "<span>Status: </span>" + d.data['status'];
            content += '<span>NCT number: </span>' + d.data['nct_number'];
        }


        tooltip
            .style('display', function() {
                if (d.depth == 3) {
                    return 'block';
                } else {
                    return 'none';
                }
            })
            .style('opacity', 1);

        tooltip
            .style('left', (d3.event.pageX + 30) + 'px')
            .style('top', (d3.event.pageY + -20) + 'px')
            .html(content);

    }

    var hide_tooltip = function(d) {
        tooltip
            .style('display', 'none');
    }


    var svg = d3.select('#visualization')
        .append("svg")
        .attr("viewBox", "0 0 " + viewBoxWidth + " " + viewBoxHeight)

    .attr('transform', 'translate(' + margin.left + ',' + 0 + ')')
        .append('g')
        .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
        .style("background", color(0))
        .style("cursor", "pointer")
        .on("click", () => zoom(root));


    svg.append('text')
        .attr('text-anchor', 'left')
        .attr('transform', 'translate(' + (-width / 2) + ',' + -height / 2 + ')')
        .attr('x', 0)
        .attr('y', 60)
        .style('fill', '#111')
        .style('font-weight', '700')
        .style('font-size', '14pt')
        .text('Alzheimer Clinical Trials.');

    svg.append('text')
        .attr('text-anchor', 'left')
        .attr('transform', 'translate(' + (-width / 2) + ',' + -height / 2 + ')')
        .attr('x', 230)
        .attr('y', 60)
        .style('fill', '#111')
        .style('font-weight', '300')
        .style('font-size', '14pt')
        .text('The History of 2,207 Clinical Trials between 1981 and today');

    var node = svg
        .append("g")
        .attr('transform', 'translate(0, 30)')
        .selectAll("circle")
        .data(root.descendants().slice(1))
        .join("circle")
        .attr('class', 'dot')
        .attr("fill", function(d) {
            return d.children ? color(d.depth) : "#111"
        })

    	node
	        .on('mousemove', function(d) {
	            return show_tooltip(d)
	        })
	        .on('mouseout', hide_tooltip)
	        .on("click", function(d) {
	            focus !== d && (zoom(d), d3.event.stopPropagation())
	        });


    // node.attr("pointer-events", function(d) { return !d.children ? "none" : null});


    var label = svg
        .append("g")
        .attr('transform', 'translate(0, 30)')
        .style("font", "10px sans-serif")
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
        .selectAll("text")
        .data(root.descendants())
        .join("text")
        .style("fill-opacity", function(d) {
            return d.parent === root ? 1 : 0
        })
        .style("display", function(d) {
            return d.parent === root ? "inline" : "none"
        })
        .style("fill", function(d) {
            return "#fff"
        })
        .style("font-size", '10pt')
        .text(function(d) {
            return d.data.name
        });


    zoomTo([root.x, root.y, root.r * 2]);


    function zoomTo(v) {

        svg.attr("viewBox", "0 0 " + viewBoxWidth + " " + viewBoxHeight)

        var k = width / v[2];

        view = v;

        label.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
        node.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
        node.attr("r", d => d.r * k);
    }

    function zoom(d) {
        var focus0 = focus;

        focus = d;

        var transition = svg.transition()
            .duration(d3.event.altKey ? 7500 : 750)
            .tween("zoom", function(d) {
                var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
                return t => zoomTo(i(t));
            });

        label
            .filter(function(d) {
                return d.parent === focus || this.style.display === "inline";
            })
            .transition(transition)
            .style("fill-opacity", function(d) {
                d.parent === focus ? 1 : 0
            })
            .on("start", function(d) {
                if (d.parent === focus) this.style.display = "inline";
            })
            .on("end", function(d) {
                if (d.parent !== focus) this.style.display = "none";
            });
    }


});