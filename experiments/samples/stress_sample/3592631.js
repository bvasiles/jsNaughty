function initGraphics(jsonfile){

var width = 700,
    height = 250;

var color = d3.scale.category20();

var force = d3.layout.force()
    .charge(-120)
    .linkDistance(30)
    .size([width, height]);

var svg = d3.select("#chart").append("svg")
//.style("width", "100%")
//.style("height","80%");
    .attr("width", width)
    .attr("height", height);

d3.json(jsonfile, function(json) {
  force
      .nodes(json.nodes)
      .links(json.links)
      .start();

  var link = svg.selectAll("line.link")
      .data(json.links)
    .enter().append("line")
      .attr("class", "link")
      .style("stroke-width", function(d) { return Math.sqrt(d.value); });

  var node = svg.selectAll("circle.node")
      .data(json.nodes)
    .enter().append("circle")
      .attr("class", "node")
      .attr("r", function(d){ if( d.group=="pip") return 6; return 5;})
      .style("fill", function(d) { return color(d.group); })
       .on("click", function(d){click(d);})
      .call(force.drag);

  node.append("title")
      .text(function(d) {
    	  if(d.group=="pip")
    	  return d.name+",\n "+d.location;
    	  else
    		  return d.name+",\n "+d.IP;
      });



  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  });

//Toggle children on click.
function click(d) {
	if(d.group=="pip")
  	  document.getElementById("topology-info").innerHTML="PIP ID: " + d.name+";\n Location: "+d.location;
	else
		document.getElementById("topology-info").innerHTML="PR-ID: "+ d.name+";\n\n IP: "+d.IP+";\n\n Port: "+d.port;
}
});

}