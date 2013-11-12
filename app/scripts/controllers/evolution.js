'use strict';

angular.module('bmlayersApp')
  .controller('EvolutionCtrl', ['$scope', 'angularFire', function ($scope, angularFire) {
    
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
          if(models[e.m]){
            models[e.m].elements[e.id] = e;
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
    
    var mWidth = 300;
    var mHeight = 150;
    
    function Model(obj){
      this.id = obj.id;
      this.column = obj.c;
      this.parent = obj.p;
      this.children = [];
      this.elements = {};
      this.zones = [
          {name:'zone-a', x: 0, y: 0, width: mWidth/2, height: mHeight/2},
          {name:'zone-b', x: mWidth/2, y: 0, width: mWidth/2, height: mHeight/2},
          {name:'zone-c', x: 0, y: mHeight/2, width: mWidth/2, height: mHeight/2},
          {name:'zone-d', x: mWidth/2, y: mHeight/2, width: mWidth/2, height: mHeight/2}
        ];
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
              delete elements[element.parent.id];
            }
          } else if('C' === element.type){
            //replace linked element with current
            if(element.parent){
              delete elements[element.parent.id];
              element.x = element.parent.x;
              element.y = element.parent.y;
              elements[id] = element;
            }
          }
        }
        return elements;
      };
    }
  }]);
angular.module('bmlayersApp')
  .directive('test', [function() {
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
        
        var mWidth = 300;
        var mHeight = 150;
        var rowSpacing = 20;
        
        var model = svg.selectAll('g.model').data(d3.map(scope.models).entries());
        var modelEnter = model.enter().append('g')
          .attr('class', 'model');
        modelEnter.append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', mWidth)
          .attr('height', mHeight);
        modelEnter.append('text')
          .attr('x', 10)
          .attr('y', 20);
          
        function p(property){
          return function(d){
            return d[property];
          }
        }
          
        modelEnter.selectAll('g.zone').data(function(d){
          return d.value.zones;
        }).enter().append('g')
          .attr('transform', function(d){return 'translate(' + d.x + ',' + d.y + ')'})
          .attr('class', function(d){
            return d.name + ' zone';
            })
          .append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', p('width'))
          .attr('height', p('height'));
          
        model.exit().remove();
          
        model.select('text').text(function(m){return m.key});
        model.attr('transform', function(m){return 'translate(' + ((m.value.column * 2 * mWidth)) + ',' + (m.value.row * (mHeight + rowSpacing)) + ')';});
        
        //modelDiff boxes
        var modelDiff = svg.selectAll('g.diff').data(d3.map(scope.models).entries().slice(1));
        var modelDiffEnter = modelDiff.enter().append('g')
          .attr('class', 'diff');
        modelDiff.attr('transform', function(m){return 'translate(' + ((m.value.column * 2 * mWidth)-mWidth) + ',' + (m.value.row * (mHeight + rowSpacing)) + ')';});
        
        modelDiff.exit().remove();
        
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
        
        element.attr('transform', function(d){ return 'translate(' + (d.value.x || 0) + ',' + (d.value.y || 0) + ')';});                
        element.select('text').text(function(e){return e.key;});
        
        element.exit().remove();
        
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
          //d3.select(this).attr('transform', 'translate(' + d3.event.x + ',' + d3.event.y + ')');
          //console.log(d, d3.event, d3.event.sourceEvent.target);
          scope.$apply(function(){
            scope.data.elements[d.key].x = d3.event.x;
            scope.data.elements[d.key].y = d3.event.y;
            //d.value.y = d3.event.y;
            draw();
          });
        }
        
        function findZone(array, name){
          for(var i=0; i < array.length; i++){
            if(array[i].name === name) return array[i];
          }
          return null;
        }
        
        
        function dragend(d){
           //TODO: fix remove all external dependencies
          console.log(d, d3.event, d3.event.sourceEvent.target)
          console.log(d3.event.sourceEvent.target.parentElement.classList[0]);
          if('new' !== d3.event.sourceEvent.target.parentElement.classList[0]){
            var zone = d3.select(d3.event.sourceEvent.target).data()[0];
            var oldzone = findZone(scope.models[d.value.m].zones, d.value.zone);
            scope.$apply(function(){
              //scope.data.elements[d.key].x = d3.event.x - oldzone.x + zone.x;
              //scope.data.elements[d.key].y = d3.event.y - oldzone.y + zone.y;
              d.value.x = d3.event.x - oldzone.x + zone.x;
              d.value.y = d3.event.y - oldzone.y + zone.y;
              scope.data.elements[d.key].zone = zone.name;
              draw();
              
            });
            console.log(zone.name);
          }
          d3.selectAll('g.zone').style('pointer-events', 'none');
          //d3.select(d3.event.sourceEvent.target).style('fill', '#00ff00');
        }
        
        model.each(function(d){
          d.value.zones.forEach(elementOfZone);
        });
        
        function elementOfZone(zone){
          
          element = model.select('g.' + zone.name).selectAll('g.new').data(function(m){
            return d3.map(m.value.elements).entries().filter(function(d){return d.value.zone === zone.name;});
          });
          
          elementEnter = element.enter().append('g')
            .attr('class', 'new');
          
          elementEnter.append('rect')
            .attr('x',10)
            .attr('y',10)
            .attr('width', 100)
            .attr('height', 40)
            
          elementEnter.append('text')
            .attr('x', 10)
            .attr('y', 20);
            
          element.select('text').text(function(e){return e.key;});
          
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
            return 'translate(' + (d.value.parent.x + 10 || 10) + ',' + (d.value.parent.y + 10 || 10) + ')';
          });
  
          element = model.selectAll('g.old').data(function(m){
            return m.value.parent ? d3.map(m.value.parent.all()).entries() : [];
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