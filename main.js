// Creates a bootstrap-slider element
$("#yearSlider").slider({
    tooltip: 'always',
    tooltip_position:'bottom'
});
// Listens to the on "change" event for the slider
$("#yearSlider").on('change', function(event){
    // Update the chart on the new value
    updateChart(event.value.newValue);
});

// Color mapping based on continents
var contintentColors = {Asia: '#fc5a74', Europe: '#fee633',
    Africa: '#24d5e8', Americas: '#82e92d', Oceania: '#fc5a74'};


d3.csv('./data/gapminder.csv',
    function(d){
        // This callback formats each row of the data
        return {
            country: d.country,
            year: +d.year,
            population: +d.population,
            continent: d.continent,
            lifeExp: +d.lifeExp,
            gdpPercap: +d.gdpPercap
        }
    },
    function(error, dataset){
        if(error) {
            console.error('Error while loading ./gapminder.csv dataset.');
            console.error(error);
            return;
        }


        // **** Set up your global variables and initialize the chart here ****

    var svg = d3.select('svg');
    padding = {t: 60, r: 40, b: 30, l: 40};

    var svgWidth = +svg.attr('width');
    var svgHeight = +svg.attr('height');

    bubbleChart = svg.append('g');

    //Scales
    var minGDP = d3.min(dataset, function(d){
            return d.gdpPercap;
        });

    var maxGDP = d3.max(dataset, function(d){
            return d.gdpPercap;
        });

    var xDomain =[minGDP,maxGDP];
    var xRange = [0,(svgWidth - padding.l - padding.r)];
    xScale = d3.scaleLog()
        .domain(xDomain)
        .range(xRange);


    var maxLifeExp = d3.max(dataset, function(d){
            return d.lifeExp;
        });

    var yDomain =[0,maxLifeExp];
    var yRange = [(svgHeight - padding.b - padding.t), padding.t];


    yScale = d3.scaleLinear()
        .domain(yDomain)
        .range(yRange);

    var maxPop = d3.max(dataset, function(d){
            return d.population;
        });

    var rDomain =[0,maxPop];
    var rRange = [1,60];
    rScale = d3.scaleSqrt()
        .domain(rDomain)
        .range(rRange);


    var nestOnYears = d3.nest()
        .key(function(d) {return d.country;})
        .entries(dataset);

    var continents = nestOnYears.map(function(d) {

        return d.key;
    });

    colorScale = d3.scaleOrdinal()
        .domain(continents)
        .range(contintentColors);

    countries = dataset;


    var xTicks = [500, 1000, 2000, 4000, 8000, 16000, 32000, 64000];
    var yTicks = [30, 40, 50, 60, 70, 80];


    var xGrid =d3.axisTop(xScale)
        .tickSize(-(svgHeight - padding.t*2 - 0.5), 0, 0)
        .tickFormat('')
        .tickValues(xTicks);

    bubbleChart.append('g')
        .attr('transform', "translate(" + [padding.l, padding.t] + ")")
        .call(xGrid);

    var yGrid = d3.axisLeft(yScale)
        .tickSize(-svgWidth, 0, 0)
        .tickFormat('')
        .ticks(5);


    bubbleChart.append('g')
        .attr('transform', "translate(" + [padding.l, 0] + ")")
        .call(yGrid);


    // Axis
    var xAxis = d3.axisBottom(xScale)
        .tickValues(xTicks)
        .tickFormat(function(d){return d;});

    bubbleChart.append('g')
            .attr('class', 'x_axis')
            .attr('transform', "translate(" + [padding.l, svgHeight - padding.b * 2] + ")")
            .call(xAxis);

    var yAxis = d3.axisLeft(yScale)
        .tickValues(yTicks)
        .tickFormat(function(d){return d;});

    bubbleChart.append('g')
            .attr('class', 'y_axis')
            .attr('transform', "translate(" + [padding.l, 0] + ")")
            .call(yAxis);

    // Axis Label
    bubbleChart.append('text')
            .attr('class', 'axis-label')
            .attr('transform', 'translate('+[padding.l*5, svgHeight - padding.b/2]+')')
            .text('Income Per Person, GDP/capitain $/year adjusted for inflation');

    bubbleChart.append('text')
            .attr('class', 'axis-label')
            .attr('transform', 'translate('+[2*padding.l, padding.b]+')')
            .text('Life Expectancy, years');

    bubbleChart.append('text')
            .attr('class', 'chart-label')
            .attr('transform', 'translate('+[svgWidth - 4*padding.l, padding.b]+')')
            .text('GapMinder Countries');

    updateChart(1952);
    });

function updateChart(year) {
    // **** Update the chart based on the year here ****
    var filterCountries = countries.filter(function(d){
        return d.year == year;
    });

    var circles = bubbleChart.selectAll('.country_circle')
        .data(filterCountries, function(d) {
            return d.country;
        });

    var circlesEnter = circles.enter()
        .append('g')
        .attr('class', 'country_circle');

    circlesEnter
        .append('circle')
        .attr('cx', function(d) {return xScale(d.gdpPercap) + 1.5*padding.l;})
        .attr('cy', function(d){return yScale(d.lifeExp) - padding.b;})
        .attr('r', function(d){return rScale(d.population);})
        .attr('fill', function(d){console.log(contintentColors[d.continent]); return contintentColors[d.continent];});

    circles.merge(circlesEnter)
        .select('circle')
        .attr('cx', function(d) {return xScale(d.gdpPercap) + 1.5*padding.l;})
        .attr('cy', function(d){return yScale(d.lifeExp) - padding.b;})
        .attr('r', function(d){return rScale(d.population);});

    var filterCountries = countries.filter(function(d){
        return d.year == year;
    });
}
