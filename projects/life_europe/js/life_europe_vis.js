var margin = {
        top: 0,
        right: 20,
        bottom: 55,
        left: 89
    },
    width = 1000 - margin.left - margin.right,
    height = 900 - margin.top - margin.bottom,
    viewBoxWidth = width + margin.left + margin.right,
    viewBoxHeight = height + margin.top + margin.bottom;


var projection = d3.geoMercator()
    .scale(700)
    .translate([width / 2.12, height * 1.5]);

var path = d3.geoPath().projection(projection);


d3.json('data/euromap.geojson').then(function(geojson) {
    d3.csv('data/job_satisfaction.csv').then(function(data) {

        geojson.features.forEach(function(feature) {

            data.forEach(function(d) {
                if (feature.properties.name == d.country) {
                    delete d.country;
                    d.avg_hrs_worked = +d.avg_hrs_worked;
                    d.life_expect = +d.life_expect;
                    d.median_income = +d.median_income;
                    d.prct_job_satis_high = +d.prct_job_satis_high;
                    d.prct_life_satis_high = +d.prct_life_satis_high;

                    feature.properties['data'] = d;
                }
            });

        });

        // colors
        var avg_hrs_worked_colors = d3.scaleThreshold()
            .domain([32, 34, 36, 38, 40, 42, 44])
            // .range(["rgb(198,219,239)", "rgb(158,202,225)", "rgb(107,174,214)", "rgb(66,146,198)","rgb(33,113,181)","rgb(8,81,156)","rgb(8,48,107)","rgb(3,19,43)", "rgb(207,251,255)"]);
            // .range(['#ffffff','#f0f0f0','#d9d9d9','#bdbdbd','#969696','#737373','#525252','#252525','#000000']);
            // .range(['#f7fcf0','#e0f3db','#ccebc5','#a8ddb5','#7bccc4','#4eb3d3','#2b8cbe','#0868ac','#084081']);
            // .range(['#ffffcc','#ffeda0','#feb24c','#fd8d3c','#fc4e2a','#e31a1c','#bd0026','#800026']);
            // .range(['#ffffe5','#f7fcb9','#d9f0a3','#addd8e','#78c679','#41ab5d','#238443','#006837','#004529']);
            // .range(['#21222F','#273848','#28505E','#246A71','#26847D','#399F83','#59B984','#83D27F','#B4E978','#ECFD73']);
            // .range(d3.schemePuBu[7]);
            .range(d3.schemeReds[8]);


        var median_income_colors = d3.scaleThreshold()
            .domain([5000, 7000, 10000, 15000, 20000, 24000, 30000])
            // .range(["rgb(198,219,239)", "rgb(158,202,225)", "rgb(107,174,214)", "rgb(66,146,198)","rgb(33,113,181)","rgb(8,81,156)","rgb(8,48,107)","rgb(3,19,43)", "rgb(207,251,255)"]);
            // .range(['#f7fcf0','#e0f3db','#ccebc5','#a8ddb5','#7bccc4','#4eb3d3','#2b8cbe','#0868ac','#084081']);
            // .range(['#ffffe5','#f7fcb9','#d9f0a3','#addd8e','#78c679','#41ab5d','#238443','#006837','#004529']);
            .range(d3.schemeRdYlGn[8]);


        var life_expect_colors = d3.scaleThreshold()
            .domain([75, 77, 79, 80, 82, 83])
            // .range(["rgb(198,219,239)", "rgb(158,202,225)", "rgb(107,174,214)", "rgb(66,146,198)","rgb(33,113,181)","rgb(8,81,156)","rgb(8,48,107)","rgb(3,19,43)", "rgb(207,251,255)"]);
            // .range(['#d0d1e6','#a6bddb','#74a9cf','#3690c0','#0570b0','#045a8d','#023858']);
            .range(d3.schemeRdYlGn[7]);


        var prct_job_satis_high_colors = d3.scaleThreshold()
            .domain([14, 20, 24, 28, 32, 36, 40, 44])
            // .range(["#eefafa", "#daeef5", "#c6e5ef", "#9ed3e4", "#76c1d9","#4eafce", "#3396b6", "#1d649f", "#08519c", "#06386b"]);
            .range(d3.schemeYlGn[9]);


        var prct_life_satis_high_colors = d3.scaleThreshold()
            .domain([10, 13, 16, 20, 24, 28, 35, 40, 44])
            // .domain([10, 15, 20, 25, 30, 35, 40, 44])
            // .range(["#eefafa", "#daeef5", "#c6e5ef", "#9ed3e4", "#76c1d9","#4eafce", "#3396b6", "#1d649f", "#08519c", "#06386b"]);
            // .range(['#21222F','#273848','#28505E','#246A71','#26847D','#399F83','#59B984','#83D27F','#B4E978','#ECFD73']);
            // .range(['#f7fcf0','#e0f3db','#ccebc5','#a8ddb5','#7bccc4','#4eb3d3','#2b8cbe','#0868ac','#084081']);
            // .range(['#ffffcc','#ffeda0','#fed976','#feb24c','#fd8d3c','#fc4e2a','#e31a1c','#bd0026','#800026']);
            .range(d3.schemeYlGn[9]);

        $('#visualization ul li').on('click', function() {
            var $this = $(this);
            var $set = $this.data('set');
            var $button = $('#visualization ul li')
            if ($button.hasClass('clicked')) {
                $button.removeClass('clicked');
            }
            $this.addClass('clicked');
            draw(geojson, $set, eval($set + '_colors'));

        });

        $('#visualization ul li:first-child').trigger('click');


    });
});


function draw(map, setname, colors) {

    var features = map.features;

    var data = [];

    features.forEach(function(d) {
        if (d.properties.hasOwnProperty('data')) {
            data.push(d.properties.data[setname])
        }
    });

   

    d3.select('svg').remove();

    var svg = d3.select('#visualization')
        .append('svg')
        .attr("viewBox", "0 0 " + viewBoxWidth + " " + viewBoxHeight)

    .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


    var tooltip = d3.select('#visualization')
        .append('div')
        .attr('class', 'tooltip')

    var show_tooltip = function(d) {
        var content = '';
        // content += '<span>' + d.properties['name'] + '</span>';

        if (d.properties.hasOwnProperty('data')) {
            content += '<span>' + d.properties['name'] + '</span>';
            content += d.properties.data[setname];
        } else {
            content += '<span>' + d.properties['name'] + '</span>';
            content += 'no available data'
        }


        d3.selectAll('.country')
            .style('opacity', 0.95)
            .attr('stroke', '#999');
        d3.select(this)
            .style('opacity', 1)
            .attr('stroke', '#1e384d');


        tooltip
            .style('display', 'block')
            .style('opacity', 0.5)
            .transition()
            .duration(500)
            .style('opacity', 1)

        tooltip
            .style('left', (d3.event.pageX + 20) + 'px')
            .style('top', (d3.event.pageY + 30) + 'px')
            .style('display', 'block')
            .html(content);
    }



    svg
        .selectAll('path')
        .data(map.features)
        .enter()
        .append('path')
        .attr('class', 'country')
        .attr('d', path)
        .attr('stroke', '#999')
        .attr('fill', function(d) {

            if (d.properties.hasOwnProperty('data')) {
                return colors(d.properties.data[setname])
            } else {
                return '#fff';
            }

        })
        .style('opacity', 0.95)
        .on('mousemove', show_tooltip)
        .on('mouseout', hide_tooltip);


    function hide_tooltip(d) {
        d3.selectAll('.country').style('opacity', 0.95)
            .attr('stroke', '#999');
        d3.select(this)
            .attr('stroke', '#999');
        tooltip
            .style('display', 'none')
    }

}
