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


angular.module('bmlayersApp')
  .controller('MainCtrl', function ($scope) {
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
			id: 's3',
			type: 'tag',
			color: 'green'
		},{
			id:'change',
			type: '???',
			attributes: [
				{
					name: 'type',
					isUnique: true,
					values : ['add', 'remove', 'lower', 'raise', 'widen', 'focus'],
				}
			]
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
		zones:[
			{
				x:0,
				y:0,
				width: 300,
				height: 500,
				name: 'test',
				type: 'bmo.type',
				value: 'cs'
			},
			{
				x:300,
				y:0,
				width: 300,
				height: 500,
				name: 'test2',
				type: 'bmo.type',
				value: 'vp'
			},
		],
		elements: [
			{
				name:'test',
				bmo: {
					type: 'cs'
				},
				color:{
					color: 'orange'
				},
				l_g1: true,
				l_test: {
					test: 'todo'
				},
				l_note: {
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
				type: '',
				x:0,
				y:0,
				bmo: {
					type: 'vp'
				}
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


  });
