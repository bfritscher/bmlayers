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


var bmc = {
    width: 1000,
    height: 1000
};

angular.module('bmlayersApp')
  .controller('MainCtrl', function ($scope, $timeout) {
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
		for(var i=0; i < $scope.layers.length; i++){
			var l = $scope.layers[i];
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
        return $scope.layers[1].tags;
    };

	$scope.layers = [
		{
			id: 'color',
			type: 'one_value_from_list',
			attributes: [
				{
					name: 'color',
					isUnique: true,
					values : ['red', 'blue']
				}
			]
			
		},
        {
			id: 'tags',
			type: 'tag',
            tags:[
                {
                    name: 's3',
                    color: 'green'
                },
                {
                    name: 'normal',
                    color: 'yellow'
                }
            ]	
		},
		{
			id:'bmo',
			type:'one_value_from_list',
			attributes: [
				{
					name: 'type',
					isUnique: true,
					values : ['cs', 'vp', 'dc', 'cr', 'r', 'c','pn','kr', 'ka']
				}
			]
		},
		{
			id:'bmo_detail',
			type: 'values for specific component',
			attributes: [
				{
					name: 'type_detail',
					isUnique: true,
					values : ['replication', 'innovation'],
					filter: "bmo.type=='vp'"
				}
			]
		},
		{
			id:'test',
			type:'one_value_from_list',
			attributes: [
				{
					name: 'state',
					isUnique: true,
					values : ['testing', 'pass', 'fail'],
				},
				{
					name: 'critical',
					isUnique: true,
					values: [false, true]			
				}
			]
		},
		{
			id: 'notes',
			type:'one_value_openformat',
			attributes: [
				{
					name: 'note',
					isUnique: true,
					values : '',
				}
			]
		},
		{
			id:'change',
			type: '???',
			attributes: [
				{
					name: 'type',
					isUnique: true,
					values : ['add', 'remove', 'lower', 'raise', 'widen', 'focus'],
				}
			]
		},
        {
            id:'errors',
            type: '???',
            visible: true
        }
		//scale?
		//n attributes of defines names
		//n attributes unknown name?
		
		//rule help max n words value.match(/\w+/g).length;
	];
	
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
			value: 'ch'
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
				y:0,
                errors:[]
			},
			{
				name:'test2',
				type: '',
				x:0,
				y:0,
				bmo: {
					type: 'vp'
				},
                errors:[]
			},
			{
				name: 'no time to buy',
				vpc: {
					type: 'pain',
					parent: 'id of a bmo.type=cs' //TODO reference?
				},
                errors:[]
			}
		]
	};
    
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
    
    $scope.checkRules = function(){
      var points = 0;
      var rules = [];
      //reset errors on elements
      $scope.model.elements.forEach(function(e){
          e.errors = [];
      });
      $scope.rules.forEach(function(rule){
          rule.check(); 
      });
    };
    
    $scope.$watch('model', $scope.checkRules, true);
    $scope.rules = [
        new Rule({
            title: 'All block of the model should be used',
            points: 10,
            when: function(){
                return $scope.model.elements.reduce(function(sum, e){
                    if(e.bmo){
                        sum++;
                    }
                    return sum;
                }, 0) >= 9;
            },
            rule: function(rule){
                var types = [];
                $scope.model.elements.forEach(function(e){
                    //types.remove(e.bmo.type)                    
                });
                types.forEach(function(t){
                   rule.addError(t);
                });
            }
        }),
        new Rule({
            appliesTo: 'elements.bmo', //all elements,
            title: 'Elements are keywords',
            fix: 'Reformulate title as keywords',
            when: function(){return true;},
            rule: function(rule){
                $scope.model.elements.forEach(function(e){
                    if(e.name.split(' ').length > 4){
                        rule.addError(e);
                        //TODO??
                        e.errors.push(rule.fix);
                    }
                });
            }
        }),
        new Rule({
            appliesTo: 'layers.tags.bmo',
            title: 'Customer Perspective parts are complete',
            when: function(){return true;},//'layer.bmo.count > 3?',
            rule: function(rule){
                $scope.model.elements.forEach(function(e){
     
                });
            }
        })
    
    ];

  });
function RuleFail(obj){
     this.obj = obj;
     //Types?
}

function Rule(obj){
    this.title = 'norule';
    this.category = '';
    this.fix = '';
    this.points = 0;
    
    obj = obj || {};
    angular.extend(this, obj)
    
    this.valid = false;
    this.errors = [];
    this.active = false;
};
Rule.prototype.check = function(){
    this.active = this.when();
    this.valid = false;
    if(this.active){
        this.errors = [];
        this.rule(this);
        this.valid =  this.errors.length == 0;
    }
};
Rule.prototype.when = function when(){
    this.active = false;
};
Rule.prototype.rule = function rule(){
    return false;
};
Rule.prototype.addError = function addError(obj){
    this.errors.push(new RuleFail(obj));
};