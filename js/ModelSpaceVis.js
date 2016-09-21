// note uses userChecked from markUsers.js (coffee)

function refreshVis() {
  if (userdata != []) {

    OPTS = getOptions();
    clearTokenBox();//Sriram:Added this to clear infoBox First 
    var lineChecked = document.getElementById('showLines').checked;
    var dotChecked = document.getElementById('showDots').checked;
    
    var shadeState = document.getElementById("shadeOpts").value;
    //var shadeState = shadeOpts.options[shadeOpts.selectedIndex].value;

    var widthState = document.getElementById("widthOpts").value;
    //var widthState = widthOpts.options[widthOpts.selectedIndex].value;
    
    var groupChecked = document.getElementById('colorByGroup').checked;
    //var lineColChecked = document.getElementById('colorByCount').checked;
    //var lineThickChecked = document.getElementById('widthByCount').checked;
    var legendChecked = document.getElementById('legendShowYes').checked;

    OPTS.lineChecked = lineChecked;
    OPTS.dotChecked = dotChecked;
    OPTS.groupChecked = groupChecked;
    
    console.log(shadeState);

    OPTS.lineColNoneChecked_s = shadeState == "none_s";
    OPTS.lineColSearchChecked_s = shadeState == "searchCount_s";
    OPTS.lineColReadChecked_s = shadeState == "readCount_s";
    OPTS.lineColMoveChecked_s = shadeState == "moveCount_s";
    OPTS.lineColTimeChecked_s = shadeState == "time_s";


    OPTS.lineColNoneChecked_t = widthState == "none_t";
    OPTS.lineColSearchChecked_t = widthState == "searchCount_t";
    OPTS.lineColReadChecked_t = widthState == "readCount_t";
    OPTS.lineColMoveChecked_t = widthState == "moveCount_t";
    OPTS.lineColTimeChecked_t = widthState == "time_t";

    OPTS.showLegendYes = legendChecked;


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
    
    dUserGroup = {4:1, 7:1, 11:1, 13:1, 3:4, 10:4, 2:6, 9:6, 6:10};
    dUserGroupAltColors = {4:1, 7:2, 11:3, 13:4, 3:5, 10:6, 2:7, 9:8, 6:9}; //Sriram: this is done to ensure the coloring order is met

    if(!OPTS.groupChecked){
    var fClrsUsers = d3.scale.category20();
    dClrsUsers = mapColors(dotdata, fClrsUsers);
    //color the users according to their number
    d3.selectAll(".opt").selectAll(".userLegendBox").remove();

    for (var key in dUserGroup){
      var userNumber = ".u"+key;
      //var childText = "<div style='background:'"
      var selectNode = d3.selectAll(".opt").filter(userNumber)
	.insert("div", ":first-child").style("width", 140).style("clear", "both")
                .attr("class","userLegendBox")
                .append("div")
                .style("width","30")
                .style("height","14px")
                .style("float", "right")
                .style("padding-top", "2px")
                //.style("position","relative")
                //.style("right", "-100")
                //.style("top","-17")
                .style("border-radius","2px")
                .style("background",dClrsUsers[dUserGroupAltColors[key]]);
        }
    }

    if(OPTS.groupChecked){//Sriram: if gorup is checked color selection process:

    //'SandE': [4,7,11,13]
    //'Professionals': [3,10]
    //'Interns': [2,9],
    //'Other': [6]
   d3.selectAll(".opt").selectAll(".userLegendBox").remove();


    var fClrsUsers = d3.scale.category20();
    dClrsUsers = mapColors(dotdata, fClrsUsers);

    for (var key in dUserGroup){
      var userNumber = ".u"+key;
      //var childText = "<div style='background:'"
      var selectNode = d3.selectAll(".opt").filter(userNumber)
.insert("div", ":first-child").style("width", 140).style("clear", "both")
                .attr("class","userLegendBox")
                .append("div")
                .style("width","30")
                .style("height","14px")
                .style("float", "right")
                .style("padding-top", "2px")
                //.style("position","relative")
                //.style("right", "-100")
                //.style("top","-17")
                .style("border-radius","2px")
                .style("background",dClrsUsers[dUserGroup[key]]);

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
                  if(OPTS.lineColNoneChecked_s){if(!OPTS.groupChecked){return dClrsUsers[dUserGroupAltColors[d.user]];}else{return dClrsUsers[dUserGroup[d.user]];}}
                  if(OPTS.lineColSearchChecked_s){colVal=Math.round(255/27 * (23-d.searchCount)); return d3.rgb(colVal,colVal,colVal);}
                  if(OPTS.lineColReadChecked_s){colVal=Math.round(255/77 * (69-d.readCount)); return d3.rgb(colVal,colVal,colVal);}
                  if(OPTS.lineColMoveChecked_s){colVal=Math.round(255/27 * (21-d.interactionCount)); return d3.rgb(colVal,colVal,colVal);}
                  if(OPTS.lineColTimeChecked_s){
                    //<b>From</b> 15:53:00 <b>for</b> 0:10:15<br />
                    hour = parseFloat(d.info.slice(31,33)); min = parseFloat(d.info.slice(34,36)); 
                    sec = parseFloat(d.info.slice(37,39)); 
                    colVal = Math.round(255 - hour*20 - min*3.9 - sec*1.5); if(colVal<0){colVal = 0;}
                    return d3.rgb(colVal,colVal,colVal);
                  }

                  if(OPTS.groupChecked){ return dClrsUsers[dUserGroup[d.user]];} //Sriram: this is done to group entire color the same
                                
               
                 //return dClrsUsers[d.user];
               } })
       .attr("stroke-width", function(d){ //Sriram:Added this to accomadate varying line width based on read count
          if(OPTS.lineColTimeChecked_t){
                    hour = parseFloat(d.info.slice(31,33)); min = parseFloat(d.info.slice(34,36)); 
                    sec = parseFloat(d.info.slice(37,39)); 
                    console.log(hour, min, sec);
                    console.log(2.5 + hour + min/5 + sec/15);
                    return 2.5 + hour*2 + min/3.5 + sec/30;
                  }
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
              divTooltip.style("background-color", function(){
              if(OPTS.groupChecked){ //Sriram: this is done to group entire color the same
                  return dClrsUsers[dUserGroup[d.user]];
               }
                else{return dClrsUsers[dUserGroupAltColors[d.user]];}})
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
                         return dClrsUsers[dUserGroupAltColors[d.user]]; //{return d3.rgb("#777");}) 
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
               divTooltip.style("background-color", function(){
                console.log(d);
              if(OPTS.groupChecked){ //Sriram: this is done to group entire color the same
                  return dClrsUsers[dUserGroup[d.user]];
               }
                else{return dClrsUsers[dUserGroupAltColors[d.user]];}});
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

    // show a legend for line and dot width and grayscale values
    if(OPTS.showLegendYes){addLegend(svg, OPTS, W, H);}
    if(!OPTS.showLegendYes){svg.selectAll(".legend-box").remove();}

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
        // add a legend describing the values associated with different line/dot
    // sizes and (grayscale) colors
    function addLegend(svg, OPTS, W, H) {
      var boxColor = d3.rgb(255, 255, 255);
      var borderColor = d3.rgb(0, 0, 0);
      var singleLegendWidth = 140;
      var singleLegendHeight = 100;  
      var edgeBuffer = 20;
      var currentRectLeftX = W - edgeBuffer - singleLegendWidth;
      var edgeOffset = 6;
      var midMargin = 4;
      var topMargin = 30;
      var halfHeight = (singleLegendHeight - topMargin)/ 2;
      var halfWidth = (singleLegendWidth - 2*edgeOffset)/2;
      var lineWidth = singleLegendWidth/2 - 2*edgeOffset - midMargin;
      
      // remove old legends
      svg.selectAll(".legend-box").remove();


      // for lines (shading)
      //read
      //move
      //search

          //if(OPTS.lineColSearchChecked_s){colVal=Math.round(255/27 * (23-d.searchCount)); return d3.rgb(colVal,colVal,colVal);}
          //if(OPTS.lineColReadChecked_s){colVal=Math.round(255/77 * (69-d.readCount)); return d3.rgb(colVal,colVal,colVal);}
          //if(OPTS.lineColMoveChecked_s){colVal=Math.round(255/27 * (21-d.interactionCount)); return d3.rgb(colVal,colVal,colVal);}

      


      //Line Color:
      function lineShadeSearch(x) {return Math.round(255/27 * (23-x));}
      function lineShadeRead(x) {return Math.round(255/77 * (69-x));}
      function lineShadeMove(x) {return Math.round(255/27 * (21-x));}
      function lineShadeTime(h,m,s){colVal = Math.round(255 - h*20 - m*3.9 - s*1.5); if(colVal<0){colVal = 0;}
                                    return colVal;}
      /*if (OPTS.lineColSearchChecked_s || OPTS.lineColReadChecked_s || OPTS.lineColMoveChecked_s) {
          legendBox = drawbox();
         
          // formula for intensity: 255/90 * (80-d.count)
          // range is [2, 78] -> [221, 3]
          addLegendBoxTitle(legendBox, "Move Count-Shade");
          drawShadedSizedLine(legendBox, 221, 12, true);
          addLegendValue(legendBox, 2, true);
          drawShadedSizedLine(legendBox, 3, 12, false);
          addLegendValue(legendBox, 78, false);

          currentRectLeftX -= singleLegendWidth + 10;
      }*/

      /*
          legendBox = drawbox();

          addLegendBoxTitle(legendBox, "Move Count-Width");
          drawShadedSizedLine(legendBox, 130, lineThickVal(2), true);
          addLegendValue(legendBox, "2", true);
          drawShadedSizedLine(legendBox, 130, lineThickVal(73), false);
          addLegendValue(legendBox, "73", false);

          currentRectLeftX -= singleLegendWidth + 10;

      */
            // Search
      if (OPTS.lineColSearchChecked_s) {
          legendBox = drawbox();

          // formula for intensity: 255-Math.round(255*(d.acc-0.895)*8.5)
          addLegendBoxTitle(legendBox, "Search-Shade");
          drawShadedSizedLine(legendBox, lineShadeSearch(20), 12, true);
          addLegendValue(legendBox, "20", true);
          drawShadedSizedLine(legendBox, lineShadeSearch(0), 12, false);
          addLegendValue(legendBox, "0", false);

          currentRectLeftX -= singleLegendWidth + 10;
      }
      //Read
      if (OPTS.lineColReadChecked_s) {
          legendBox = drawbox();

          // formula for intensity: 255-Math.round(255*(d.acc-0.895)*8.5)
          addLegendBoxTitle(legendBox, "Read-Shade");
          drawShadedSizedLine(legendBox, lineShadeRead(68), 12, true);
          addLegendValue(legendBox, "68", true);
          drawShadedSizedLine(legendBox, lineShadeRead(22), 12, false);
          addLegendValue(legendBox, "22", false);

          currentRectLeftX -= singleLegendWidth + 10;
      }

        //Move
      if (OPTS.lineColMoveChecked_s) {
          legendBox = drawbox();

          // formula for intensity: 255-Math.round(255*(d.acc-0.895)*8.5)
          addLegendBoxTitle(legendBox, "Move-Shade");
          drawShadedSizedLine(legendBox, lineShadeMove(21), 12, true);
          addLegendValue(legendBox, "21", true);
          drawShadedSizedLine(legendBox, lineShadeMove(2), 12, false);
          addLegendValue(legendBox, "2", false);

          currentRectLeftX -= singleLegendWidth + 10;
      }
      //Time
      if (OPTS.lineColTimeChecked_s) {
          legendBox = drawbox();

          // formula for intensity: 255-Math.round(255*(d.acc-0.895)*8.5)
          addLegendBoxTitle(legendBox, "Time-Shade");
          drawShadedSizedLine(legendBox, lineShadeTime(4,27,1), 12, true);
          addLegendValue(legendBox, ">1000sec", true);
          drawShadedSizedLine(legendBox, lineShadeTime(0,0,11), 12, false);
          addLegendValue(legendBox, "11sec", false);

          currentRectLeftX -= singleLegendWidth + 10;
      }


      //if(OPTS.lineColSearchChecked_t){return 2.5+d.searchCount/2.8;}
      //if(OPTS.lineColReadChecked_t){return 2.5+d.readCount/9.5;}
      //if(OPTS.lineColMoveChecked_t){return 2.5+d.interactionCount/2;}


      // for lines (thickness)
      function lineThickSearch(x) {return 2.5+x/2.8;}
      function lineThickRead(x) {return 2.5+x/9.5;}
      function lineThickMove(x) {return 2.5+x/2;}
      function lineThickTime(h,m,s) {return 2.5 + h*2 + m/3.5 + s/30;}

      /*if (OPTS.lineColSearchChecked_t || OPTS.lineColReadChecked_t || OPTS.lineColMoveChecked_t) {
          legendBox = drawbox();

          // formula for thickness: 2.5+d.count/8
          // range is [2, 78] -> [2.75, 12.25]
          addLegendBoxTitle(legendBox, "Move Count-Width");
          drawShadedSizedLine(legendBox, 130, 2.75, true);
          addLegendValue(legendBox, "2", true);
          drawShadedSizedLine(legendBox, 130, 12.25, false);
          addLegendValue(legendBox, "78", false);

          currentRectLeftX -= singleLegendWidth + 10;
      }*/
      
      //Search

      if (OPTS.lineColSearchChecked_t) {
          legendBox = drawbox();

          // formula for intensity: 255-Math.round(255*(d.acc-0.895)*8.5)
          addLegendBoxTitle(legendBox, "Search-Width");
          drawShadedSizedLine(legendBox, 130, lineThickSearch(20), true);
          addLegendValue(legendBox, "20", true);
          drawShadedSizedLine(legendBox, 130, lineThickSearch(0), false);
          addLegendValue(legendBox, "0", false);

          currentRectLeftX -= singleLegendWidth + 10;
      }

      //Read
      if (OPTS.lineColReadChecked_t) {
          legendBox = drawbox();

          // formula for intensity: 255-Math.round(255*(d.acc-0.895)*8.5)
          addLegendBoxTitle(legendBox, "Read-Width");
          drawShadedSizedLine(legendBox, 130, lineThickRead(68), true);
          addLegendValue(legendBox, "68", true);
          drawShadedSizedLine(legendBox, 130, lineThickRead(22), false);
          addLegendValue(legendBox, "22", false);

          currentRectLeftX -= singleLegendWidth + 10;
      }

        //Move
      if (OPTS.lineColMoveChecked_t) {
          legendBox = drawbox();

          // formula for intensity: 255-Math.round(255*(d.acc-0.895)*8.5)
          addLegendBoxTitle(legendBox, "Move-Width");
          drawShadedSizedLine(legendBox, 130, lineThickMove(21), true);
          addLegendValue(legendBox, "21", true);
          drawShadedSizedLine(legendBox, 130, lineThickMove(2), false);
          addLegendValue(legendBox, "2", false);

          currentRectLeftX -= singleLegendWidth + 10;
      }

        //Time
      if (OPTS.lineColTimeChecked_t) {
          legendBox = drawbox();

          // formula for intensity: 255-Math.round(255*(d.acc-0.895)*8.5)
          addLegendBoxTitle(legendBox, "Time-Width");
          drawShadedSizedLine(legendBox, 130, lineThickTime(4,27,1), true);
          addLegendValue(legendBox, ">1000sec", true);
          drawShadedSizedLine(legendBox, 130, lineThickTime(0,0,11), false);
          addLegendValue(legendBox, "11sec", false);

          currentRectLeftX -= singleLegendWidth + 10;
      }





        function drawShadedSizedLine(drawBox, lineIntensity, lineThick, isTopLine) {
            var lineX = edgeOffset;
            var lineY = topMargin + halfHeight/2 - lineThick/2;
            if (!isTopLine) { lineY += halfHeight; }
            
            drawBox.append("rect")
                .attr("x", lineX)
                .attr("y", lineY)
                .attr("width", lineWidth)
                .attr("height", lineThick)
                .attr("fill", d3.rgb(lineIntensity, lineIntensity, lineIntensity));
        }

        function drawShadedSizedDot(drawBox, dotIntensity, radius, isTopDot) {
            var dotX = edgeOffset + lineWidth/2;
            var dotY = topMargin + halfHeight/2 - radius/2;
            if (!isTopDot) { dotY += halfHeight; }
            
            if (dotIntensity > 250) { // draw a halo if dot will be too light
              drawBox.append("circle")
                .attr("cx", dotX)
                .attr("cy", dotY)
                .attr("r", radius + 1)
                .attr("fill", d3.rgb(50, 50, 50));
            }

            drawBox.append("circle")
                .attr("cx", dotX)
                .attr("cy", dotY)
                .attr("r", radius)
                .attr("fill", d3.rgb(dotIntensity, dotIntensity, dotIntensity));
        }

        function addLegendValue(drawBox, txtValue, isTopLine) {
            var lineX = edgeOffset + 2*midMargin + halfWidth + halfWidth/2;
            var lineY = topMargin + halfHeight/2 - lineThick/2;
            if (!isTopLine) { lineY += halfHeight; }

            drawBox.append("text")
                   .attr("x", lineX)
                   .attr("y", lineY)
                   .attr("text-anchor", "middle")
                   .attr("dominant-baseline", "central")
                   //.attr("dy", ".5em")
                   .attr("font-family", "sans-serif")
                   .attr("font-size", "13px")
                   .attr("fill", "black")
                   .text(txtValue)
        }

        function addLegendBoxTitle(drawBox, title) {
            var lineX = edgeOffset + halfWidth;
            var lineY = topMargin/2;
            drawBox.append("text")
                   .attr("x", lineX)
                   .attr("y", lineY)
                   .attr("text-anchor", "middle")
                   .attr("dominant-baseline", "central")
                   //.attr("dy", ".5em")
                   .attr("font-family", "sans-serif")
                   .style('font-weight', 'bold')
                   .attr("font-size", "13px")
                   .attr("fill", "black")
                   .text(title)
        }

        function drawbox() {
            var transstr = "translate("+ currentRectLeftX +","+
                                      (H - singleLegendWidth - edgeBuffer)+")";
            var newBox = svg.append("g")
              .attr("class", "legend-box")
              .attr("transform", transstr)

            newBox.append("rect")
              .attr("x", 0)
              .attr("y", 0)
              .attr("width", singleLegendWidth)
              .attr("height", singleLegendHeight)
              .attr("fill", boxColor)
              .attr("stroke", borderColor)

            return newBox;
      }
    }

}
