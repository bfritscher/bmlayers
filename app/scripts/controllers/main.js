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

//http://blog.brunoscopelliti.com/internazionalization-i18n-with-angularjs

var bmc = {
    width: 1000,
    height: 1000
};

angular.module('bmlayersApp')
  .controller('MainCtrl', function ($scope, $timeout, Rules, layers) {
	
    $scope.layers = layers;
    
    $scope.addNew = function(){
		$scope.model.elements.push({x:0,y:0, name:'test'});
	};
    
    
	
	$scope.filterType = function(type, value){
		return function(e){
			/*
			var typenoequal = type.replace("==","").replace("!=","");
			if(typenoequal.indexOf('=') >= 0) return false;
			*/
			try{
				return eval('e.' + type) == value;
			}
			catch(ex){
				return false;
			}
			
		};
	}
	
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
			height: bmc.height/3*2,
			top:0,
			left:0,
			canvas: 'bmc',
            type: 'bmo.type',
			value: 'pn'
		},
		'key_activities':{
			width: bmc.width/5,
			height: bmc.height/3,
			top:0,
			left: bmc.width/5,
			canvas: 'bmc',
            type: 'bmo.type',
			value: 'ka'
		},
		'key_resources':{
			width: bmc.width/5,
			height: bmc.height/3,
			top:bmc.height/3,
			left: bmc.width/5,
			canvas: 'bmc',
            type: 'bmo.type',
			value: 'kr'
		},
		'cost_structure':{
			width: bmc.width/2,
			height: bmc.height/3,
			top:bmc.height/3*2,
			left:0,
			canvas: 'bmc',
            type: 'bmo.type',
			value: 'c'
		},
		'value_proposition':{
			width: bmc.width/5,
			height: bmc.height/3*2,
			top:0,
			left:bmc.width/5*2,
			canvas: 'bmc',
            type: 'bmo.type',
			value: 'vp'
		},
		'customer_segments':{
			width: bmc.width/5,
			height: bmc.height/3*2,
			top:0,
			left:bmc.width/5*4,
			canvas: 'bmc',
            type: 'bmo.type',
			value: 'cs'
		},
		'customer_relationship':{
			width: bmc.width/5,
			height: bmc.height/3,
			top:0,
			left:bmc.width/5*3,
			canvas: 'bmc',
            type: 'bmo.type',
			value: 'cr'
		},
		'channels':{
			width: bmc.width/5,
			height: bmc.height/3,
			top:bmc.height/3,
			left:bmc.width/5*3,
			canvas: 'bmc',
            type: 'bmo.type',
			value: 'dc'
		},
		'revenue_streams':{
			width: bmc.width/2,
			height: bmc.height/3,
			top:bmc.height/3*2,
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
                    's3'
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
                'dummy'
                ]
            },
            {
                name: 'ch2',
                bmo:{
                    type: 'dc'
                },
                tags:[
                'dummy'
                ]
            },
            {
                name: 'r1',
                bmo:{
                    type: 'r'
                },
                tags:[
                's3'
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
    
    $scope.displayRuleCategory = function(cat){
        var display = cat !== $scope.currentRuleCategory;
        $scope.currentRuleCategory = cat;
        return display;
    }
    
    $scope.addElementToZone = function(zone){
          //TODO view
          var e = {
              name: 'New...',
              
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
    $scope.rules = Rules.rules();

  });
