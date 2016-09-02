// note uses userChecked from markUsers.js (coffee)

function refreshVis() {
  if (userdata != []) {

    OPTS = getOptions();
    clearTokenBox();//Sriram:Added this to clear infoBox First 
    var lineChecked = document.getElementById('showLines').checked;
    var dotChecked = document.getElementById('showDots').checked;
    
    var shadeOpts = document.getElementById("shadeOpts");
    var shadeState = shadeOpts.options[shadeOpts.selectedIndex].value;

    var widthOpts = document.getElementById("widthOpts");
    var widthState = widthOpts.options[widthOpts.selectedIndex].value;
    


    var groupChecked = document.getElementById('colorByGroup').checked;
    //var lineColChecked = document.getElementById('colorByCount').checked;
    //var lineThickChecked = document.getElementById('widthByCount').checked;

    OPTS.lineChecked = lineChecked;
    OPTS.dotChecked = dotChecked;
    OPTS.groupChecked = groupChecked;
    
    OPTS.lineColNoneChecked_s = shadeState == "none_s";
    OPTS.lineColSearchChecked_s = shadeState == "searchCount_s";
    OPTS.lineColReadChecked_s = shadeState == "readCount_s";
    OPTS.lineColMoveChecked_s = shadeState == "moveCount_s";

    OPTS.lineColNoneChecked_t = widthState == "none_t";
    OPTS.lineColSearchChecked_t = widthState == "searchCount_t";
    OPTS.lineColReadChecked_t = widthState == "readCount_t";
    OPTS.lineColMoveChecked_t = widthState == "moveCount_t";

    //OPTS.lineThickGOsChecked = lineThickChecked;

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
    
    dUserGroup = {4:1, 7:1, 11:1, 13:1, 3:4, 10:4, 2:6, 9:6, 6:10}

    if(!OPTS.groupChecked){
    var fClrsUsers = d3.scale.category20();
    dClrsUsers = mapColors(dotdata, fClrsUsers);
    //color the users according to their number
    for (var key in dUserGroup){
      var userNumber = ".u"+key;
      //var childText = "<div style='background:'"
      var selectNode = d3.selectAll(".opt").filter(userNumber)
                .style("border-radius","10px")
                .style("background",dClrsUsers[key]);
               /* .append("div")
                .attr("class","userLegendColor")
                .style("background",dClrsUsers[key])
                .style("float","right");*/
    

      //.appendChild("div")
        //        .style("background","dClrsUsers[key]")
          //      .style("float","right");

    }

    }

    if(OPTS.groupChecked){//Sriram: if gorup is checked color selection process:

    //'SandE': [4,7,11,13]
    //'Professionals': [3,10]
    //'Interns': [2,9],
    //'Other': [6]
    var fClrsUsers = d3.scale.category20();
    dClrsUsers = mapColors(dotdata, fClrsUsers);

    for (var key in dUserGroup){
      var userNumber = ".u"+key;
      //var childText = "<div style='background:'"
      var selectNode = d3.selectAll(".opt").filter(userNumber)
                .style("border-radius","10px")
                .style("background",dClrsUsers[dUserGroup[key]]);
               /* .append("div")
                .attr("class","userLegendColor")
                .style("background",dClrsUsers[key])
                .style("float","right");*/
    

      //.appendChild("div")
        //        .style("background","dClrsUsers[key]")
          //      .style("float","right");

    }
  

    }


    



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
                                      .style("pointer-events", "none")
                                      .style("padding","8px") //Sriram: Added this to include some padding on the boxes
                                      .style("border-radius","10px");//Sriram: Added this to have rounded corners on the info boxes

    var svg = d3.select(anchorname)
      //.append("g") // svg group and .call are for zooming
      .call(d3.behavior.zoom()
	          .x(fScaleX)
            .y(fScaleY)
            .scaleExtent([1, 80])
            .on("zoom", fZoom));

    svg.append("rect") // background rect means zoom affects whole area
      .attr("width", W) //W:800px, H:800px
      .attr("height", H)
      .attr("fill", "transparent")


    // remove old dots and lines
    svg.selectAll(".dot").remove();
    svg.selectAll(".line").remove();
    svg.selectAll(".cross").remove();

    // filter data by users checked off
    dotdata = dotdata.filter( function(x){return userChecked(x.user);});
    linedata = linedata.filter( function(x){return userChecked(x.user);});
    
    // draw the lines
    var lineFunction = d3.svg.line()
       .x(function(d) { return fGetScaledX(d) ; })
       .y(function(d) { return fGetScaledY(d) ; })
       .interpolate("cardinal");
    var fTwoSegments = function(ld) { // turn one linedatum into 2 fTwoSegmentsnts
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
	               if (d.customColor) {return d.customColor;}
		            else {  //higher readcount means darker lines
                  if(OPTS.lineColNoneChecked_s){if(!OPTS.groupChecked){return dClrsUsers[d.user];}else{return dClrsUsers[dUserGroup[d.user]];}}
                  if(OPTS.lineColSearchChecked_s){colVal=Math.round(255/27 * (23-d.searchCount)); return d3.rgb(colVal,colVal,colVal);}
                  if(OPTS.lineColReadChecked_s){colVal=Math.round(255/77 * (69-d.readCount)); return d3.rgb(colVal,colVal,colVal);}
                  if(OPTS.lineColMoveChecked_s){colVal=Math.round(255/27 * (21-d.interactionCount)); return d3.rgb(colVal,colVal,colVal);}
                  

                  if(OPTS.groupChecked){ return dClrsUsers[dUserGroup[d.user]];} //Sriram: this is done to group entire color the same
                                
               
                 //return dClrsUsers[d.user];
               } })
       .attr("stroke-width", function(d){ //Sriram:Added this to accomadate varying line width based on read count

          if(OPTS.lineColNoneChecked_t){return lineThick;}
          if(OPTS.lineColSearchChecked_t){return 2.5+d.searchCount/2.8;}
          if(OPTS.lineColReadChecked_t){return 2.5+d.readCount/9.5;}
          if(OPTS.lineColMoveChecked_t){return 2.5+d.interactionCount/2;}
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
                                    DFNo = str.slice(17,19);
                                    return "dot user" + d.user +" DF"+ DFNo;
                                 })
       .attr("r", dotDiam)
      // .attr("cx", fGetScaledX)
      // .attr("cy", fGetScaledY)
      .style("fill", function(d) {
	               if (d.customColor) {
		         return d.customColor;
                       } else { if(OPTS.groupChecked){ //Sriram: this is done to group entire color the same
                  return dClrsUsers[dUserGroup[d.user]];
               }
                         return dClrsUsers[d.user]; //{return d3.rgb("#777");}) 
                       } })  
       .on("click", function(d) { updateInfoBox(d.info);
                                  newDfInfo = d.info.slice(50,9999999) //Sriram: Adding this to ignore "Top key words"
                                  updateSharedTokens(newDfInfo, 'dot'); 
                                  str = d.info; console.log(str);
                                  tempDFNo = str.slice(17,19);
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
               divTooltip.html("<b style='font-size:20px;'>User " + d.user + "</b>"+
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

    // add a cross at the starting point
    // **** don't do this if no dotdata
    //   create a transform function for the origin (for zoom)
    var fOriginTransform = function() { 
       return "translate(" + fGetScaledX(dotdata[0]) + "," + fGetScaledY(dotdata[0]) + ")";
    };
    var cross1 = svg.append("line") // upper left to lower right
       .attr("class","cross")
       .attr("x1", -5)
       .attr("y1", -5)
       .attr("x2", 5)
       .attr("y2", 5)
       .style("stroke", d3.rgb(0,0,0))
       .style("stroke-width", 4)
       .attr("transform", fOriginTransform);
    var cross2 = svg.append("line") // upper left to lower right
       .attr("class","cross")
       .attr("x1", 5)
       .attr("y1", -5)
       .attr("x2", -5)
       .attr("y2", 5)
       .style("stroke", d3.rgb(0,0,0))
       .style("stroke-width", 4)   
       .attr("transform", fOriginTransform);
    

    fZoom(lines); // initial positioning calculation
  
    function fZoom() {
        dots.attr("transform", fTransform);
        //lines.attr("transform", fTransformLine);
        cross1.attr("transform", fOriginTransform);
        cross2.attr("transform", fOriginTransform);
        svg.selectAll(".line")
           .attr("d",  function(d){return lineFunction(fTwoSegments(d));});
    }


    function fTransform(d) {
      return "translate(" + fGetScaledX(d) + "," + fGetScaledY(d) + ")";
    }

}
