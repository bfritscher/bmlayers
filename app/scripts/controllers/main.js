'use strict';

//property layer list unique vs multi select?
var l_bmo = {
	type: ['cs','vp', 'dc']

};

var l_test = {
	test: ['todo', 'fail', 'pass']
};

//property layer any
var l_note = {
	note: '' //regex?, type validation?
}

//property layer multiple values?

//linked layers?


// any additional variable? calc layer => calc variable with objects
// but if want to do calc on values of other namespaces?

//grouping layer
var l_g1 = {

}

var colors = ['#34b27d','#dbdb57', '#e09952', '#cb4d4d', '#93c', '#4d77cb'];

var bmc = {
    width: 100,
    height: 100
};

angular.module('bmlayersApp')
  .controller('MainCtrl', function ($scope, $timeout, Rules, layers, filterFilter, localStorageService) {
	
	$scope.z = {type:'bmo.type', value:'cs'};
	
    $scope.layers = layers;
	
	$scope.filterType = function(type, value){
		return function(e){
			/*
			var typenoequal = type.replace("==","").replace("!=","");
			if(typenoequal.indexOf('=') >= 0) return false;
			*/
            if(type === '' && value === ''){
                return true;
            }
			try{
				return eval('e.' + type) == value;
			}
			catch(ex){
				return false;
			}
			
		};
	}
	
    $scope.formatErrors = function(es){
        return es.reduce(function(s, e){ return s + "\n - " + e}, "");
    };
    
	$scope.activeLayerAttributes = function(e){
		var attributes = [];
		for(var id in $scope.layers){
			var l = $scope.layers[id];
			if(l.visible && l.attributes){
				for(var j=0; j < l.attributes.length; j++){
					var a = l.attributes[j];
					if(!a.filter || eval('e.' + a.filter)){
						if(!e.hasOwnProperty(l.id)){
							e[l.id] = {};
						}
						a.layerId = l.id;
						attributes.push(a);
					}
				}
			}
		}
		return attributes;
	}   
    
    $scope.toggleTag = function(e, tag){
        var idx = e.tags.indexOf(tag.id);
        if(idx >=0){
             e.tags.splice(idx, 1);
        }else{
            e.tags.push(tag.id);
        }
    };
    
    $scope.removeElement = function(e){
        var idx = $scope.model.elements.indexOf(e);
        if(idx >=0) $scope.model.elements.splice(idx, 1);
    };
    

    $scope.tags = function(){
        return $scope.layers.tags.tags;
    };
	
	$scope.views = {
		v_bmo: {
			zones:{
				
			}
		}
	};

	$scope.model = {
		zones:{'partner_network':{
			width: bmc.width/5,
			height: bmc.height/4*3,
			top:0,
			left:0,
			canvas: 'bmc',
            type: 'bmo.type',
			value: 'pn'
		},
		'key_activities':{
			width: bmc.width/5,
			height: bmc.height/8*3,
			top:0,
			left: bmc.width/5,
			canvas: 'bmc',
            type: 'bmo.type',
			value: 'ka'
		},
		'key_resources':{
			width: bmc.width/5,
			height: bmc.height/8*3,
			top:bmc.height/8*3,
			left: bmc.width/5,
			canvas: 'bmc',
            type: 'bmo.type',
			value: 'kr'
		},
		'cost_structure':{
			width: bmc.width/2,
			height: bmc.height/4,
			top:bmc.height/8*6,
			left:0,
			canvas: 'bmc',
            type: 'bmo.type',
			value: 'c'
		},
		'value_proposition':{
			width: bmc.width/5,
			height: bmc.height/8*6,
			top:0,
			left:bmc.width/5*2,
			canvas: 'bmc',
            type: 'bmo.type',
			value: 'vp'
		},
		'customer_segments':{
			width: bmc.width/5,
			height: bmc.height/8*6,
			top:0,
			left:bmc.width/5*4,
			canvas: 'bmc',
            type: 'bmo.type',
			value: 'cs'
		},
		'customer_relationship':{
			width: bmc.width/5,
			height: bmc.height/8*3,
			top:0,
			left:bmc.width/5*3,
			canvas: 'bmc',
            type: 'bmo.type',
			value: 'cr'
		},
		'channels':{
			width: bmc.width/5,
			height: bmc.height/8*3,
			top:bmc.height/8*3,
			left:bmc.width/5*3,
			canvas: 'bmc',
            type: 'bmo.type',
			value: 'dc'
		},
		'revenue_streams':{
			width: bmc.width/2,
			height: bmc.height/8*2,
			top:bmc.height/8*6,
			left:bmc.width/2,
			canvas: 'bmc',
            type: 'bmo.type',
			value: 'r'
		}
		},
		elements: [
			{
				name:'test sd asdf asdf asd f',
				bmo: {
					type: 'cs'
				},
				color:{
					color: 'orange'
				},
				l_g1: true,
                tags: [
                    'c0'
                ],
				test: {
					state: 'testing',
                    critical: true
				},
				notes: {
					note: 'Hello todo...'
				},
				v_bmo:{
					x:0,
					y:0
				},
				x:0,
				y:0
			},
			{
				name:'test2',
				x:0,
				y:0,
				bmo: {
					type: 'vp'
				},
                tags:[]
			},
            {
                name: 'channel1',
                bmo:{
                    type: 'dc'
                },
                tags:[
                'c5'
                ]
            },
            {
                name: 'ch2',
                bmo:{
                    type: 'dc'
                },
                tags:[
                'c5'
                ]
            },
            {
                name: 'r1',
                bmo:{
                    type: 'r'
                },
                tags:[
                'c0'
                ]
            },
			{
				name: 'no time to buy',
				vpc: {
					type: 'pain',
					parent: 'id of a bmo.type=cs' //TODO reference?
				}
			}
		]
	};
    
    var elements = localStorageService.get('elements');
	if(elements != "null"){
		$scope.model.elements = elements;
	}
	$scope.$watch('model.elements', function(){
		 localStorageService.add('elements', $scope.model.elements);
	}, true);
    
    
    $scope.zoom = function(z, elements){
        if(!z.zoomed && ((z.value != 'cs' && z.value != 'pn' && z.value != 'vp' && elements.length > 4) || elements.length > 7)){
            if(z.top > 74){
                z.height = z.height * 2;
                z.top = z.top - 25;
            }else{
                z.width = z.width * 2;
                z.left = z.left -10;
            }
            z.zoomed = true;
        }
    };
    $scope.dezoom = function(z){
        if(z.zoomed){
            if(z.top > 49){
                z.height = z.height / 2;
                z.top = z.top + 25;
            }else{
                z.width = z.width / 2;
                z.left = z.left + 10;
            }
            z.zoomed = false;
        }
    };
	
	$scope.importJson = function(){
		try{
			$scope.model.elements = JSON.parse($scope.importJsonSrc);
		}catch(e){
			console.log(e);
		}
	}
    
    $scope.displayRuleCategory = function(cat, first){
        var display = cat !== $scope.currentRuleCategory;
        if(first){ display = true;}
        
        $scope.currentRuleCategory = cat;
        return display;
    }
    
    $scope.addElementToZone = function(zone){
          //TODO view
          var e = {
              name: 'New...',
              tags:[]
          };
          addProperty(e, zone.type, zone.value);
          $scope.model.elements.push(e);
    };
    
    function addProperty(obj, properties, value){
        properties = properties.split('.');
        var property = properties.shift();
        obj[property] = {};
        if(properties.length === 0){
            obj[property] = value;
        }else{
            addProperty(obj[property], properties.join('.'), value);
        }
    }
            
    $scope.$watch('model', function(){Rules.checkAll($scope.model);}, true);
    $scope.$watch('layers', function(){Rules.checkAll($scope.model);}, true);
    
    $scope.errorFilter = 'ok';
    $scope.errorFilterStates = {
        'actif': {active:'true'},
        'ok': {active:'true', valid: 'true'},
        'nok': {active:'true', valid: 'false'},
        'inactif': {active:'false'}
    };
    $scope.Rules = Rules;
    $scope.rules = Rules.rules();


  });
