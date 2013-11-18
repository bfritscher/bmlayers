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
    //transform DATA to linked objects
    $scope.$watch('data', function(){
      if($scope.data && $scope.data.models){
        var models = {};
		var elements = {};
		//be sure to have necessary structure
		if(!$scope.data.models){
			$scope.data.models = [];
		}
		if($scope.data.models.length === 0){
			$scope.data.models.push({id: uuid4.generate()});
		}
		if(!$scope.data.elements){
			$scope.data.elements = {};
		}
		if(!$scope.data.links){
			$scope.data.links = {};
		}
		//parse data
        $scope.data.models.forEach(function(m){
          var model = new Model(m)
          if(m.p){
            var parent = models[m.p];
            model.parent = parent;
            parent.children.push(model);
          }
          models[m.id] = model;
        });
		//augment elements && data integrity
        for(var id in $scope.data.elements){
			var e = $scope.data.elements[id];
			if(typeof e === 'object'){
				//FOR NOW set a default zone 
			  //TODO support no zone?
			  if(!e.zone){
				e.zone = 'value_proposition';
			  }
			  if(!models[e.m]){
				  //recover lost elements by adding it to model 0;
				  e.m = $scope.data.models[0].id;
			  }
			  elements[e.id] = new Element($scope.data.elements[id]);
			}
        }
		//Element obj gets linked
		for(var id in elements){
		  var e = elements[id];
          if(e.p){
            e.parent = elements[e.p];
			e.parent.children.push(e);
          }
		  var model = models[e.m];
		  model.elements[e.id] = e;
		  e.model = models[e.m];
		  
		  if(zones[e.zone]){
			  e.zoneObj = zones[e.zone];
		  }
        }
		
		for(var id in $scope.data.links){
          var l = $scope.data.links[id];
		  if(typeof l === 'object'){
			  l.id = id;
			  if(!l.getPoints){
				l.getPoints = function(){
					var elementFrom = $scope.data.elements[this.from];
					var elementTo = $scope.data.elements[this.to];
					if(elementFrom && elementTo){
						var zoneFrom = zones[elementFrom.zone];
						var zoneTo = zones[elementTo.zone];
						return [{x: zoneFrom.x + elementFrom.x || 0 , y: zoneFrom.y + elementFrom.y || 0 },
									{x: zoneTo.x + elementTo.x || 0 , y: zoneTo.y + elementTo.y || 0 }];
					}else{
						return [{x:0,y:0},{x:0,y:0}];
					}
				};
			  }
			  if(!l.points){
				l.points = l.getPoints();
			  }
			  for(var i=0; i < l.points.length; i++){
				  if(!l.points[i]) l.points.splice(i, 1);
			  }
			  //bounding boxes
			  //TODO XXX BIG REFACTOR also with DRAG, renaming points vs l.points not same!!
			  var index = 0;
			  var points = l.getPoints();
			  var margin = 5;
			  var margin2 = 10;
			  var elementFrom = elements[l.from];
			  var elementTo = elements[l.to];
			  if(elementFrom && elementTo){
				  l.points[0].x = Math.max(points[index].x - margin, Math.min(points[index].x + elementFrom.width + margin, l.points[0].x));
				  l.points[0].y = Math.max(points[index].y - margin, Math.min(points[index].y + elementFrom.height + margin, l.points[0].y));
				  index = 1;
				  var index2 = l.points.length-1;
				  l.points[index2].x = Math.max(points[index].x - margin2, Math.min(points[index].x + elementTo.width + margin2, l.points[index2].x));
				  l.points[index2].y = Math.max(points[index].y - margin2, Math.min(points[index].y + elementTo.height + margin2, l.points[index2].y));
				  
				  elementFrom.links.push(l);
			  	  elementTo.links.push(l);
			  }
			  if(models[l.m]){
				models[l.m].links[id] = l;
			  }
		  }
        }  
        $scope.models = models;
		$scope.elements = elements;
        
        var row = 0;
		for(var key in $scope.models){
			if(!$scope.models[key].parent){
        		row = calculatePosition($scope.models[key], 0, row);
			}
		}
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
    
    
    //Object wrapper and defaults
    var mWidth = 1280;
    var mHeight = 900;
    var rowSpacing = 700;
	var colSpacing = 300;
    
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
    function Element(obj){
		this.id = obj.id;
		this.m = obj.m;
		this.type = obj.type;
		this.x = obj.x;
		this.y = obj.y;
		this.p = obj.p;
		this.zone = obj.zone;
		
		this.model;
		this.parent;
		this.children = [];
		this.links = [];
		this.zoneObj;
		this.width = 100;
		this.height = 40;
		this.handleDelete = function(){
			if(this.children.length === 0){
				for(var i = 0; i < this.links.length; i++){					
					delete $scope.data.links[this.links[i].id];
				}
				delete $scope.data.elements[this.id];
			}else{
				alert('cannot delete, has children: ' + this.children.map(function(e){return e.model.id + '#'+ e.id;}).join(', '));
			}
		}
	}
    
    function Model(obj){
      this.id = obj.id;
      this.column = obj.c;
      this.parent = obj.p;
	  this.name = obj.name;
	  this.dname = obj.dname;
	  this.when = obj.when;
	  this.color = obj.color;
      this.children = [];
      this.elements = {};
	  this.links = {};
      this.x = function(){
        return this.column * (2 * mWidth + colSpacing);
      };
      this.y = function(){
        return this.row * (mHeight + rowSpacing);
      };
	  this.getColor = function(){
		var color = this.color;
		if(!color && this.parent){
			color = this.parent.getColor();
		}
		return color;
	  };
	  this.colSpacing = colSpacing;
	  this.rowSpacing = rowSpacing;
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