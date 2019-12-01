// set margin, width and height of the graph
var margin = {
        top: 30,
        right: 20,
        bottom: 55,
        left: 69
    },
    width = 400 - margin.left - margin.right,
    height = 200 - margin.top - margin.bottom;

// load the data from the csv
d3.csv('data/refugees_clean.csv').then(function(data) {
    
    // group the countries based on max value per year
    var value_groups = function(d) {

        var set = '';
        if (d <= 30) {
            set = 'set-1'
        }
        if (d > 30 && d <= 100) {
            set = 'set-2'
        }
        if (d > 100 && d <= 300) {
            set = 'set-3'
        }
        if (d > 300 && d <= 1000) {
            set = 'set-4'
        }
        if (d > 1000 && d <= 3000) {
            set = 'set-5'
        }
        if (d > 3000 && d <= 5000) {
            set = 'set-6'
        }
        if (d > 5000) {
            set = 'set-7'
        }
        return set;
    };

    var region_names = ['African Group', 'Asia-Pacific Group',
        'Eastern European Group', 'Western European and Others Group (WEOG)',
        'Latin American and Caribbean Group (GRULAC)',
        'Other / Not specified'
    ];

    var color_scale =
        // ['green', 'purple', 'red', 'blue', 'orange / yellow', 'gray']
        // ['#00ff00', '#8000ff', '#ff0000', '#00ffff', '#fe6700', 'silver']
        // ['#33ff00', '#cc00ff', '#ff0033', '#00ffff', '#ffcc00', 'silver']
        // ['#66ff00', '#9900ff', '#ff1a00', '#0066ff', '#ff9900', 'silver']
        // ['#66ff00', '#9900ff', '#ff1a00', '#0066ff', '#ff9900', 'silver']
        // ['#66ff99', '#9966ff', '#ff6680', '#66ccff', '#ff9966', 'silver']
        // ['#99ff99', '#9999ff', '#ff9999', '#99ffff', '#ffba3b', 'silver']

        // dark background
        // ['#98FB98', '#EE82EE', '#DC143C', '#00BFFF', '#FFD700', '#778899']
        // ['#2E8B57', '#DA70D6', '#FF6347', '#4682B4', '#FF7F50', '#9c956b']
        ['#90EE90', '#BA55D3', '#ff6363', '#00BFFF', '#FFB6C1', '#DAA520']


    var colors = d3.scaleOrdinal()
        .domain(region_names)
        .range(color_scale)


    // convert year in date format, 'value' to int
    var formatTime = d3.timeParse('%Y')


    data.map(function(d) {
        d.year = formatTime(d.year);
        d.value = +d.value;
    });

    // nest the data
    var grouped = d3.nest()
        .key(function(d) {
            return d.origin
        })
        .entries(data);
    // console.log(grouped)

    var exceptions = [];

    // find the max values
    grouped.forEach(function(d, i) {

        var max = d3.max(d.values, function(c) {
            return c.value
        });
        d.max = max;
        d.region = d.values[0].region_groups;
        d.set = value_groups(max);

        if (d.values.length == 1) {
            exceptions.push(d);
            d.set = 'exception';
        }

    });

    // remove exceptions
    grouped = grouped.filter(function(d) {
        return d.set != 'exception';
    });


    // assign each country to the respective set based on max value
    var sets = d3.nest()
        .key(function(d) {
            return d.set
        })
        .entries(grouped);

    function draw(title, data) {

        var container = d3.select('#visualization #center')
            .append('div');

        // add title to each chart
        container
            .append('h4')
            .text(title);


        // add an svg for each group
        var svg = container
            .selectAll('svg')
            .data(data)
            .enter()
            .append('svg')
            .attr('class', function(d) {
                return d.key.replace(/\./g, "").replace("'", "").split(' ').join('_');
            })
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')


        // add year and value to each country
        var years = [];
        var values = [];
        data.forEach(function(country) {
            country.values.forEach(function(d) {
                years.push(d.year);
                values.push(d.value);
            });
        });

        // define and append X axis
        var x = d3.scaleTime()
            .domain(d3.extent(years, function(d) {
                return d
            }))
            .range([0, width])

        var xAxis = svg
            .append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(d3.axisBottom(x).ticks(5))


        // define and append Y axis
        var y = d3.scaleLinear()
            .domain([0, d3.max(values, function(d) {
                return d;
            })])
            .range([height, 0])


        svg.append('g')
            .attr('class', 'axis')
            .call(d3.axisLeft(y).ticks(4));

        // sort the data
        var sorted = function(data, key) {
            return data.sort(function(a, b) {
                return b[key] - a[key]
            })
        }

        var line = d3.line()
            .x(function(d) {
                return x(d.year);
            })
            .y(function(d) {
                return y(+d.value);
            });


        // var bisect = d3.bisector(function(d) {
        //     return d.x;
        // }).left;


        // draw the linechart
        svg
            .append('path')
            .attr('d', function(d) {
                return line(sorted(d.values, 'year'));
            })
            .attr('fill', 'none')
            .attr('stroke', function(d) {
                return colors(d.region)
            })
            // .attr('stroke', 'red')
            .attr('stroke-width', 1.9);


        // add axis titles
        svg.append('text')
            .attr('text-anchor', 'end')
            .attr('x', width)
            .attr('y', height + margin.top + 10)
            .attr('font-family', 'Open Sans')
            .attr('font-size', '10pt')
            .style('fill', '#999')
            .text('Year');

        svg.append('text')
            .attr('text-anchor', 'start')
            .attr('transform', 'rotate(-90)')
            .attr('y', function() {
                return y.domain()[1] > 1000 ? -margin.left + 20 : -margin.left + 35;
            })
            .attr('x', function(d) {
                return y.domain()[1] > 1000 ? -margin.top - 25 : -margin.top - 25;
            })
            .attr('font-family', 'Open Sans')
            .attr('font-size', '10pt')
            .style('fill', '#999')
            .text('Refugees');

        // add the country name as title
        svg
            .append('text')
            .attr('text-anchor', 'start')
            .attr('font-family', 'Open Sans')
            .attr('font-size', '11pt')
            .style('fill', '#fff')
            // .attr('y', 12)
            .attr('y', 10)
            .attr('x', +8)
            .text(function(d) {
                return (d.key)
            });


        svg
            .append('text')
            .attr('text-anchor', 'start')
            .attr('font-family', 'Open Sans')
            .attr('font-size', '8pt')
            // .style('fill', '#999')
            .attr('y', -10)
            .attr('x', 8)
            .text(function(d) {
                return d.region
            })
            .style('fill', function(d) {
                return colors(d.region)
            });

    }


    draw('More than 5000 refugees', sets[0].values);
    draw('Between 1000 and 3000 refugees', sets[5].values);
    draw('Between 300 and 1000 refugees', sets[3].values);
    draw('Between 100 and 300 refugees', sets[2].values);
    draw('Between 30 and 100 refugees', sets[4].values);
    draw('Up to 30 refugees', sets[1].values);



    // create a table for the one-time cases
    var table = d3.select('#visualization').append('table');
    var titles = ['Country', 'Refugees', 'Region', 'Year'];


    var headers = table.append('thead')
        .append('tr')
        .selectAll('th')
        .data(titles)
        .enter()
        .append('th')
        .text(function(d) {
            return d;
        });

    exceptions.forEach(function(country) {

        var year = country.values[0].year;
        var new_date = year.getFullYear();
        var row_data = [country.key, country.max, country.region, new_date];

        var rows = table.append('tr')
            .selectAll('td')
            .data(row_data)
            .enter()
            .append('td')
            .text(function(d) {
                return d;
            });

    });


});