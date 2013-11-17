'use strict';

angular.module('bmlayersApp')
  .directive('curve', function () {
    return {
      template: '<div></div>',
      restrict: 'E',
      scope:{
        curves: '='
      },
      link: function postLink(scope, element, attrs) {
          createCurves(element, scope.curves);
          
          function createCurves(element, curves)  {
  var w = element.width(),
    h = element.height(),
    padding = 10;


var svg =d3.select(element[0]).append("svg");


svg.append("defs").append("marker")
    .attr("id", "arrowhead")
    //.attr("refX", 6 + 3) /*must be smarter way to calculate shift*/
    .attr("refY", 2)
    .attr("markerWidth", 6)
    .attr("markerHeight", 4)
    //.attr('markerUnits', 'userSpaceOnUse')
    .attr("orient", "auto")
    .append("path")
        .attr('class', 'marker')
        .attr("d", "M 0,0 V 4 L6,2 Z");
                
        
var vis = svg
    .attr("width", w + 2 * padding)
    .attr("height", h + 2 * padding)
    .selectAll('g').data(curves);
    
    vis.enter()
      .append("g")
      .attr("transform", "translate(" + padding + "," + padding + ")");

    vis.call(function(d){
      d[0].forEach(function(g){
        createCurve(d3.select(g), w, h);
      })
    });
}

function createCurve(vis, w, h){
 var bezier = {},
    t = .5,
    delta = .01,
    line = d3.svg.line().interpolate('cardinal').x(x).y(y),
    points = vis.datum().points;
update();

vis.selectAll("circle.control")
    .data(points)
  .enter().append("circle")
    .attr("class", "control")
    .attr("r", 7)
    .attr("cx", x)
    .attr("cy", y)
    .call(d3.behavior.drag()
      .on("dragstart", function(d) {
        this.__origin__ = [d.x, d.y];
      })
      .on("drag", function(d) {
          d.x = Math.min(w, Math.max(0, this.__origin__[0] += d3.event.dx));
          d.y = Math.min(h, Math.max(0, this.__origin__[1] += d3.event.dy));
          bezier = {};
          update();
          vis.selectAll("circle.control")
            .attr("cx", x)
            .attr("cy", y);
         
      })
      .on("dragend", function(d) {
        scope.$apply(function(){
          d.x = d.x+0;
          d.y = d.y+0;
        });
        delete this.__origin__;
      }));

var last = 0;
d3.timer(function(elapsed) {
  t = (t + (elapsed - last) / 5000) % 1;
  if(elapsed - last > 3000){
    update();
    last = elapsed;
  }
});

function update() {
  var path = vis.selectAll("path.line").data([points]);
  path.enter().append("path")
      .attr("class", "line")
      .attr("marker-end", "url(#arrowhead)");
      
  path.attr("d", line);
  
  vis.selectAll("path.line").each(function(d){
    
  var path = this;
  
  // var path = document.querySelector('.squiggle-animated path');
  var length = path.getTotalLength();
  console.log(length);
  // Clear any previous transition
  path.style.transition = path.style.WebkitTransition =
  'none';
  // Set up the starting positions
  path.style.strokeDasharray = length + ' ' + length;
  path.style.strokeDashoffset = length;
  // Trigger a layout so styles are calculated & the browser
  // picks up the starting position before animating
  path.getBoundingClientRect();
  // Define our transition
  path.style.transition = path.style.WebkitTransition =
  'stroke-dashoffset 3s linear';
  // Go!
  path.style.strokeDashoffset = '0';
  path.style.strokeWidth = '3px';
  
  });
  
  var curve = vis.selectAll("path.curve")
      .data(getCurve(points.length));
  curve.enter().append("path")
      .attr("class", "curve")
      .attr("marker-end", "url(#arrowhead)");
  curve.attr("d", line);
  
  var curveShadow = vis.selectAll("path.curveShadow")
      .data([bezier[points.length]]);
  curveShadow.enter().append("path")
      .attr("class", "curveShadow")
  curveShadow.attr("d", line);
}

function interpolate(d, p) {
  if (arguments.length < 2) p = t;
  var r = [];
  for (var i=1; i<d.length; i++) {
    var d0 = d[i-1], d1 = d[i];
    r.push({x: d0.x + (d1.x - d0.x) * p, y: d0.y + (d1.y - d0.y) * p});
  }
  return r;
}

function getLevels(d, t_) {
  if (arguments.length < 2) t_ = t;
  var x = [points.slice(0, d)];
  for (var i=1; i<d; i++) {
    x.push(interpolate(x[x.length-1], t_));
  }
  return x;
}

function getCurve(d) {
  var curve = bezier[d];
  if (!curve) {
    curve = bezier[d] = [];
    for (var t_=0; t_<=1; t_+=delta) {
      var x = getLevels(d, t_);
      curve.push(x[x.length-1][0]);
    }
  }
  return [curve.slice(0, t / delta + 1)];
}


}

function x(d) { return d.x; }
function y(d) { return d.y; }
          
          
      }
    };
  });
  
  
