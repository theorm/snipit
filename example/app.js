var width = 300,
    height = 300,
    radius = Math.min(width, height) / 2;

var color = d3.scale.ordinal()
    .range(["#98abc5", "#8a89a6", "#7b6888"]);

var arc = d3.svg.arc()
    .outerRadius(radius - 10)
    .innerRadius(radius - 70);

var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) { return d.text.length; });

var svg = d3.select("#pie").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var data = [
    {label: 'js', text: d3.select("#js")[0][0].outerHTML},
    {label: 'html', text: d3.select("#html")[0][0].outerHTML},
    {label: 'less', text: d3.select("#less")[0][0].outerHTML},
];

for (var k in data) {

    var g = svg.selectAll(".arc")
        .data(pie(data))
        .enter()
            .append("g")
            .attr("class", "arc");

    g.append("path")
        .attr("d", arc)
        .style("fill", function(d) { return color(d.data.label); });

    g.append("text")
        .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
        .attr("dy", ".35em")
        .style("text-anchor", "middle")
        .text(function(d) { return d.data.label; });
}