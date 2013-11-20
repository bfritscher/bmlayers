'use strict';

angular.module('bmlayersApp')
  .directive('evolution', ['$filter', 'uuid4', '$compile', function($filter, uuid4, $compile) {
    return function(scope, elem, attrs) {
      
      var zoom = d3.behavior.zoom()
      .translate([0, 0])
      .scale(1)
      .scaleExtent([0.1, 8])
      .on("zoom", zoomed);
      
      d3.select(elem[0]).append("rect")
      .attr("class", "overlay")
      .attr("width", "100%")
      .attr("height", "100%")
      .call(zoom);
      
      d3.select(elem[0]).append("marker")
		.attr("id", "arrowhead")
		.attr("refY", 6)
		.attr("refX", -4)
		.attr("markerWidth", 18)
		.attr("markerHeight", 12)
		.attr("orient", "auto")
		.attr("markerUnits", "userSpaceOnUse")
		.append("path")
			.attr('class', 'marker')
			.attr("d", "M 0,0 V 12 L18,6 Z");
      
      var  svg = d3.select(elem[0]).append('g');  
	  
      function zoomed() {
        svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
      }
      
      scope.$watch('data', function(){draw();});
      
      /* transition via zoom
      var width = 1280, height = 800;
      function transition(svg, start, end) {
        var center = [width / 2, height / 2],
            i = d3.interpolateZoom(start, end);

        svg.attr("transform", transform(start))
        .transition()
        .duration(i.duration)
        .attrTween("transform", function() { return function(t) { return transform(i(t)); }; })
        .each("end", function() { d3.select(this).call(transition, end, start); });

        function transform(p) {
          var k = height / p[2];
          return "translate(" + (center[0] - p[0] * k) + "," + (center[1] - p[1] * k) + ")scale(" + k + ")";
        }
      }
      var p0 = [0, 0, 300],
        p1 = [600, 100, 300];
      svg.call(transition, p0, p1);
      */
         
      function draw(){
		console.log('draw');
        var svg = d3.select(elem[0]).select('g');  
                
        //Model
        var model = svg.selectAll('g.model').data(d3.map(scope.models).entries(), function(d){return d.key;});
        var modelEnter = model.enter().append('g')
          .attr('class', 'model');
        
		//create model MENU
        var modelMenuEnter = modelEnter.append('g')
          .attr('class', 'model-menu')
          .attr('transform', 'translate(0,-380)');
        
        var modelMenu = model.select('g.model-menu');
        
        function makeButton(selection, label, x, y){
          x = x || 0;
          y = y || 0;
          var button = selection.append('g')
          .attr('transform', 'translate(' + x + ',' + y + ')')
		  .attr('class', 'button');
          button.append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', 30)
          .attr('height', 30); 
          
          button.append('text')
          .attr('x', 10)
          .attr('y', 20)
          .text(label);
          
          return button;
        }
		makeButton(modelMenuEnter, 'O', 1280, 380)
		.on('click', function(d){
			scope.$apply(function(){
				if(scope.editModel && scope.editModel.id  === d.value.id){
					scope.editModel = undefined;
				}else{
					scope.editModel = d.value;
				}
			});
		});
		
		modelMenuEnter
		.append('foreignObject')
		  .attr('width', function(d){return d.value.width;})
		  .attr('height', 200)
		  .append('xhtml:body')
		  .attr('xmlns', 'http://www.w3.org/1999/xhtml')
		  .html(function(d){ return '<input class="model-name" type="text" ng-model="data.models[\''+ d.key + '\'].name" placeholder="Iteration Title"/>';})
		  .each(function(d){
			 $compile(this)(scope);
		  });

		 modelMenuEnter.append('foreignObject')
		  .attr('width', function(d){return d.value.width;})
		  .attr('height', 150)
		  .attr('y', function(d){return 380 + d.value.height + 100})
		  .attr('x', 0)
		  .append('xhtml:body')
		  .attr('xmlns', 'http://www.w3.org/1999/xhtml')
		  .html(function(d){ return '<input class="model-dname" type="text" ng-style="{color: models[\''+ d.key + '\'].getColor()}" ng-model="data.models[\''+ d.key + '\'].when" placeholder="when"/>';})
		  .each(function(d){
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
		.attr('class', 'link old')
		linkEnter.append('path')
		.attr("marker-end", "url(#arrowhead)");
		
		var line = d3.svg.line()
			.interpolate('cardinal')
			.x(function(d){return d.x;})
			.y(function(d){return d.y;});
		
		
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
        }, function(d){return d.key;}).enter().append('g')
          .attr('transform', function(d){return 'translate(' + d.value.x + ',' + d.value.y + ')'})
          .attr('class', function(d){
            return d.value.name + ' zone';
          });
			
        zoneEnter.append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', function(d){ return d.value.width;})
          .attr('height', function(d){ return d.value.height;})
          .on('dblclick', function(d){
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
		
		
		link = model.select('g.links').selectAll('g.link.new').data(function(d){return  d3.map(d.value.links).entries();}, function(d){ return d.key;})
		linkEnter = link.enter().append('g')
		.attr('class', 'link new')
        linkEnter.each(function(d){
          var l = d3.select(this);
          scope.$watch('editLink', function(){
            l.classed('edit', scope.editLink && d.value.id === scope.editLink.id);
          })
        });
        
		linkEnter.append('path')
		.attr("marker-end", "url(#arrowhead)")
        .on('click', function(d){
          scope.$apply(function(){
            if(scope.editLink && scope.editLink.id === d.value.id){
              scope.editLink = undefined;
            }else{
              scope.editLink = d.value;
            }
          });
        })
		.on('dblclick', function(d){
			var cursor = d3.mouse(this);
			var point = {x: cursor[0], y: cursor[1]};
			function getInsertLocation(){
				if(d.value.points[0].x < point.x){
					for(var i = 0; i < d.value.points.length; i++){
						if(point.x < d.value.points[i].x){
							return i;
						}
					}
					return i-1;
				}else{
					for(var i = 0; i < d.value.points.length; i++){
						if(point.x > d.value.points[i].x){
							return i;
						}
					}
					return i-1;
				}
			}
			scope.$apply(function(){
				scope.data.links[d.key].points.splice(getInsertLocation(), 0, point);
			});
		});
		
		
		var circleControl = link.selectAll("circle.control")
    	.data(function(d){return d.value.points;});
  		circleControl.enter().append("circle")
		.attr("class", "control")
		.attr("r", 7)
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
			var x = d3.event.x
			var y = d3.event.y			
			scope.$apply(function(){
				scope.data.links[d3.select(parent).datum().key].points[i].x = x;
			  	scope.data.links[d3.select(parent).datum().key].points[i].y = y;
			});
		  }));
		
		
		//update
		circleControl.attr("cx", function(d){return d.x;})
		.attr("cy", function(d){return d.y;});
		
		updateLink(link);
		
		link.exit().remove();
          
        model.exit().remove();
          
        //model update
        model.attr('transform', function(m){return 'translate(' + m.value.x() + ',' + m.value.y() + ')';});
        
        //modelDiff boxes
        var modelDiff = svg.selectAll('g.diff').data(d3.map(scope.models).entries().filter(function(e){return e.value.parent;}));
        var modelDiffEnter = modelDiff.enter().append('g')
          .attr('class', 'diff');
          
        modelDiffEnter.append('g')
        .attr('class', 'model-menu')
        .attr('transform', 'translate(0,-200)')
        .append('foreignObject')
		  .attr('x', 0)
          .attr('y', 0)
		  .attr('width', function(d){return d.value.width;})
		  .attr('height', 150)
          .attr('class', 'dname')
		  .append('xhtml:body')
		  .attr('xmlns', 'http://www.w3.org/1999/xhtml')
		  .html(function(d, i){ return '<input class="model-dname" type="text" ng-style="{color: models[\''+ d.key + '\'].getColor()}" ng-model="data.models[\''+ d.key + '\'].dname" placeholder="Evolution Title"/>';})
		  .each(function(d){
			 $compile(this)(scope);
		  });
        
          
        modelDiff.attr('transform', function(m){return 'translate(' + (m.value.x()- m.value.width - m.value.colSpacing/2) + ',' + m.value.y() + ')';});
        
        modelDiff.exit().remove();
        
        //diff elements
        var element = modelDiff.selectAll('g.new').data(function(m){
          return d3.map(m.value.elements).entries();
        }, function(d){ return d.key;});
        
        var elementEnter = element.enter().append('g')
          .attr('class', 'new');
        
        elementEnter.append('rect')
          .attr('x',0)
          .attr('y',0)
          .attr('width', function(d){return d.value.width;})
          .attr('height', function(d){return d.value.height;})
          
        elementEnter.append('text')
          .attr('x', 10)
          .attr('y', 20);
        
        element.attr('transform', function(d){
          var zone = d.zoneObj;
          var x = zone && zone.x || 0;
          var y = zone && zone.y || 0;
          x = x + d.value.data.x || x;
          y = y + d.value.data.y || y;
          return 'translate(' + x + ',' + y + ')';
        });                
        element.select('text').text(function(e){return e.key;});
        
        element.exit().remove();
        
        //model diff links
		modelLinksEnter = modelDiffEnter.append('g')
		.attr('class', 'links')
        link = modelDiff.select('g.links').selectAll('g.link').data(function(d){return  d3.map(d.value.links).entries();}, function(d){ return d.key;})
		linkEnter = link.enter().append('g')
		.attr('class', 'link')
		linkEnter.append('path')
		.attr("marker-end", "url(#arrowhead)");
        
        updateLink(link);
        
		link.exit().remove();
        
        //model elements behaviors
        
        var drag = d3.behavior.drag()
          .origin(function(d){
            return {x: d.value.data.x || 0, y: d.value.data.y || 0};
          })
          .on('dragstart', dragstart)
          .on('drag', dragmove)
          .on('dragend', dragend);
        
        function dragstart(d){
          d3.selectAll('g.zone').style('pointer-events', 'all');          
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
			if(d.value.data.type === 'C'){
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
		  if(Math.abs(scope.data.elements[d.key].x-d.__origin__[0]) < 2 && Math.abs(scope.data.elements[d.key].y-d.__origin__[1]) <2)	{
			  scope.$apply(function(){
				if(scope.editElement && scope.editElement.id === d.value.id){
				  scope.editElement = undefined;
				}else{
				  scope.editElement = d.value;
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
							 id: id
						 };
						 scope.data.elements[d.key].x = d.__origin__[0];
						 scope.data.elements[d.key].y = d.__origin__[1];
					  });
				  }else{
					  //only A can really be moved
					  if(d.value.data.type === 'A'){
						  scope.$apply(function(){
							//TODO BETTER WAY TO ID MODEL
							if(model.value.constructor.name === 'Model' && model.value.id !== scope.data.elements[d.key].m){
							  var oldModel = scope.models[scope.data.elements[d.key].m];
							  //TODO: HANDLE DEPENDENCIES
							  //THIS only works if models have same zone positions
							  scope.data.elements[d.key].m = model.value.id;
							  scope.data.elements[d.key].x = scope.data.elements[d.key].x + oldzone.x - zone.x + oldModel.x() - model.value.x();
							  scope.data.elements[d.key].y = scope.data.elements[d.key].y + oldzone.y - zone.y + oldModel.y() - model.value.y();
							}else{
							  scope.data.elements[d.key].x = scope.data.elements[d.key].x + oldzone.x - zone.x;
							  scope.data.elements[d.key].y = scope.data.elements[d.key].y + oldzone.y - zone.y;
							}
							scope.data.elements[d.key].zone = zone.name;                
						  });
					  }else{
						  //no data has changed need to manualy call draw
						  draw();
					  }
				  }
			  }
		  }
          d3.select(this).style('pointer-events', 'all');       
        }
        
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
					var type
					do {
						type=prompt('Change (C) or Delte (D)?', 'C');
					}
					while(!(type===null || type === 'C' || type === 'D'));
					if(type){
						if(type==='C'){
							var name = prompt('new name?');
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
						  zone: d.value.data.zone
						};
					  });
					}
				}
			});
          elementEnter.append('rect')
            .attr('x',0)
            .attr('y',0)
            .attr('width', function(d){return d.value.width;})
            .attr('height', function(d){return d.value.height;})
            
          elementEnter.append('text')
            .attr('x', 10)
            .attr('y', 20);
          
          
          element.select('text').text(function(e){return e.key;});
          element.attr('transform', function(d){ return 'translate(' + (d.value.data.x || 0) + ',' + (d.value.data.y || 0) + ')';});
          
          element.exit().remove();
          
          // NEW ELEMENTS
          
          element = model.select('g.' + zone.name).selectAll('g.new').data(function(m){
            return d3.map(m.value.elements).entries().filter(function(d){return d.value.data.zone === zone.name;});
          }, function(d){ return d.key;});
          
          elementEnter = element.enter().append('g')
            .attr('class', 'new');
          

          elementEnter.append('rect')
            .attr('x',0)
            .attr('y',0)
            .attr('width', function(d){return d.value.width;})
            .attr('height', function(d){return d.value.height;})


		  elementEnter
		  .append('foreignObject')
		  .attr('class', 'svgelement')
		  .attr('width', function(d){return d.value.width;})
		  .attr('height', function(d){return d.value.height;})
		  .append('xhtml:body')
		  .attr('xmlns', 'http://www.w3.org/1999/xhtml')
		  .attr('style', function(d){return 'width:' + d.value.width + 'px;height:' + d.value.height + 'px' ;})
		  .html(function(d){
			  return '<div class="svgelement" style="{{elementStyle(data.elements[\'' + d.key + '\'])}}">'
			  + '<span>{{data.elements[\'' + d.key + '\'].name}}</span></div>';
		  })
		  .each(function(d){
			 $compile(this)(scope);
		  });
          
          //Only add should be draggable (delete and change are relative to their previous)
          
          elementEnter.call(drag)
          
          //if type D or C follow previous except if C is dragging
          element.attr('transform', function(d){
			if(d.value.data.type === 'A'){
				
				return 'translate(' + (d.value.data.x || 0) + ',' + (d.value.data.y || 0) + ')'; 
			}else if(d.value.data.type === 'C' && d.value.__dragging__){
				//WTF bug??? d.value.x does not return updated value..
				return 'translate(' + (d.value.dragx || 0) + ',' + (d.value.dragy || 0) + ')'; 
			}else{
            	return d.value.parent ? 'translate(' + (d.value.parent.x + 10 || 10) + ',' + (d.value.parent.y + 10 || 10) + ')' : '';
			}
          });
          element.exit().remove();
  
        }
      }
  };
  }]);