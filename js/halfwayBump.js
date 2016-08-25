function dist(x1, y1, x2, y2) {
  return Math.sqrt( (x1-x2)*(x1-x2) +
                    (y1-y2)*(y1-y2) ); }

function halfwayBump(d, bDrawDiamonds) {
  x1 = d.x1; y1 = d.y1; x2 = d.x2; y2 = d.y2;
  var linelen = dist(x1,y1,x2,y2);
  var xdist = 1.0*x2-x1;
  var ydist = 1.0*y2-y1;
  var slope = ydist/xdist;
  var newSlope = -1/slope;
  if (Math.abs(newSlope) > 10) slope=0;

  // find the point on the line with the new slope
  // (perpendicular to original) with the x coord changed
  // to nudge us over a bit (proportional to line len)
  var newX = 0;
  var newY = 0;
  // **** using x1+xdist/2 to get the coord of middle of line... might be wrong
  // if line is going from high to low x (right to left)?
  if (bDrawDiamonds) {
    var eps = 0.01; //0.04;
    var bumpsize = Math.min(Math.max(.0001, eps * linelen), .001);
    if (slope == Infinity || slope == -Infinity) {
      if (ydist < 0) { newX = x1 - bumpsize; }
      else { newX = x1 + bumpsize; }
      newY = y1 + ydist/2.0;
    }
    else if ((slope > 0 && xdist > 0) ||
	     (slope < 0 && xdist < 0))
      {
	newX = x1 + xdist/2.0 + bumpsize;
	newY = newSlope*(newX - (x1+xdist/2.0)) + (y1+ydist/2.0);
      }
    else if ((slope > 0 && xdist < 0) ||
	     (slope < 0 && xdist > 0))
      {
	newX = x1 + xdist/2.0 - bumpsize;
	newY = newSlope*(newX - (x1+xdist/2.0)) + (y1+ydist/2.0);
      }
    else { // slope == 0
      if (xdist < 0) { newY = y1 + bumpsize; }
      else { newY = y1 - bumpsize; }
      newX = x1 + xdist/2.0;
    }
  } else {
    newX = x1 + xdist/2.0;
    newY = y1 + ydist/2.0;
  }
  
  var retval = {};
  retval.x = newX;
  retval.y = newY;
  return retval;
}
