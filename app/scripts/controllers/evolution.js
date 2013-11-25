'use strict';

angular.module('bmlayersApp')
  .controller('EvolutionCtrl', ['$scope','angularFire', 'uuid4', '$routeParams', 'layers',
  function ($scope, angularFire, uuid4, $routeParams, layers) {
    
    var ref = new Firebase('https://bm.firebaseio.com/projects/' + $routeParams.projectid);
    angularFire(ref, $scope, 'data').then(function(){
		if(Object.keys($scope.data.models).length === 0){
		  var id = uuid4.generate();
		  $scope.data.models[id] = {id: id};
		}
	});
    $scope.data = {
		elements:{},
		models:{},
		links:{},
		tags: layers.tags.tags
	};
	
    $scope.options ={
		showDiff: true,
		showLinks: true,
		showLinksOld: true,
		showDep: true,
		showChart: false
    };
    
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
      models: {
        'A': {id:'A'},
        'B': {id:'B', p:'A'},
        'C': {id:'C', p:'B', c:''},
        'D': {id:'D', p:'B', c:''},
        'E': {id:'E', p:'D'},
        'F': {id:'F', p:'B'},
        'G': {id:'G', p:'F'}
      }
    };
	*/

	$scope.deleteLink = function(){
		if($scope.options.editLinkID)	{
			delete $scope.data.links[$scope.options.editLinkID];
			for(var id in $scope.models){
				delete $scope.models[id].links[$scope.options.editLinkID];
			}
			for(var id in $scope.elements){
				delete $scope.elements[id].links[$scope.options.editLinkID];
			}
			$scope.options.editLinkID = undefined;
		}
	};
	
	$scope.elementStyle = function (element){
		if(element){
			return layers.elementStyle(element, $scope.data.tags);
		}
	};

    //transform DATA to linked objects
	//TODO data changes should only update local models...

	//augmented model cache
	$scope.models = {};
	$scope.elements = {};

    $scope.$watch('data', function(){
	  if($scope.data && $scope.data.models){
		console.log('data');
		
		if(!$scope.data.elements){
			$scope.data.elements = {};
		}
		if(!$scope.data.links){
			$scope.data.links = {};
		}
		
		//element data integrity
		for(var id in $scope.data.elements){
			var e = $scope.data.elements[id];
			if(typeof e === 'object'){
				//FOR NOW set a default zone 
			  //TODO support no zone?
			  if(!e.zone){
				e.zone = 'value_proposition';
			  }
			  if(!e.tags){
				e.tags = [];  
			  }
			  if(e.p){
				  var ep = $scope.data.elements[e.p];
				  if(ep){
					e.x = ep.x;
				  	e.y = ep.y;
				  	e.zone = ep.zone;  
				  }else{
					//missing parent recover element
					delete e.p;
					e.type = 'A';
				  }
			  }
			  if(!$scope.data.models[e.m]){
				  //remove elements without models
				  //TODO: use handleDelete
				  delete $scope.data.elements[id];
			  }
			}
        }
		
		//Augment model
        for(var id in $scope.data.models){
			if(!$scope.models[id]){
				$scope.models[id] = new Model($scope.data.models[id]);
			}
		  	$scope.models[id].data = $scope.data.models[id]
        }
		//link models
		for(var id in $scope.models){	
			var model = $scope.models[id];
			model.children = [];
			model.elements = {};
			model.links = {};
			delete model.parent;
		}
		for(var id in $scope.models){			
		  var model = $scope.models[id];
		  if(model.data.p){
			var parent = $scope.models[model.data.p];
			model.parent = parent;
			if(parent.children.indexOf(model) < 0){
				parent.children.push(model);
			}
		  }
        }
		//augment elements
        for(var id in $scope.data.elements){
			if(!$scope.elements[id]){
				$scope.elements[id] = new Element($scope.data.elements[id]);
			}
			$scope.elements[id].data = $scope.data.elements[id];
        }
		for(var id in $scope.elements){
			var e = $scope.elements[id];
			e.links = {};
			e.children = [];
		}
		
		//Element obj gets linked
		for(var id in $scope.elements){
		  var e = $scope.elements[id];
          if(e.data.p){
			var parent = $scope.elements[e.data.p];
            e.parent = parent;
			if(e.parent.children.indexOf(parent) < 0){
				e.parent.children.push(e);
			}
          }
		  var model = $scope.models[e.data.m];
		  if(model){
		  	model.elements[e.id] = e;
		  	e.model = model;
		  }
		  if(zones[e.data.zone]){
			  e.zoneObj = zones[e.data.zone];
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
			  var margin2 = 16;
			  //FIIXusing augmented Model
			  var elementFrom = $scope.elements[l.from];
			  var elementTo = $scope.elements[l.to];
			  if(elementFrom && elementTo){
				  l.points[0].x = Math.max(points[index].x - margin, Math.min(points[index].x + elementFrom.width + margin, l.points[0].x));
				  l.points[0].y = Math.max(points[index].y - margin, Math.min(points[index].y + elementFrom.height + margin, l.points[0].y));
				  index = 1;
				  var index2 = l.points.length-1;
				  l.points[index2].x = Math.max(points[index].x - margin2, Math.min(points[index].x + elementTo.width + margin2, l.points[index2].x));
				  l.points[index2].y = Math.max(points[index].y - margin2, Math.min(points[index].y + elementTo.height + margin2, l.points[index2].y));
				  
				  elementFrom.links[id] = l;
			  	  elementTo.links[id] = l;
			  }
			  
			  //FIIXadd to augment model
			  if($scope.models[l.m]){
				$scope.models[l.m].links[id] = l;
			  }
		  }
		  
        }  
        var row = 0;
		$scope.rows = [];
		for(var key in $scope.models){
			if(!$scope.models[key].parent){
        		row = calculatePosition($scope.models[key], 0, row);
			}
		}

	  }//end if
    }, true);
    
    function calculatePosition(model, column, row){
        //allow to override column limit? or add offsets?
        if(model.data.c){
          column = model.data.c;
        }
        model.column = column;
        model.row = row;
		
		//graph data
		var rows = $scope.rows[row] || {y:model.y()+model.height+(model.rowSpacing()/2), color: model.getColor(),data:[]};
		rows.data.push([model.x()-((($scope.showDiff ? model.width : 0) + model.colSpacing)/2), -model.height*Math.random()]);
		rows.data.push([model.x()+(model.width/2), -model.height*Math.random()]);
		$scope.rows[row] = rows;
        
        for(var index=0; index < model.children.length; index++){
          row = calculatePosition(model.children[index], parseInt(column) + 1, row);          
        }
        return model.children.length === 0 ? parseInt(row) + 1 : row;
    }
    
    //Object wrapper and defaults
    var mWidth = 1280;
    var mHeight = 900;
	var eWidth = mWidth / 5 * 0.39;
	var eHeight = eWidth / 9 * 8;
    var rowSpacing = 1000;
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
		/*
		this.m = obj.m;
		this.type = obj.type;
		this.x = obj.x;
		this.y = obj.y;
		this.p = obj.p;
		this.zone = obj.zone;
		this.tags = obj.tags;
		*/
		this.data = obj;
		
		this.model;
		this.parent;
		this.children = [];
		this.links = {};
		this.zoneObj;
		this.width = eWidth;
		this.height = eHeight;
		this.handleDelete = function(){
			if(this.children.length === 0){
				for(var id in this.links){					
					delete $scope.data.links[id];
				}
				delete $scope.data.elements[this.id];
				delete $scope.elements[this.id];
				$scope.options.editElementID = undefined;
				return true;
			}else{
				alert('cannot delete, has children: ' + this.children.map(function(e){return e.model.id + '#'+ e.id;}).join(', '));
				return false;
			}
		};
		this.allLinks = function(){
			var links = {};
			if(this.parent){
				links = this.parent.allLinks();
			}
			for(var id in this.links){
				links[id] = this.links[id];
			}
			return links;
		};
		this.toggleTag = function(tag, event){
			//FIX reference
			var tags = $scope.data.elements[this.id].tags;
			var idx = tags.indexOf(tag.id);
			//ctrl force one color
			if(event.ctrlKey){
				tags.splice(0, tags.length);
				tags.push(tag.id);
			}else{
				if(idx >=0){
					 tags.splice(idx, 1);
				}else{
					tags.push(tag.id);
				}	
			}
		};
		this.getColor = function(){
			try{
				return tagById(this.data.tags[0]).color;
			}catch(e){
				return '';
			}
		};
	}
    
    function tagById(id){
		var tag;
		for(var i=0; i < $scope.data.tags.length; i++){
			tag = $scope.data.tags[i];
			if(tag.id === id) return tag;
		}
	}
    
    function Model(obj){
	  this.id = obj.id;
	  /*
      this.column = obj.c;
      this.parent = obj.p;
	  this.name = obj.name;
	  this.dname = obj.dname;
	  this.when = obj.when;
	  this.color = obj.color;
	  */
	  this.data = obj;
	  
	  this.showOld = false;
      this.children = [];
      this.elements = {};
	  this.links = {};
      this.x = function(){
        return this.column * (($scope.options.showDiff ? 2 : 1) * mWidth + this.colSpacing);
      };
      this.y = function(){
        return this.row * (mHeight + this.rowSpacing());
      };
	  this.getColor = function(){
		var color = this.data.color;
		if(!color && this.parent){
			color = this.parent.getColor();
		}
		return color;
	  };
	  this.colSpacing = colSpacing;
	  this.rowSpacing = function(){
		  return $scope.options.showChart ? rowSpacing + 700 : rowSpacing;
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
          if('A' === element.data.type){
            elements[id] = element;
          } else if('D' === element.data.type){
            if(element.parent){
              //delete linked element
			  //matching done in data
              //element.data.x = element.parent.data.x;
              //element.data.y = element.parent.data.y;
              //element.data.zone = element.parent.zone;
              delete elements[element.parent.id];
            }
          } else if('C' === element.data.type || 'I' === element.data.type){
            //replace linked element with current
            if(element.parent){
              delete elements[element.parent.id];
              //element.x = element.parent.x;
              //element.y = element.parent.y;
              //element.zone = element.parent.zone;
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
			links[id] = this.links[id];
		}
		for(var id in this.elements){
			var element = this.elements[id];
			//only add link if connected elements not deleted in this model
			if('D' === element.data.type){
				for(var lid in element.allLinks()){
					delete links[lid];
				}
			}
		}
		return links;
	  };
	  this.handleDelete = function(){
			if(this.children.length === 0){
				var canDelete = true;
				for(var key in this.elements){
					canDelete = canDelete && this.elements[key].handleDelete();
				}
				if(canDelete){
					delete $scope.data.models[this.id];
					delete $scope.models[this.id];
					$scope.options.editModelID = undefined;
					return true;
				}else{
					//TODO better error
					alert('delete failed try deleting remaining elements first');
					return false;
				}
			}else{
				alert('cannot delete, has children: ' + this.children.map(function(e){return e.model.id;}).join(', '));
				return false;
			}
		};
	this.addStep = function(){
		var id = uuid4.generate();
		$scope.data.models[id] = {id: id, p: this.id};
		$scope.options.editModelID = id;
		$scope.options.transitionTo = id;
	};
	
	this.importJSON = function(){
		var json = JSON.parse($scope.importJsonSrc);
		for(var i=0; i<json.length; i++){
			var e = json[i];
			delete e.bmo;
			delete e.color;
			e.m = this.id;
			e.type = 'A';
			$scope.data.elements[e.id] = e;
		}
	};
	this.getParents = function(){
		var parents = [this.id];
		if(this.parent){
			parents = this.parent.getParents().concat(parents);
		}
		return parents;
	}
	
    }
  }]);