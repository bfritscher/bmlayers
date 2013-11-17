'use strict';

angular.module('bmlayersApp')
  .controller('EvolutionCtrl', ['$scope','angularFire', 'uuid4',
  function ($scope, angularFire, uuid4) {
    
    var ref = new Firebase('https://bm.firebaseio.com/bm1');
    angularFire(ref, $scope, 'data');
    /*
    $scope.data = {
      elements: {
        '1': {id: 1, m:'A', type: 'A'},
        '2': {id: 2, m:'B', type: 'A'},
        '3': {id: 3, m:'C', type: 'A'},
        '4': {id: 4, m:'D', type: 'C', p:2},
        '5': {id: 5, m:'E', type: 'A'},
        '6': {id: 6, m:'F', type: 'D', p:1},
        '7': {id: 7, m:'G', type: 'A'}
      },
      models: [
        {id:'A'},
        {id:'B', p:'A'},
        {id:'C', p:'B', c:''},
        {id:'D', p:'B', c:''},
        {id:'E', p:'D'},
        {id:'F', p:'B'},
        {id:'G', p:'F'}
      ]
    };
    */
    function findElementById(array, id){
      for(var i=0; i < array.length; i++){
        if(array[i].id === id){
          return array[i];
        }
      }
      return null;
    }
    
    $scope.$watch('data', function(){
      if($scope.data && $scope.data.models){
        var models = {};
        $scope.data.models.forEach(function(m){
          var model = new Model(m)
          if(m.p){
            var parent = models[m.p];
            model.parent = parent;
            parent.children.push(model);
          }
          models[m.id] = model;
        });
        for(var id in $scope.data.elements){
          var e = $scope.data.elements[id];
          if(e.p){
            e.parent = $scope.data.elements[e.p];
          }
          //FOR NOW set a default zone 
          //TODO support no zone?
          if(!e.zone){
            e.zone = 'value_proposition';
          }
          if(models[e.m]){
            models[e.m].elements[e.id] = e;
          }
        }
		for(var id in $scope.data.links){
          var l = $scope.data.links[id];
		  if(typeof l === 'object'){
			  if(!l.points){
				var elementFrom = $scope.data.elements[l.from];
				var zoneFrom = zones[elementFrom.zone];
				var elementTo = $scope.data.elements[l.to];
				var zoneTo = zones[elementTo.zone];
				l.points = [{x: zoneFrom.x + elementFrom.x, y: zoneFrom.y + elementFrom.y},
							{x: zoneTo.x + elementTo.x, y: zoneTo.y + elementTo.y}]
			  }
			  if(models[l.m]){
				models[l.m].links[id] = l;
			  }
		  }
        }  
        $scope.models = models;
        
        
        calculatePosition($scope.models['A'], 0, 0);
      }
     function calculatePosition(model, column, row){
        var margin = 10;
        //allow to override column limit? or add offsets?
        if(model.column){
          column = model.column;
        }
        model.column = column;
        model.row = row;
        for(var index=0; index < model.children.length; index++){
          row = calculatePosition(model.children[index], column + 1, row);          
        }
        return model.children.length === 0 ? row + 1 : row;
      }
      
    }, true);
    
    var mWidth = 1280;
    var mHeight = 900;
    var rowSpacing = 50;
    
    var zones = {
		partner_network: {
			width: mWidth/5,
			height: mHeight/4*3,
			y:0,
			x:0,
			name: 'partner_network'
		},
		key_activities:{
			width: mWidth/5,
			height: mHeight/8*3,
			y:0,
			x: mWidth/5,
			name: 'key_activities'
		},
		key_resources:{
			width: mWidth/5,
			height: mHeight/8*3,
			y:mHeight/8*3,
			x: mWidth/5,
			name: 'key_resources'
		},
		cost_structure:{
			width: mWidth/2,
			height: mHeight/4,
			y:mHeight/8*6,
			x:0,
			name: 'cost_structure'
		},
		value_proposition:{
			width: mWidth/5,
			height: mHeight/8*6,
			y:0,
			x:mWidth/5*2,
			name: 'value_proposition'
		},
		customer_segments:{
			width: mWidth/5,
			height: mHeight/8*6,
			y:0,
			x:mWidth/5*4,
			name: 'customer_segments'
		},
		customer_relationship:{
			width: mWidth/5,
			height: mHeight/8*3,
			y:0,
			x:mWidth/5*3,
			name: 'customer_relationship'
		},
		channels:{
			width: mWidth/5,
			height: mHeight/8*3,
			y:mHeight/8*3,
			x:mWidth/5*3,
			name: 'channels'
		},
		revenue_streams:{
			width: mWidth/2,
			height: mHeight/8*2,
			y:mHeight/8*6,
			x:mWidth/2,
			name: 'revenue_streams'
		}
    };
    
    
    function Model(obj){
      this.id = obj.id;
      this.column = obj.c;
      this.parent = obj.p;
      this.children = [];
      this.elements = {};
	  this.links = {};
      this.x = function(){
        return this.column * 2 * mWidth
      };
      this.y = function(){
        return this.row * (mHeight + rowSpacing);
      };
	  this.width = mWidth;
	  this.height = mHeight;
      this.zones = zones;
      this.all = function(){
        var elements = {};
        if(this.parent){
          elements = this.parent.all(); //TODO: clone?
        }
        for(var id in this.elements){
          var element = this.elements[id];
          if('A' === element.type){
            elements[id] = element;
          } else if('D' === element.type){
            if(element.parent){
              //delete linked element
              element.x = element.parent.x;
              element.y = element.parent.y;
              element.zone = element.parent.zone;
              delete elements[element.parent.id];
            }
          } else if('C' === element.type){
            //replace linked element with current
            if(element.parent){
              delete elements[element.parent.id];
              element.x = element.parent.x;
              element.y = element.parent.y;
              element.zone = element.parent.zone;
              elements[id] = element;
            }
          }
        }
        return elements;
      };
	  this.allLinks = function(){
		var links = {};
		if(this.parent){
			links = this.parent.allLinks();
		}
		for(var id in this.links){
			var link = this.links[id];
			links[id] = link;
		}
		return links;
	  };
    }
  }]);
angular.module('bmlayersApp')
  .directive('test', ['$filter', 'uuid4', function($filter, uuid4) {
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
		.attr("refY", 2)
		.attr("markerWidth", 6)
		.attr("markerHeight", 4)
		.attr("orient", "auto")
		.append("path")
			.attr('class', 'marker')
			.attr("d", "M 0,0 V 4 L6,2 Z");
      
      var  svg = d3.select(elem[0]).append('g');  
	  
      function zoomed() {
        svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
      }
      
      scope.$watch('models', function(){draw();});
      
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
        var svg = d3.select(elem[0]).select('g');  
                
        //Model
        var model = svg.selectAll('g.model').data(d3.map(scope.models).entries());
        var modelEnter = model.enter().append('g')
          .attr('class', 'model');
        /*
        modelEnter.append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', mWidth)
          .attr('height', mHeight);
		*/
        modelEnter.append('text')
          .attr('x', -20)
          .attr('y', 0);

         
        // DRAW OLD LINKS behind
		var modelLinksEnter = modelEnter.append('g')
		.attr('class', 'links-old')
		.attr('transform', 'translate(0,0)');

		var link = model.select('g.links-old').selectAll('g.link.old').data(function(d){
			return d.value.parent ? d3.map(d.value.parent.allLinks()).entries() : [];
		});
		var linkEnter = link.enter().append('g')
		.attr('class', 'link old')
		linkEnter.append('path')
		.attr("marker-end", "url(#arrowhead)");
		
		var line = d3.svg.line()
			.interpolate('cardinal')
			.x(function(d){return d.x;})
			.y(function(d){return d.y;});
		
		link.select('path').attr('d', function(d){
			return line(d.value.points);
		});
		
		link.exit().remove();
          
          
        //Create ZONES
        var zoneEnter = modelEnter.selectAll('g.zone').data(function(d){
          return d3.map(d.value.zones).entries();
        }).enter().append('g')
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
              scope.$apply(function(){
				var id = uuid4.generate();
                scope.data.elements[id] = {
                  id: id,
                  m: model.value.id,
                  type: 'A',
                  zone: zone.name,
                  x: pos[0],
                  y: pos[1]
                };
              });
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
		
		
		link = model.select('g.links').selectAll('g.link.new').data(function(d){return  d3.map(d.value.links).entries();})
		linkEnter = link.enter().append('g')
		.attr('class', 'link new')
		linkEnter.append('path')
		.attr("marker-end", "url(#arrowhead)")
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
		  .on("drag", function(d, i) {
			var parent = this.parentElement;
			var x = d3.event.x
			var y = d3.event.y
			scope.$apply(function(){
				scope.data.links[d3.select(parent).datum().key].points[i].x = x;
			  	scope.data.links[d3.select(parent).datum().key].points[i].y = y;
				draw();
			});
		  }));
		
		
		//update
		circleControl.attr("cx", function(d){return d.x;})
		.attr("cy", function(d){return d.y;});
		
		link.select('path').attr('d', function(d){
			return line(d.value.points);
		});
		
		link.exit().remove();
          
        //create model MENU
        var modelMenuEnter = modelEnter.append('g')
          .attr('class', 'model-menu')
          .attr('transform', 'translate(0,-40)');
        
        makeButton(modelMenuEnter, 'C')
        .on('click', function(d){
          //add new model to clicked row
          scope.$apply(function(){
            scope.data.models.push({id: uuid4.generate(), p: d.value.id});
          })
        });
        
        makeButton(modelMenuEnter, 'D', 40)
        .on('click', function(d){
          //delete a model
          scope.$apply(function(){
            //TODO: handle migration cases
            scope.data.models.splice(scope.data.models.indexOf(d.value), 1);
          })
        });
          
        function makeButton(selection, label, x, y){
          x = x || 0;
          y = y || 0;
          var button = selection.append('g')
          .attr('transform', 'translate(' + x + ',' + y + ')');
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
          
        model.exit().remove();
          
        //model update
        model.select('text').text(function(m){return m.key});
        model.attr('transform', function(m){return 'translate(' + m.value.x() + ',' + m.value.y() + ')';});
        
        
        //modelDiff boxes
        var modelDiff = svg.selectAll('g.diff').data(d3.map(scope.models).entries().slice(1));
        var modelDiffEnter = modelDiff.enter().append('g')
          .attr('class', 'diff');
        modelDiff.attr('transform', function(m){return 'translate(' + (m.value.x()- m.value.width) + ',' + m.value.y() + ')';});
        
        modelDiff.exit().remove();
        
        //diff elements
        var element = modelDiff.selectAll('g.new').data(function(m){
          return d3.map(m.value.elements).entries();
        });
        
        var elementEnter = element.enter().append('g')
          .attr('class', 'new');
        
        elementEnter.append('rect')
          .attr('x',10)
          .attr('y',10)
          .attr('width', 100)
          .attr('height', 40)
          
        elementEnter.append('text')
          .attr('x', 10)
          .attr('y', 20);
        
        element.attr('transform', function(d){
          var zone = scope.models[d.value.m].zones[d.value.zone];
          var x = zone && zone.x || 0;
          var y = zone && zone.y || 0;
          x = x + d.value.x || x;
          y = y + d.value.y || y;
          return 'translate(' + x + ',' + y + ')';
        });                
        element.select('text').text(function(e){return e.key;});
        
        element.exit().remove();
        
        //model diff links
		modelLinksEnter = modelDiffEnter.append('g')
		.attr('class', 'links')
        link = modelDiff.select('g.links').selectAll('g.link').data(function(d){return  d3.map(d.value.links).entries();})
		linkEnter = link.enter().append('g')
		.attr('class', 'link')
		linkEnter.append('path')
		.attr("marker-end", "url(#arrowhead)")
        link.select('path').attr('d', function(d){
			return line(d.value.points);
		});
		link.exit().remove();
        
        //model elements behaviors
        
        var drag = d3.behavior.drag()
          .origin(function(d){
            return {x: d.value.x || 0, y: d.value.y || 0};
          })
          .on('dragstart', dragstart)
          .on('drag', dragmove)
          .on('dragend', dragend);
        
        function dragstart(d){
          d3.selectAll('g.zone').style('pointer-events', 'all');          
          d3.select(this).style('pointer-events', 'none');          
        }
          
        function dragmove(d){
          scope.$apply(function(){
            scope.data.elements[d.key].x = d3.event.x;
            scope.data.elements[d.key].y = d3.event.y;
            draw();
          });
        }
        
        function dragend(d){
         //TODO: fix remove all external dependencies
          var zone = d3.select(d3.event.sourceEvent.target).data()[0].value;
          var model = d3.select(d3.event.sourceEvent.target.parentElement).data()[0];
          var oldzone = scope.models[d.value.m].zones[d.value.zone];
          if(zone){
              scope.$apply(function(){
                if(model.value.id !== scope.data.elements[d.key].m){
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
                draw();
              });
          }
          d3.select(this).style('pointer-events', 'all');       
        }
        
        model.each(function(d){
          for(var key in d.value.zones){
			elementOfZone(d.value.zones[key]);
          }	  
        });
        
        function elementOfZone(zone){
          
          element = model.select('g.' + zone.name).selectAll('g.new').data(function(m){
            return d3.map(m.value.elements).entries().filter(function(d){return d.value.zone === zone.name;});
          });
          
          elementEnter = element.enter().append('g')
            .attr('class', 'new');
          
          elementEnter.append('rect')
            .attr('x',0)
            .attr('y',0)
            .attr('width', 100)
            .attr('height', 40)
            
          /*
          elementEnter.append('text')
            .attr('x', 10)
            .attr('y', 20);
          */
		  
		  elementEnter
		  .append('foreignObject')
		  .attr('width', 100)
		  .attr('height', 40)
		  .append('xhtml:body')
		  .attr('xmlns', 'http://www.w3.org/1999/xhtml')
		  .append('div');
            
          makeButton(elementEnter, 'D', 0, 0)
          .attr('style', 'pointer-events:all;')
          .on('mousedown', function(d){
            //DELETE A ELEMENT
            d3.event.stopPropagation(); 
            scope.$apply(function(){
              //TODO HANDLER dependencies!
              delete scope.data.elements[d.key];
            });
          });
            
          //element.select('text').text(function(e){return e.key;})
		  element.select('div').text(function(e){return e.key;});
          
          //Only add should be draggable (delete and change are relative to their previous)
          elementEnter.filter(function(d){
            return 'A' === d.value.type;
          }).call(drag);
          
          
          
          //if type D or C follow previous
          element.filter(function(d){
            return 'A' === d.value.type;
          }).attr('transform', function(d){ return 'translate(' + (d.value.x || 0) + ',' + (d.value.y || 0) + ')';});
          
          element.filter(function(d){
            return 'A' !== d.value.type;
          }).attr('transform', function(d){
            return d.value.parent ? 'translate(' + (d.value.parent.x + 10 || 10) + ',' + (d.value.parent.y + 10 || 10) + ')' : '';
          });
          element.exit().remove();
  
  
          //elements of previous model
          element = model.select('g.' + zone.name).selectAll('g.old').data(function(m){
            return m.value.parent ? d3.map(m.value.parent.all()).entries().filter(function(d){return d.value.zone === zone.name;}) : [];
          });
          
          elementEnter = element.enter()
            .append('g')
            .attr('class', 'old');
          elementEnter.append('rect')
            .attr('x',10)
            .attr('y',10)
            .attr('width', 100)
            .attr('height', 40)
            
          elementEnter.append('text')
            .attr('x', 10)
            .attr('y', 20);
          element.select('text').text(function(e){return e.key;});
          
          element.attr('transform', function(d){ return 'translate(' + (d.value.x || 0) + ',' + (d.value.y || 0) + ')';});
          
          element.exit().remove();
        }
      }
      draw();
  };
  }])