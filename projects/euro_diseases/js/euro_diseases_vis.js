var margin = {
        top: 10,
        right: 30,
        bottom: 150,
        left: 50
    },
    width = 900 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    viewBoxWidth = width + margin.left + margin.right,
    viewBoxHeight = height + margin.top + margin.bottom;



d3.json('data/euro_diseases.json').then(function(data) {

    var countries = [];

    data.forEach(function(d) {
        countries.push(d.country)
    });


    // add the dropdown menu
    var dropdown = d3.select('#dropdown')
        .append('select')
        .attr('id', 'selecter')
        .on('change', function(d) {

            var selected = document.getElementById("selecter");
            var selectedValue = selected.value;

            data.forEach(function(d) {
                if (d.country === selectedValue) {
                    drawbars(d.diseases);
                }

            });

        });

    dropdown.selectAll('option')
        .data(countries)
        .enter()
        .append('option')
        .attr('value', function(d) {
            return d
        })
        .text(function(d) {
            return d
        });


    // draw the default bars
    var selected = document.getElementById("selecter");
    selected.value = 'European Union - 28 countries';
    drawbars(data[8].diseases);


    function drawbars(set) {
        var conditions = [];

        set.forEach(function(d) {
            conditions.push(d.disease)
        })

        d3.select('svg').remove();

        // append SVG
        var svg = d3.select('#visualization')
            .append('svg')
            .attr("viewBox", "0 0 " + viewBoxWidth + " " + viewBoxHeight)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        // disease
        var x0 = d3.scaleBand()
            .domain(conditions)
            .range([0, width]);

        //sex
        var x1 = d3.scaleBand()
            .domain(['Total', 'Males', 'Females'])
            .range([0, x0.bandwidth() - 10]);

        svg
            .append('g')
            .attr('transform', 'translate(0,' + height + ')')
            .call(d3.axisBottom(x0).ticks(0))
            .selectAll("text")
            .style("font-size", '10pt')
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-45)");

        //value
        var y = d3.scaleLinear()
            .domain([0, 50])
            .range([height, 0]);

        svg.append('g')
            .call(d3.axisLeft(y).ticks(6));


        var colors = d3.scaleOrdinal()
            .domain(['Total', 'Males', 'Females'])
            .range(["#c7acff", "#ace5ff", "#ffacbb"]);
        // .range(["#71bc78", "#7871bc", "#bc71b5"]); // no
        // .range(["#72bb00", "#0072bb", "#bb0072"]);
        // .range(["#82b660", "#6082b6", "#b66082"]);
        // .range(["#b2ec5d", "#5db2ec", "#ec5db2"]);
        // .range(["#4dab29", "#294dab", "#ab294d"]);
        // .range(["#c6f6ad", "#adc6f6", "#f6adc6"]);
        // .range(["#9ab973", "#739ab9", "#b9739a"]);
        // .range(["#93c572", "#7293c5", "#c57293"]);
        // .range(["#699400", "#006994", "#940069"]);
        // .range(["#c5f397", "#97c5f3", "#f39797"]);
        // .range(["#faed87", "#87cefa", "#fa87ce"]); // no
        // .range(["#fbf073", "#73c2fb", "#fb737e"]); // no
        // .range(["#93c572", "#7b72c5", "#c572bd"]); // no
        // .range(["#0a9525", "#0a7a95", "#95250a"]); // no

        var hover_colors = d3.scaleOrdinal()
            .domain(['Total', 'Males', 'Females'])
            .range(["#9f71ff", "#5dcdff", "#ff718b"]);
        // .range(["#48984f", "#564ea5", "#a54e9c"]);
        // .range(["#8ae200", "#008ae2", "#e2008a"]);
        // .range(["#659645", "#456596", "#964565"]);
        // .range(["#90e01a", "#2899e6", "#e62899"]);
        // .range(["#73d54e", "#4e73d5", "#d54e73"]);
        // .range(["#89ec55", "#5589ec", "#ec5589"]);
        // .range(["#7da150", "#507da1", "#a1507d"]);
        // .range(["#73b349", "#4973b3", "#b34973"]);
        // .range(["#a1e200", "#00a1e2", "#e200a1"]);
        // .range(["#94e93f", "#3f94e9", "#e93f3f"]);


        var groups = svg.selectAll('disease')
            .data(set)
            .enter()
            .append('g')
            .attr('class', 'disease')
            .attr("transform", function(d) {
                return "translate(" + x0(d.disease) + ",0)";
            });


        groups.selectAll('rect')
            .data(function(d) {
                return d.breakdown
            })
            .enter()
            .append('rect')
            .attr('class', 'bars')
            .attr('width', x1.bandwidth())
            .attr('height', function(d) {
                return height - y(0);
            })
            .attr('x', function(d) {
                return x1(d.gender);
            })
            .attr('y', function(d) {
                return y(0);
            })
            .attr('fill', function(d) {
                return colors(d.gender);
            })
            .on('mousemove', function(d) {
                d3.select(this)
                    .transition()
                    .duration(300)
                    .attr('fill', function(d) {
                        return hover_colors(d.gender);
                    })
            })
            .on('mouseleave', function(d) {
                d3.select(this)
                    .transition()
                    .duration(300)
                    .attr('fill', function(d) {
                        return colors(d.gender);
                    })
            });

        groups.selectAll('rect')
            .transition()
            .delay(function(d) {
                return Math.random() * 1000;
            })
            .duration(1000)
            .attr('y', function(d) {
                return y(d.value);
            })
            .attr('height', function(d) {
                return height - y(d.value);
            });



        var tooltip = d3.select('#visualization')
            .append('div')
            .attr('class', 'tooltip')


        var show_tooltip = function(d) {
            var content = '<span>' + d.gender + ': </span>' + d.value + '%';

            tooltip
                .style('display', 'block')
                .style('opacity', 0.5)
                .transition()
                .duration(500)
                .style('opacity', 1)

            tooltip
                .style('left', (d3.event.pageX + 10) + 'px')
                .style('top', (d3.event.pageY + 10) + 'px')
                .style('display', 'block')
                .html(content);
        }


        var hide_tooltip = function(d) {
            tooltip
                .style('display', 'none');
        }

        // add the tooltip to the visualization
        groups.selectAll('rect')
            .on('mouseover', show_tooltip)
            .on('mouseout', hide_tooltip)

    }

});