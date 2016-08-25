// note uses userChecked from markUsers.js (coffee)

function refreshVis() {
  if (userdata != []) {
    OPTS = getOptions();
    var lineChecked = document.getElementById('showLines').checked;
    var dotChecked = document.getElementById('showDots').checked;
    
    OPTS.lineChecked = lineChecked;
    OPTS.dotChecked = dotChecked;
    drawVis(userdata, "#VIS", 800, 800, OPTS);
  }
}

VisData = {}; // allow access to the data for thevis
var dClrsUsers = {};

function drawVis(userdata, anchorname, W, H, OPTS) {
    //var bDrawLines = OPTS['DrawLines'];
    //var bDrawEndPoints = OPTS['DrawEndPoints'];
    //var bDrawDiamonds = OPTS['DrawDiamonds'];
    //var bDrawArrows = OPTS['DrawArrows'];

    var dotdata = userDots(userdata);
    var linedata = userLines(userdata);
    VisData.dotdata = dotdata;
    VisData.linedata = linedata;

    var getX = function(d) {return d.x;},
        getY = function(d) {return d.y;},
        dotXs = dotdata.map(getX),
        dotYs = dotdata.map(getY);

    var fClrsUsers = d3.scale.category20();
    dClrsUsers = mapColors(dotdata, fClrsUsers);

    var xOffset = 10, yOffset = 10,
        dotDiam = 6, lineThick = 4;
    
    // functions from data space to vis space
    var fScaleX = d3.scale.linear()
                          .domain([Math.min.apply(null, dotXs),
                                   Math.max.apply(null, dotXs)])
                          .range([0, W-2*xOffset]);
    var fScaleY = d3.scale.linear()
                          .domain([Math.min.apply(null, dotYs),
                                   Math.max.apply(null, dotYs)])
                          .range([0, H-2*yOffset]);

    // functions combining data->vis space fcns with getX or getY
    var fGetScaledX = function(d){return fScaleX(getX(d)) + xOffset;},
        fGetScaledY = function(d){return fScaleY(getY(d)) + yOffset;}

    var divTooltip = d3.select("body").append("div")
                                      .attr("class", "tooltip")
                                      .style("opacity", 0)
                                      .style("position", "absolute")
                                      .style("width", "200px")
                                      .style("background-color", "#ee0")
                                      .style("pointer-events", "none");

    var svg = d3.select(anchorname)
      //.append("g") // svg group and .call are for zooming
      .call(d3.behavior.zoom()
	    .x(fScaleX)
            .y(fScaleY)
            .scaleExtent([1, 80])
            .on("zoom", fZoom));

    svg.append("rect") // background rect means zoom affects whole area
      .attr("width", W)
      .attr("height", H)
      .attr("fill", "transparent")

    // remove old dots and lines
    svg.selectAll(".dot").remove();
    svg.selectAll(".line").remove();

    // filter data by users checked off
    dotdata = dotdata.filter( function(x){return userChecked(x.user);});
    linedata = linedata.filter( function(x){return userChecked(x.user);});
    
    // draw the lines
    var lineFunction = d3.svg.line()
       .x(function(d) { return fGetScaledX(d) ; })
       .y(function(d) { return fGetScaledY(d) ; })
       .interpolate("cardinal");
    var fTwoSegments = function(ld) { // turn one linedatum into 2 segments
       return [ { x:ld.x1, y:ld.y1 },
                halfwayBump(ld, ld['backward']),
                //{ x:ld.x1 + (ld.x2-ld.x1)/2, y:ld.y1 + (ld.y2-ld.y1)/2 },
                { x:ld.x2, y:ld.y2 } ];
    };
    var lines = svg.selectAll(".line")
       .data(linedata)
       .enter().append("path")
       .attr("class", function(d){return "line user" + d.user;})
      //.attr("d", function(d){return lineFunction(fTwoSegments(d));})
       .attr("stroke", function(d) {
	       if (d.customColor) {
		 return d.customColor;
               } else {
                 return dClrsUsers[d.user];
               } })
       .attr("stroke-width", function(d){ //Added this to accomadate varying line width based on read count
            return 2.5+d.count/9;
       })
       .attr("marker-mid", "url(#inlineMarker)")
       .style("fill", "transparent")
       .on("click", function(d) { updateInfoBox(d.info);
                                  updateSharedTokens(d.info, 'line'); })
       .on("mouseover", function(d) {
              divTooltip.transition()
                   .duration(200)
                   .style("opacity", .9);
              divTooltip.html(d.info + "<br/>")
                     .style("left", (d3.event.pageX + 5) + "px")
                     .style("top", (d3.event.pageY - 28) + "px");
              divTooltip.style("background-color", dClrsUsers[d.user]);
	   })
       .on("mouseout", function(d) {
              divTooltip.transition()
                   .duration(500)
                   .style("opacity", 0);
           })

    if(!OPTS.lineChecked){svg.selectAll(".line").remove();} //Sriram: added this to remove lines with lineChecked is not checked.


    // draw dots
    var dots = svg.selectAll(".dot")
       .data(dotdata)
       .enter().append("circle")
       .attr("class", function(d){str = d.info;
                                    DFNo = str.slice(15,17);
                                    return "dot user" + d.user +" DF"+ DFNo;
                                    
                            //      return "dot user" + d.user;
                                 })
       .attr("r", dotDiam)
      // .attr("cx", fGetScaledX)
      // .attr("cy", fGetScaledY)
      .style("fill", function(d) {
	               if (d.customColor) {
		         return d.customColor;
                       } else {
                         return dClrsUsers[d.user]; //{return d3.rgb("#777");}) 
                       } })  
       .on("click", function(d) { updateInfoBox(d.info);
                                  newDfInfo = d.info.slice(24,9999999) //Sriram: Adding this to ignore "Top key words"
                                  updateSharedTokens(newDfInfo, 'dot'); 
                                  str = d.info; console.log(str);
                                  tempDFNo = str.slice(15,17);
                                  tempName = ".dot.user" + d.user+".df"+tempDFNo; console.log(tempName); //creating temp identifier
                                  svg.selectAll(tempName)
                                      //.attr('r',12)
                                      //.style("fill", "transparent")       
                                      //.style("stroke", "red");  
                                      //.attr('r',100)
                                      .style('fill',d3.rgb('blue')); //Sriram:changes the color to black upon click
                                    })
       .on("mouseover", function(d) {
               divTooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
               divTooltip.html("<b>User " + d.user + "</b><br/>"+
 			      d.info)
                      .style("left", (d3.event.pageX + 5) + "px")
                      .style("top", (d3.event.pageY - 28) + "px");
               divTooltip.style("background-color", dClrsUsers[d.user]);
           })
       .on("mouseout", function(d) {
               divTooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
           })
       .attr("transform", fTransform);

    if(!OPTS.dotChecked){svg.selectAll(".dot").remove();}//Sriram: added this to remove dots when dotChecked is not checked.

    fZoom(lines); // initial positioning calculation
  
    function fZoom() {
        dots.attr("transform", fTransform);
        //lines.attr("transform", fTransformLine);
        svg.selectAll(".line")
           .attr("d",  function(d){return lineFunction(fTwoSegments(d));});
    }


    function fTransform(d) {
      return "translate(" + fGetScaledX(d) + "," + fGetScaledY(d) + ")";
    }

}
