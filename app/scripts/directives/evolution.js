'use strict';
/* global d3 */
angular.module('bmlayersApp')
.directive('evolution', ['$filter', 'uuid4', '$compile', '$timeout', function($filter, uuid4, $compile, $timeout) {
  return function(scope, elem) {
  
    function zoomed() {
      svg.attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
    }
  
    var zoom = d3.behavior.zoom()
    .translate([50, 50])
    .scale(0.1)
    .scaleExtent([0.1, 8])
    .on('zoom', zoomed);
  
    d3.select(elem[0]).append('rect')
    .attr('class', 'overlay')
    .attr('width', '100%')
    .attr('height', '100%')
    .call(zoom).on('dblclick.zoom', null);
      
    d3.select(elem[0]).append('marker')
    .attr('id', 'arrowhead')
    .attr('refY', 6)
    .attr('refX', -4)
    .attr('markerWidth', 18)
    .attr('markerHeight', 12)
    .attr('orient', 'auto')
    .attr('markerUnits', 'userSpaceOnUse')
    .append('path')
    .attr('class', 'marker')
    .attr('d', 'M 0,0 V 12 L18,6 Z');
  
    var  svg = d3.select(elem[0]).append('g')
    .attr('transform', 'translate(50,50)scale(0.1)');
    
    svg.append('g').attr('class', 'model-chart');
    
    
      
    
    
    scope.$watch('data', function(){draw();}, true);
    scope.$watch('options', function(){draw();}, true);

/*
      function transitionToModel(model) {
    
    var width = svg.node().parentNode.width.baseVal.value;
    var height = svg.node().parentNode.height.baseVal.value;
    var start = zoom.translate().concat(zoom.scale());
    var end = [model.x(), model.y(), zoom.scale()];
        var center = [0, 0],
            i = d3.interpolate(start, end);

        svg.attr('transform', transform(start))
        .transition()
        .duration(i.duration)
        .attrTween('transform', function() { return function(t) { return transform(i(t)); }; })
    .each('end', function(){
      scope.$apply(function(){
        scope.options.transitionTo = undefined;
      });
      
    });

        function transform(p) {
          var k = p[2];
          return 'translate(' + (center[0] - p[0] * k) + ',' + (center[1] - p[1] * k) + ')scale(' + k + ')';
        }
      }
*/
    function draw(){
      //console.log('draw');
      var svg = d3.select(elem[0]).select('g');
    
      var line = d3.svg.line()
      .interpolate('cardinal')
      .x(function(d){return d.x;})
      .y(function(d){return d.y;});
    
      var lineFlat = d3.svg.line()
      .x(function(d){return d.x;})
      .y(function(d){return d.y;});
    
      var area = d3.svg.area();
    
      if(scope.options.transitionTo){
        //var m = scope.models[scope.options.transitionTo];
        //zoom.translate([-m.x()*zoom.scale(), -m.y()*zoom.scale()]);
        scope.options.transitionTo = undefined;
        //svg.attr('transform', 'translate(' + (-m.x()*zoom.scale()) +',' + (-m.y()*zoom.scale()) + ')scale(' + zoom.scale() + ')');
      }
      
      svg.classed('hide-links', !scope.options.showLinks);
      svg.classed('hide-links-old', !scope.options.showLinksOld);
      svg.classed('hide-dep', !scope.options.showDep);
      svg.classed('hide-chart', !scope.options.showChart);

      var chart = svg.select('g.model-chart').selectAll('path').data(scope.rows);
      chart.enter().append('path');
      chart.attr('transform', function(d){
        return 'translate(0,' +d.y+')';
      })
      .attr('d', function(d){ return area(d.data);})
      .attr('fill', function(d){ return d.color;});
    
        /*
        var chart = svg.append('g').attr('class', 'model-chart').selectAll('g').data(scope.rows);
    chart.enter().append('g')
    .attr('transform', function(d){
      return 'translate(0,' +d.y+')';
    })
    .each(function(d, row){
      drawChart(this, d);
      
      //previous
      for(var i=0; i < row; i++){
        drawChart(this, scope.rows[i]);
      }
    });
    function drawChart(e, d){
      d3.select(e).append('path')
      .attr('class', 'parent-chart')
      .attr('d', area(d.data));
        }
    */
                
      //Model
      var model = svg.selectAll('g.model').data(d3.map(scope.models).entries(), function(d){return d.key;});
      var modelEnter = model.enter().append('g')
      .attr('class', 'model');
      
      var modelDepEnter = modelEnter.append('g')
      .attr('class', 'model-dep');
      
      modelDepEnter.append('path')
      .attr('class', 'children');
      
      modelDepEnter.append('path')
      .attr('class', 'parent');
      
      model.selectAll('.model-dep path.children').attr('d', function(d){
        var m = d.value;
        if(m.children.length > 1){
          var to = m.children[m.children.length-1];
          return lineFlat([{x:m.width/2, y:m.height+m.rowSpacing()},{x:m.width/2, y: to.y()-m.y() + (to.height/2)}]);
        }
      });
      
      model.selectAll('.model-dep path.parent').attr('d', function(d){
        var m = d.value;
        if(m.parent && m.parent.children.indexOf(m) > 0){
          var diff = scope.options.showDiff? m.width: 0;
          return lineFlat([{x:m.parent.x()-m.x()+(m.parent.width/2), y:m.height/2},{x:-m.colSpacing-diff, y: m.height/2}]);
        }else{
          return 'M0,0';
        }
      });
                
        
      //create model MENU
      var modelMenuEnter = modelEnter.append('g')
      .attr('class', 'model-menu')
      .attr('transform', 'translate(0,-380)');
                  
      modelMenuEnter
      .append('foreignObject')
      .attr('x', -300)
      .attr('width', function(d){return d.value.width + 600;})
      .attr('height', 200)
      .append('xhtml:body')
      .attr('xmlns', 'http://www.w3.org/1999/xhtml')
      .html(function(d){ return '<input class="model-name" type="text" ng-model="data.models[\''+ d.key + '\'].name" placeholder="Iteration Title"/>';})
      .each(function(){
        $compile(this)(scope);
      });

      modelMenuEnter.append('foreignObject')
      .attr('width', function(d){return d.value.width;})
      .attr('height', 150)
      .attr('y', function(d){return 380 + d.value.height + 100;})
      .attr('x', 0)
      .append('xhtml:body')
      .attr('xmlns', 'http://www.w3.org/1999/xhtml')
      .html(function(d){ return '<input class="model-when" type="text" ng-style="{color: models[\''+ d.key + '\'].getColor()}" ng-model="data.models[\''+ d.key + '\'].when" placeholder="when"/>';})
      .each(function(){
        $compile(this)(scope);
      });
      
         
      // DRAW OLD LINKS behind
      var modelLinksEnter = modelEnter.append('g')
      .attr('class', 'links-old')
      .attr('transform', 'translate(0,0)');

      var link = model.select('g.links-old').selectAll('g.link.old').data(function(d){
        return d.value.parent ? d3.map(d.value.parent.allLinks()).entries() : [];
      }, function(d){ return d.key;});
      
      var linkEnter = link.enter().append('g')
      .attr('class', 'link old');
      
      linkEnter.append('path')
      .attr('marker-end', 'url(#arrowhead)');

      function updateLink(link){
        link.select('path').attr('d', function(d){
          return line(d.value.points);
        })
        .attr('stroke', function(d){
          return d.value.color;
        })
        .attr('stroke-width', function(d){
          return d.value.width;
        })
        .attr('stroke-dasharray', function(d){
          return d.value.dash;
        });
      }
      updateLink(link);
      
      link.exit().remove();
          
          
      //Create ZONES
      modelEnter.append('g')
      .attr('class', 'zones')
      .attr('transform', 'translate(0,0)');
    
      var zoneEnter = modelEnter.select('g.zones').selectAll('g.zone').data(function(d){
        return d3.map(d.value.zones).entries();
      }, function(d){ return d.key; })
      .enter().append('g')
      .attr('transform', function(d){ return 'translate(' + d.value.x + ',' + d.value.y + ')'; })
      .attr('class', function(d){ return d.value.name + ' zone'; });
      
      function onClickAndDblClick(element, onClick, onDblClick){
        var timer;
        element.on('click', function(d){
          if(d.value.__clickedOnce__){
            d.value.__clickedOnce__ = false;
            $timeout.cancel(timer);
            onDblClick.call(this, d);
          } else {
            var that = this;
            timer = $timeout(function(){
              d.value.__clickedOnce__ = false;
              onClick.call(that, d);
            }, 200, false);
            d.value.__clickedOnce__ = true;
          }
        });
      }
      
      var rect = zoneEnter.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', function(d){ return d.value.width;})
      .attr('height', function(d){ return d.value.height;});
      onClickAndDblClick(rect, function(){
        var model = d3.select(this.parentNode).datum().value;
        scope.$apply(function(){
          if(scope.options.editModelID === model.id){
            scope.options.editModelID = undefined;
          }else{
            scope.options.editModelID = model.id;
          }
        });
      }, function(){
        //ADD new element
        var model = d3.select(d3.event.target.parentElement).data()[0];
        var zone = d3.select(d3.event.target).data()[0].value;
        //TODO center on element?
        var pos = d3.mouse(this);
        var name = prompt('name?');
        if(name){
          scope.$apply(function(){
            var id = uuid4.generate();
            scope.data.elements[id] = {
              id: id,
              m: model.value.id,
              name: name,
              type: 'A',
              zone: zone.name,
              x: pos[0],
              y: pos[1]
            };
            scope.options.editElementID = id;
          });
        }
      });
    
      zoneEnter.append('text')
      .attr('x', 10)
      .attr('y', 10)
      .text(function(d){
        return $filter('i18n')(d.value.name);
      });
    
        
      //DRAW new links
      modelLinksEnter = modelEnter.append('g')
      .attr('class', 'links')
      .attr('transform', 'translate(0,0)');
    
    
      link = model.select('g.links').selectAll('g.link.new').data(function(d){return  d3.map(d.value.links).entries();}, function(d){ return d.key;});
      
      linkEnter = link.enter().append('g')
      .attr('class', 'link new');
      
      linkEnter.each(function(d){
        var l = d3.select(this);
        scope.$watch('options.editLinkID', function(){
          l.classed('edit', scope.options.editLinkID === d.value.id);
        });
      });
        
      var path = linkEnter.append('path')
      .attr('marker-end', 'url(#arrowhead)');
    
    
      onClickAndDblClick(path, function(d){
        scope.$apply(function(){
          if(scope.options.editLinkID === d.value.id){
            scope.options.editLinkID = undefined;
          }else{
            scope.options.editLinkID = d.value.id;
          }
        });
      }, function(d){
        if(scope.options.editLinkID === d.value.id){
          var cursor = d3.mouse(this);
          var point = {x: cursor[0], y: cursor[1]};
          var getInsertLocation = function(){
            if(d.value.points[0].x < point.x){
              for(var i = 0; i < d.value.points.length; i++){
                if(point.x < d.value.points[i].x){
                  return i;
                }
              }
              return i-1;
            }else{
              for(var j = 0; j < d.value.points.length; j++){
                if(point.x > d.value.points[j].x){
                  return j;
                }
              }
              return j-1;
            }
          };
          scope.$apply(function(){
            scope.data.links[d.key].points.splice(getInsertLocation(), 0, point);
          });
        }
      });
    
    
      var circleControl = link.selectAll('circle.control')
      .data(function(d){return d.value.points;});
      
      circleControl.enter().append('circle')
      .attr('class', 'control')
      .attr('r', 7)
      .on('dblclick', function(d,i){
        var parent = this.parentElement;
        //cannot delete edges
        if(i> 0 && i < d3.select(parent).datum().value.points.length-1){
          scope.$apply(function(){
            scope.data.links[d3.select(parent).datum().key].points.splice(i, 1);
          });
        }
      })
      .call(d3.behavior.drag()
        .origin(function(d){
          return {x: d.x, y: d.y};
        })
        .on('drag', function(d, i) {
          var parent = this.parentElement;
          var x = d3.event.x;
          var y = d3.event.y;
          scope.$apply(function(){
            scope.data.links[d3.select(parent).datum().key].points[i].x = x;
            scope.data.links[d3.select(parent).datum().key].points[i].y = y;
          });
        })
      );
    
    
      //update
      circleControl.attr('cx', function(d){return d.x;})
      .attr('cy', function(d){return d.y;});
    
      updateLink(link);
    
      link.exit().remove();
          
      model.exit().remove();
          
      //model update
      model.attr('transform', function(m){return 'translate(' + m.value.x() + ',' + m.value.y() + ')';});
      model.classed('show-old', function(m){return m.value.showOld;});
        
      //CREATE element for given node
      function createElementHtmlBody(element){
        element.each(function(d){
          var element = d3.select(this);
          if(d.value.data.type !== 'D'){
            //DISPLAY POST-IT
            element.append('rect')
            .attr('x',0)
            .attr('y',0)
            .attr('width', function(d){return d.value.width;})
            .attr('height', function(d){return d.value.height;});
          
            element
            .append('foreignObject')
            .attr('class', 'svgelement')
            .attr('width', function(d){return d.value.width;})
            .attr('height', function(d){return d.value.height;})
            .append('xhtml:body')
            .attr('xmlns', 'http://www.w3.org/1999/xhtml')
            .attr('style', function(d){return 'width:' + d.value.width + 'px;height:' + d.value.height + 'px' ;})
            .html(function(d){
              return '<div class="svgelement" ng-class="{image:data.elements[\'' + d.key + '\'].image}" style="{{elementStyle(data.elements[\'' + d.key + '\'])}}">' +
              '<span>{{data.elements[\'' + d.key + '\'].name}}</span></div>';
            })
            .each(function(){
              $compile(this)(scope);
            });
            
            //detect import (element's parent not in my models chain)
            if(d.value.data.type === 'I'){
              element.append('path')
              .attr('class', 'import')
              .attr('d', function(d){
                var w = d.value.width;
                var h = d.value.height;
                return lineFlat([{x:-8,y:0.3*h}, {x:w*0.1,y:0.5*h}, {x:-8,y:0.7*h}]);
              });
            }
            if(d.value.data.type === 'C'){
              var p = element.append('path');
              scope.$watch('data.elements[\''+ d.key +'\'].changeType', function(){
                p.attr('d', function(d){
                  var w = d.value.width;
                  var h = d.value.height;
                  if(d.value.data.changeType && d3.select(this.parentElement.parentElement).datum().key === d.value.model.id){
                    return d.value.data.changeType === 'i' ? lineFlat([{x: w-4, y: h-4},
                      {x: w-19, y: h-26},
                      {x: w-34, y: h-4}]) : lineFlat([{x: w-4, y: h-26},
                      {x: w-19, y: h-4},
                      {x: w-34, y: h-26}]);
                  }else{
                    return 'M0,0';
                  }
                })
                .attr('class', 'change-type change-type-' + d.value.data.changeType);
              });
            }
          }else{
            //DISPLAY DELETE
            element.append('path')
            .attr('class', 'delete')
            .attr('d', function(d){ return line([{x:0,y:0}, {x:d.value.width,y:d.value.height}]);});
            element.append('path')
            .attr('class', 'delete')
            .attr('d', function(d){ return line([{x:d.value.width,y:0}, {x:0,y:d.value.height}]);});
          }
        });
      }
        
        
      //modelDiff boxes
      if(scope.options.showDiff){
        var modelDiff = svg.selectAll('g.diff').data(d3.map(scope.models).entries().filter(function(e){return e.value.parent;}));
        var modelDiffEnter = modelDiff.enter().append('g')
        .attr('class', 'diff');
        
        modelDiffEnter.append('g')
        .attr('class', 'model-menu')
        .attr('transform', 'translate(0,-200)')
        .append('foreignObject')
        .attr('x', -200)
        .attr('y', 0)
        .attr('width', function(d){return d.value.width + 400;})
        .attr('height', 150)
        .attr('class', 'dname')
        .append('xhtml:body')
        .attr('xmlns', 'http://www.w3.org/1999/xhtml')
        .html(function(d){ return '<input class="model-dname" type="text" ng-style="{color: models[\''+ d.key + '\'].getColor()}" ng-model="data.models[\''+ d.key + '\'].dname" placeholder="Evolution Title"/>';})
        .each(function(){
          $compile(this)(scope);
        });

        modelDiff.attr('transform', function(m){return 'translate(' + (m.value.x()- m.value.width - m.value.colSpacing/2) + ',' + m.value.y() + ')';});
        
        modelDiff.exit().remove();
      
        //diff elements
        var element = modelDiff.selectAll('g.new').data(function(m){
          return d3.map(m.value.elements).entries();
        }, function(d){ return d.key;});
      
        var elementEnter = element.enter().append('g')
        .attr('class', 'new')
        .on('click', function(d){
          scope.$apply(function(){
            if(scope.options.editElementID === d.value.id){
              scope.options.editElementID = undefined;
            }else{
              scope.options.editElementID = d.value.id;
            }
          });
        });
        
        createElementHtmlBody(elementEnter);
      
        element.attr('transform', function(d){
          var zone = d.value.zoneObj;
          var x = zone && zone.x || 0;
          var y = zone && zone.y || 0;
          x = x + d.value.data.x || x;
          y = y + d.value.data.y || y;
          return 'translate(' + x + ',' + y + ')';
        });
          
        element.exit().remove();
      
        //model diff links
        modelLinksEnter = modelDiffEnter.append('g')
        .attr('class', 'links');
        
        link = modelDiff.select('g.links').selectAll('g.link').data(function(d){return  d3.map(d.value.links).entries();}, function(d){ return d.key;});
        
        linkEnter = link.enter().append('g')
        .attr('class', 'link');
        
        linkEnter.append('path')
        .attr('marker-end', 'url(#arrowhead)');
        
        updateLink(link);
        
        link.exit().remove();
      } else{ //end show diff
        svg.selectAll('g.diff').remove();
      }
      
      //model elements behaviors  
      function dragstart(d){
        d3.select(this).style('pointer-events', 'none');
        //make dragged top on in zone
        var node = d3.select(this).node();
        node.parentNode.appendChild(node);
        //zone order
        node.parentNode.parentNode.appendChild(node.parentNode);
        d.__origin__ = [d.value.data.x, d.value.data.y];
        d.value.__dragging__ = true;
      }
          
      function dragmove(d){
        if(d.value.data.type === 'A'){
          scope.$apply(function(){
            scope.data.elements[d.key].x = d3.event.x;
            scope.data.elements[d.key].y = d3.event.y;
            draw();
          });
        }
        if(d.value.data.type === 'C' || d.value.data.type === 'I'){
          //hacks...
          d.value.data.x = d3.event.x;
          d.value.data.y = d3.event.y;
          d.value.dragx = d3.event.x;
          d.value.dragy = d3.event.y;
          draw();
        }
      }
        
      function dragend(d){
        d.value.__dragging__ = false;
        if(Math.abs(scope.data.elements[d.key].x-d.__origin__[0]) < 2 && Math.abs(scope.data.elements[d.key].y-d.__origin__[1]) <2)  {
          //simulate element click
          scope.$apply(function(){
            if(scope.options.editElementID === d.value.id){
              scope.options.editElementID = undefined;
            }else{
              scope.options.editElementID = d.value.id;
            }
          });
        }else{
          //TODO: fix remove all external dependencies
          var zone = d3.select(d3.event.sourceEvent.target).data()[0].value;
          var model = d3.select(d3.event.sourceEvent.target.parentElement).data()[0];
          var oldzone = d.value.zoneObj;
          if(zone){
            //DO not link to itself
            if(zone.constructor.name === 'Element' && d.value.id !== zone.id){
              scope.$apply(function(){
                //create LINK
                //TODO check same MODEL
                var id = uuid4.generate();
                scope.data.links[id] = {
                  from: d.value.id,
                  to: zone.id,
                  m: d.value.data.m,
                  id: id,
                  color: d.value.getColor()
                };
                scope.data.elements[d.key].x = d.__origin__[0];
                scope.data.elements[d.key].y = d.__origin__[1];
              });
            }else{
              //only A can really be moved or C if to a new model not in parent => cross import
              //TODO BETTER WAY TO ID MODEL
              if(model.value.constructor.name === 'Model' && model.value.id !== scope.data.elements[d.key].m && (d.value.data.type === 'A' || d.value.data.type === 'C'|| d.value.data.type === 'I')){
                var oldModel = scope.models[scope.data.elements[d.key].m];
                //TODO: HANDLE DEPENDENCIES
                //THIS only works if models have same zone positions
                scope.$apply(function(){
                  scope.data.elements[d.key].m = model.value.id;
                  scope.data.elements[d.key].x = scope.data.elements[d.key].x + oldzone.x - zone.x + oldModel.x() - model.value.x();
                  scope.data.elements[d.key].y = scope.data.elements[d.key].y + oldzone.y - zone.y + oldModel.y() - model.value.y();
                  scope.data.elements[d.key].zone = zone.name;
                  /*
                  if(d.value.data.type === 'C'){
                    scope.data.elements[d.key].type = 'I';
                  }
                  */
                });
              }else{
                if(d.value.data.type === 'A'){
                  scope.$apply(function(){
                    scope.data.elements[d.key].x = scope.data.elements[d.key].x + oldzone.x - zone.x;
                    scope.data.elements[d.key].y = scope.data.elements[d.key].y + oldzone.y - zone.y;
                    scope.data.elements[d.key].zone = zone.name;
                  });
                }else{
                  draw();
                }
              }
            }
          }
        }
        d3.select(this).style('pointer-events', 'all');
      }
      
      var drag = d3.behavior.drag()
      .origin(function(d){
        return {x: d.value.data.x || 0, y: d.value.data.y || 0};
      })
      .on('dragstart', dragstart)
      .on('drag', dragmove)
      .on('dragend', dragend);
        
      model.each(function(d){
        for(var key in d.value.zones){
          elementOfZone(d.value.zones[key]);
        }
      });
  
      function elementOfZone(zone){
        //OLD elements of previous model
      
        element = model.select('g.' + zone.name).selectAll('g.old').data(function(m){
          return m.value.parent ? d3.map(m.value.parent.all()).entries().filter(function(d){return d.value.data.zone === zone.name;}) : [];
        }, function(d){ return d.key;});
          
        elementEnter = element.enter()
        .append('g')
        .attr('class', 'old')
        .on('click', function(d){
          //only accept click on old elements which have no children in the currentModel.
          var currentModel = d3.select(this.parentElement).data()[0].value;
          if(d.value.children.filter(function(e){ return currentModel.id === e.model.id; }).length === 0) {
            var type;
            do {
              type=prompt('Change (C) or Delte (D)?', 'C');
            }
            while(!(type===null || type === 'C' || type === 'D'));
            if(type){
              var image, name;
              if(type==='C'){
                name = prompt('new name?', d.value.data.name);
                image = d.value.data.image;
              }
              scope.$apply(function(){
                var id = uuid4.generate();
                scope.data.elements[id] = {
                  id: id,
                  name: name,
                  m: currentModel.id,
                  type: type,
                  p: d.value.id,
                  x: d.value.data.x,
                  y: d.value.data.y,
                  zone: d.value.data.zone,
                  tags: angular.copy(d.value.data.tags),
                  image: image
                };
                scope.options.editElementID = id;
              });
            }
          }
        });
          
        createElementHtmlBody(elementEnter);
          
        element.attr('transform', function(d){
          return 'translate(' + (d.value.data.x || 0) + ',' + (d.value.data.y || 0) + ')';
        });
          
        element.exit().remove();
          
        // NEW ELEMENTS A + D
          
        element = model.select('g.' + zone.name).selectAll('g.new').data(function(m){
          return d3.map(m.value.elements).entries().filter(function(d){return d.value.data.zone === zone.name;});
        }, function(d){ return d.key;});
          
        elementEnter = element.enter().append('g')
        .attr('class', 'new');
        createElementHtmlBody(elementEnter);
        
        //Only add should be draggable (delete and change are relative to their previous)
          
        elementEnter.call(drag);
          
        //if type Aor C follow previous except if C is dragging
        element.attr('transform', function(d){
          if(d.value.data.type === 'A' || d.value.data.type === 'D'){
            return 'translate(' + (d.value.data.x || 0) + ',' + (d.value.data.y || 0) + ')';
          }else if((d.value.data.type === 'I' || d.value.data.type === 'C') && d.value.__dragging__){
            //WTF bug??? d.value.x does not return updated value..
            return 'translate(' + (d.value.dragx || 0) + ',' + (d.value.dragy || 0) + ')';
          }else{
            return d.value.parent ? 'translate(' + (d.value.parent.data.x + 10 || 10) + ',' + (d.value.parent.data.y + 10 || 10) + ')' : '';
          }
        });
        element.exit().remove();
      }
    }
  };
}]);