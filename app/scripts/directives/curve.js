'use strict';

angular.module('bmlayersApp')
  .directive('curve', function () {
    return {
      template: '<div></div>',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        element.text('this is the curve directive');
      }
    };
  });
  
var w = 250,
    h = 300,
    t = .5,
    delta = .01,
    padding = 10,
    points = [{x: 10, y: 250}, {x: 0, y: 0}, {x: 100, y: 0}, {x: 200, y: 250}, {x: 250, y: 250}],
    bezier = {},
    line = d3.svg.line().x(x).y(y);


var svg =d3.select("#playground").append("svg");


svg.append("defs").append("marker")
    .attr("id", "arrowhead")
    //.attr("refX", 6 + 3) /*must be smarter way to calculate shift*/
    .attr("refY", 2)
    .attr("markerWidth", 6)
    .attr("markerHeight", 4)
    .attr("orient", "auto")
    .append("path")
        .attr('class', 'marker')
        .attr("d", "M 0,0 V 4 L6,2 Z");
var vis = svg
    .attr("width", w + 2 * padding)
    .attr("height", h + 2 * padding)
  .append("g")
    .attr("transform", "translate(" + padding + "," + padding + ")");

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
      .on("dragend", function() {
        delete this.__origin__;
      }));

var last = 0;
d3.timer(function(elapsed) {
  t = (t + (elapsed - last) / 5000) % 1;
  last = elapsed;
  update();
});

function update() {
  var path = vis.selectAll("path.line").data([points]);
  path.enter().append("path")
      .attr("class", "line")
      .attr("d", line(points));
  path.attr("d", line(points));
  var curve = vis.selectAll("path.curve")
      .data(getCurve(points.length));
  curve.enter().append("path")
      .attr("class", "curve")
      .attr("marker-end", "url(#arrowhead)");
  curve.attr("d", line);
  
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

function x(d) { return d.x; }
function y(d) { return d.y; }
/*
.curve, .line {
  fill: none;
  stroke-width: 1px;
}
.curve {
  stroke: red;
  stroke-width: 3px;
}
.line{
  stroke: grey;
  stroke-width: 1px;
}
.marker{
  fill: red;
}
.control {
  fill: #ccc;
  stroke: #000;
  stroke-width: .5px;
}
*/