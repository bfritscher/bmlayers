'use strict';

angular.module('bmlayersApp')
  .directive('sort', [function() {
    return function(scope, element, attrs, ngModel) {
		element.sortable({
			connectWith: "div.elements",
			forceHelperSize: true,
			forcePlaceholderSize: true,
			placeholder: "sortable-placeholder",
			receive: function( event, ui ) {
				console.log(ui);
				ui.item.scope().$apply(function(){
					eval("ui.item.scope().e." + scope.z.type + ' ="' + scope.z.value + '"');
					//TODO update order
				});
			}
		});
	};
  }])
  .directive('canvas', [function() {
    return function(scope, elm, attrs) {
		
		function drawChart(){
			var model = scope.model;
			var svg = d3.select(elm[0]);
			
			var zone = svg.selectAll('.zone').data(model.zones);
			var zoneEnter = zone.enter()
				.append("svg:rect")
				.attr('class', 'zone');
			zone.attr('y', 0)
			.attr('x', 0)
			.attr('width', function(d){ return d.width;})
			.attr('height', function(d){ return d.height;})
			.style('fill', 'white')
			.style('stroke-width', '1')
			.style('stroke', 'red');
			
			var element = svg.selectAll('.element').data(model.elements);
			var elementEnter = element.enter()
				.append("svg:rect")
				.attr('class', 'element');
			element.attr('y', 0)
			.attr('x', 0)
			.attr('width', 100)
			.attr('height', 100)
			.style('fill', 'yellow');
			
			var drag = d3.behavior.drag()
				.origin(Object)
				.on("drag", dragmove)
			
			element.call(drag);                                 
			function dragmove(d){
				d3.select(this)
				.attr('y', d.y = d3.event.y)
				.attr('x', d.x = d3.event.x);
			}
			
			
		}
		
		scope.$watch('model.elements.lenght', drawChart, true);//watch
    };
  }]);
