// Gets a reference to the VisData object and the name of a text
// box the holds the search search string.
// Decorates the VisData with custom colors when search applies.
function textSearchColor(searchBox, visSVGName) {
  var searchStr = document.getElementById(searchBox).value;
  var svg = d3.select(visSVGName)

  // go through each point and line 
  svg.selectAll(".dot")
    .style("fill", function(d) { return colorChoice(d, searchStr); })
  svg.selectAll(".line")
    .style("stroke", function(d) { return colorChoice(d, searchStr); })

}


function textSearchColorReset(visSVGName) {
  var svg = d3.select(visSVGName)

  // go through each point and line 
  svg.selectAll(".dot")
     .style("fill", function(d) { return dClrsUsers[d.user]; })
  svg.selectAll(".line")
     .style("stroke", function(d) { return dClrsUsers[d.user]; })

}


// set color inside update loops for lines and dots
function colorChoice(d, searchStr) {
  if (d.info.toLowerCase().search(searchStr.toLowerCase()) != -1) {
    return d3.rgb("#000");
  } else {
    return dClrsUsers[d.user];
  }
}
