'use strict';

angular.module('bmlayersApp')
  .controller('EvolutionCtrl', function ($scope) {
    var data = {
      elements: [
        {id: 1, m:'A', type: 'A'},
        {id: 2, m:'B', type: 'A'},
        {id: 3, m:'C', type: 'A'},
        {id: 4, m:'D', type: 'C', p:2},
        {id: 5, m:'E', type: 'A'},
        /*{id: '5b', m:'E2', type: 'A'},*/
        {id: 6, m:'F', type: 'D', p:1},
        {id: 7, m:'G', type: 'A'}
      ],
      models: [
        {id:'A'},
        {id:'B', p:'A'},
        {id:'C', p:'B', c:''},
        /*{id:'C2', p:'B'},
        {id:'E4', p:'C2'},
        {id:'E5', p:'C2'},*/
        {id:'D', p:'B', c:''},
        {id:'E', p:'D'},
        /*{id:'E2', p:'D'},
        {id:'E3', p:'D'},*/
        {id:'F', p:'B'},
        {id:'G', p:'F'}
      ]
    };
    
    function findElementById(array, id){
      for(var i=0; i < array.length; i++){
        if(array[i].id === id){
          return array[i];
        }
      }
      return null;
    }
    
    var models = {}
    data.models.forEach(function(m){
      var model = new Model(m)
      if(m.p){
        var parent = models[m.p];
        model.parent = parent;
        parent.children.push(model);
      }
      models[m.id] = model;
    });
    data.elements.forEach(function(e){
      if(e.p){
        e.p = findElementById(data.elements, e.p);
      }
      models[e.m].elements[e.id] = e;
    });
    
    $scope.models = models;
    
    function Model(obj){
      this.id = obj.id;
      this.column = obj.c;
      this.parent = obj.p;
      this.children = [];
      this.elements = {};
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
            //delete linked element
            delete elements[element.p.id];            
          } else if('C' === element.type){
            //replace linked element with current
            delete elements[element.p.id];
            element.x = element.p.x;
            element.y = element.p.y;
            elements[id] = element;
          }
        }
        return elements;
      };
    }
    
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
angular.module('bmlayersApp')
  .directive('test', [function() {
    return function(scope, elem, attrs) {
      calculatePosition(scope.models['A'], 0, 0);
      
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
        model.select('text').text(function(m){return m.key});
        model.attr('transform', function(m){return 'translate(' + (m.value.column * 2 * mWidth) + ',' + (m.value.row * (mHeight + rowSpacing)) + ')';});
        
        //modelDiff boxes
        var modelDiff = svg.selectAll('g.diff').data(d3.map(scope.models).entries());
        var modelDiffEnter = modelDiff.enter().append('g')
          .attr('class', 'diff');
        modelDiff.attr('transform', function(m){return 'translate(' + ((m.value.column * 2 * mWidth) + mWidth) + ',' + (m.value.row * (mHeight + rowSpacing)) + ')';});
        
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
        
        
        var drag = d3.behavior.drag()
          .origin(function(d){
            return {x: d.value.x || 0, y: d.value.y || 0};
          })
          .on('drag', dragmove);
          
        function dragmove(d){
          //d3.select(this).attr('transform', 'translate(' + d3.event.x + ',' + d3.event.y + ')');
          scope.$apply(function(){
            d.value.x = d3.event.x;
            d.value.y = d3.event.y;
            draw();
          });
        }
        
        element = model.selectAll('g.new').data(function(m){
          return d3.map(m.value.elements).entries();
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
          return 'translate(' + (d.value.p.x+10 || 10) + ',' + (d.value.p.y+10 || 10) + ')';}
        );

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
      }
      draw();
  };
  }])